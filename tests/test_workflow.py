from __future__ import annotations

import pytest

from faultline.agent import FaultlineAgent
from faultline.gateway import MemoryDataHubGateway
from faultline.models import Asset, ChangeKind, MutationKind, ResponseAction
from faultline.policy import ResponsePolicy
from faultline.receipts import plan_dict, receipt_markdown
from faultline.scenario import DEPLOYMENT, retail_churn_scenario


@pytest.mark.asyncio
async def test_investigation_traces_to_deployment_and_proposes_write_back() -> None:
    gateway, signal = retail_churn_scenario()
    plan = await FaultlineAgent(gateway).investigate(signal)

    assert plan.action is ResponseAction.BLOCK
    assert any(finding.evidence.asset.urn == DEPLOYMENT for finding in plan.findings)
    assert any(mutation.kind is MutationKind.SAVE_DOCUMENT for mutation in plan.mutations)
    assert all(finding.reasons for finding in plan.findings)


@pytest.mark.asyncio
async def test_mutations_require_explicit_approval() -> None:
    gateway, signal = retail_churn_scenario()
    agent = FaultlineAgent(gateway)
    plan = await agent.investigate(signal)

    with pytest.raises(PermissionError):
        await agent.execute(plan)
    assert gateway.applied == []


@pytest.mark.asyncio
async def test_approved_mutations_are_applied_in_order() -> None:
    gateway, signal = retail_churn_scenario()
    agent = FaultlineAgent(gateway)
    plan = await agent.investigate(signal)
    results = await agent.execute(plan, approved=True)

    assert len(results) == len(plan.mutations)
    assert gateway.applied == list(plan.mutations)


@pytest.mark.asyncio
async def test_counterfactuals_replay_every_failure_mode() -> None:
    gateway, signal = retail_churn_scenario()
    simulations = await FaultlineAgent(gateway).counterfactuals(signal)

    assert {item.kind for item in simulations} == set(ChangeKind)
    observed = next(item for item in simulations if item.kind is signal.kind)
    removed = next(item for item in simulations if item.kind is ChangeKind.FIELD_REMOVED)
    assert observed.delta_from_observed == 0
    assert removed.peak_risk >= observed.peak_risk


@pytest.mark.asyncio
async def test_policy_thresholds_control_action_and_write_back() -> None:
    gateway, signal = retail_churn_scenario()
    strict = ResponsePolicy(block_at=101, quarantine_at=101, retrain_at=101)
    plan = await FaultlineAgent(gateway, policy=strict).investigate(signal)

    assert plan.action is ResponseAction.VALIDATE


@pytest.mark.asyncio
async def test_receipt_contains_auditable_evidence() -> None:
    gateway, signal = retail_churn_scenario()
    agent = FaultlineAgent(gateway)
    plan = await agent.investigate(signal)
    receipt = receipt_markdown(plan, agent.policy)

    assert plan.incident_id in receipt
    assert "Reasoning ledger" in receipt
    assert "order_total" in receipt
    assert len(plan_dict(plan, agent.policy)["receipt_sha256"]) == 64


@pytest.mark.asyncio
async def test_lineage_traversal_is_cycle_safe() -> None:
    first = Asset("urn:first", "first", "DATASET", "test")
    second = Asset("urn:second", "second", "MLMODEL", "test")
    gateway = MemoryDataHubGateway(
        [first, second],
        [("urn:first", "urn:second"), ("urn:second", "urn:first")],
    )
    evidence = await gateway.downstream_lineage("urn:first")

    assert [item.asset.urn for item in evidence] == ["urn:second"]


def test_policy_loads_from_toml(tmp_path) -> None:
    policy_file = tmp_path / "policy.toml"
    policy_file.write_text(
        "[response]\nblock_at = 97\nwrite_back_at = 81\n",
        encoding="utf-8",
    )
    policy = ResponsePolicy.from_toml(policy_file)

    assert policy.block_at == 97
    assert policy.write_back_at == 81
    assert policy.validate_at == 50
