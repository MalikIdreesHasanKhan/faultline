"""Explainable blast-radius scoring and response policy."""

from __future__ import annotations

from .models import ChangeKind, ChangeSignal, LineageEvidence, ResponseAction, RiskFinding
from .policy import DEFAULT_POLICY

_BASE_RISK = {
    ChangeKind.FIELD_REMOVED: 74,
    ChangeKind.TYPE_CHANGED: 60,
    ChangeKind.NULL_RATE_SPIKE: 52,
    ChangeKind.FRESHNESS_BREACH: 44,
    ChangeKind.VOLUME_ANOMALY: 40,
}

_ENTITY_WEIGHT = {
    "MLMODEL_DEPLOYMENT": 18,
    "MLMODEL": 14,
    "MLFEATURE": 10,
    "DATASET": 4,
    "DATA_JOB": 5,
    "DASHBOARD": 5,
}


def score_finding(signal: ChangeSignal, evidence: LineageEvidence) -> RiskFinding:
    """Score a path without hidden model state and retain every contributing reason."""

    reasons = [f"{signal.kind.value} has base risk {_BASE_RISK[signal.kind]}"]
    score = _BASE_RISK[signal.kind]

    entity_bonus = _ENTITY_WEIGHT.get(evidence.asset.entity_type.upper(), 2)
    score += entity_bonus
    reasons.append(f"{evidence.asset.entity_type} exposure adds {entity_bonus}")

    criticality_bonus = max(0, min(3, evidence.asset.criticality) - 1) * 6
    if criticality_bonus:
        score += criticality_bonus
        reasons.append(
            f"tier-{evidence.asset.criticality} criticality adds {criticality_bonus}"
        )

    hop_discount = max(0, evidence.hops - 1) * 5
    if hop_discount:
        score -= hop_discount
        reasons.append(f"{evidence.hops}-hop distance subtracts {hop_discount}")

    if signal.field and evidence.matched_field == signal.field:
        score += 12
        reasons.append(f"column lineage confirms dependency on {signal.field!r}")

    if evidence.asset.lifecycle.lower() == "production":
        score += 4
        reasons.append("production lifecycle adds 4")

    score = max(0, min(100, score))
    return RiskFinding(evidence=evidence, score=score, reasons=tuple(reasons))


def choose_response(findings: list[RiskFinding]) -> tuple[ResponseAction, float]:
    """Choose the safest action from the highest-evidence downstream exposure."""
    return DEFAULT_POLICY.choose(findings)
