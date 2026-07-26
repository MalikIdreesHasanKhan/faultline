"""The FAULTLINE incident workflow."""

from __future__ import annotations

import hashlib
import json
from dataclasses import asdict

from .gateway import DataHubGateway
from .models import (
    AppliedMutation,
    ChangeKind,
    ChangeSignal,
    Counterfactual,
    IncidentPlan,
    MutationKind,
    ProposedMutation,
    ResponseAction,
)
from .policy import DEFAULT_POLICY, ResponsePolicy
from .risk import score_finding


class FaultlineAgent:
    """Collect evidence, plan a response, and perform governed DataHub write-back."""

    def __init__(
        self, gateway: DataHubGateway, *, policy: ResponsePolicy = DEFAULT_POLICY
    ) -> None:
        self.gateway = gateway
        self.policy = policy

    async def investigate(self, signal: ChangeSignal) -> IncidentPlan:
        source = await self.gateway.get_asset(signal.source_urn)
        lineage = await self.gateway.downstream_lineage(
            signal.source_urn,
            field=signal.field,
        )
        findings = sorted(
            (score_finding(signal, item) for item in lineage),
            key=lambda item: item.score,
            reverse=True,
        )
        action, confidence = self.policy.choose(findings)

        fingerprint = json.dumps(
            {
                "source": signal.source_urn,
                "kind": signal.kind.value,
                "field": signal.field,
                "observed_at": signal.observed_at.isoformat(),
            },
            sort_keys=True,
        ).encode()
        incident_id = f"FLT-{hashlib.sha256(fingerprint).hexdigest()[:8].upper()}"
        exposed_models = sum(
            item.evidence.asset.entity_type.upper() in {"MLMODEL", "MLMODEL_DEPLOYMENT"}
            for item in findings
        )
        summary = (
            f"{source.name}: {signal.kind.value} exposes {len(findings)} downstream "
            f"assets, including {exposed_models} model or deployment assets. "
            f"Recommended response: {action.value}."
        )

        mutations = self._propose_mutations(
            incident_id=incident_id,
            signal=signal,
            action=action,
            summary=summary,
            findings=findings,
        )
        return IncidentPlan(
            incident_id=incident_id,
            signal=signal,
            findings=tuple(findings),
            action=action,
            confidence=confidence,
            summary=summary,
            mutations=tuple(mutations),
        )

    async def counterfactuals(self, signal: ChangeSignal) -> list[Counterfactual]:
        """Replay the same lineage under every supported change type."""

        lineage = await self.gateway.downstream_lineage(
            signal.source_urn,
            field=signal.field,
        )
        observed = max(
            (score_finding(signal, item).score for item in lineage),
            default=0,
        )
        simulations: list[Counterfactual] = []
        for kind in ChangeKind:
            alternate = ChangeSignal(
                source_urn=signal.source_urn,
                kind=kind,
                field=signal.field,
                before=signal.before,
                after=signal.after,
                observed_at=signal.observed_at,
            )
            findings = [score_finding(alternate, item) for item in lineage]
            action, _ = self.policy.choose(findings)
            peak = max((finding.score for finding in findings), default=0)
            simulations.append(
                Counterfactual(
                    kind=kind,
                    action=action,
                    peak_risk=peak,
                    exposed_assets=len(findings),
                    high_risk_assets=sum(
                        finding.score >= self.policy.write_back_at for finding in findings
                    ),
                    delta_from_observed=peak - observed,
                )
            )
        return simulations

    async def execute(
        self, plan: IncidentPlan, *, approved: bool = False
    ) -> list[AppliedMutation]:
        if not approved:
            raise PermissionError(
                "FAULTLINE will not mutate DataHub until the incident plan is approved."
            )
        results: list[AppliedMutation] = []
        for mutation in plan.mutations:
            result = await self.gateway.apply(mutation)
            results.append(result)
            if not result.succeeded:
                break
        return results

    def _propose_mutations(
        self,
        *,
        incident_id: str,
        signal: ChangeSignal,
        action: ResponseAction,
        summary: str,
        findings: list,
    ) -> list[ProposedMutation]:
        exposed = [
            finding
            for finding in findings
            if finding.score >= self.policy.write_back_at
            or finding.evidence.asset.entity_type.upper() == "MLMODEL_DEPLOYMENT"
        ]
        mutations = [
            ProposedMutation(
                kind=MutationKind.ADD_TAG,
                target_urn=finding.evidence.asset.urn,
                payload={"tag": "faultline-at-risk", "incident_id": incident_id},
                reason=f"risk score {finding.score} requires visible catalog context",
            )
            for finding in exposed
        ]
        report = {
            "incident_id": incident_id,
            "summary": summary,
            "recommended_action": action.value,
            "signal": asdict(signal),
            "evidence": [
                {
                    "urn": finding.evidence.asset.urn,
                    "asset": finding.evidence.asset.name,
                    "score": finding.score,
                    "path": finding.evidence.path,
                    "reasons": finding.reasons,
                }
                for finding in findings
            ],
        }
        mutations.append(
            ProposedMutation(
                kind=MutationKind.SAVE_DOCUMENT,
                target_urn=signal.source_urn,
                payload={
                    "title": f"{incident_id}: ML lineage blast-radius report",
                    "contents": json.dumps(report, indent=2, default=str),
                    "related_assets": [signal.source_urn]
                    + [finding.evidence.asset.urn for finding in findings],
                },
                reason="persist the evidence and decision for humans and future agents",
            )
        )
        return mutations
