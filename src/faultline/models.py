"""Domain models shared by FAULTLINE's collectors, engine, and adapters."""

from __future__ import annotations

from dataclasses import dataclass
from dataclasses import field as dataclass_field
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any


class ChangeKind(StrEnum):
    FIELD_REMOVED = "field_removed"
    TYPE_CHANGED = "type_changed"
    NULL_RATE_SPIKE = "null_rate_spike"
    FRESHNESS_BREACH = "freshness_breach"
    VOLUME_ANOMALY = "volume_anomaly"


class ResponseAction(StrEnum):
    OBSERVE = "observe"
    VALIDATE = "validate"
    RETRAIN = "retrain"
    QUARANTINE = "quarantine"
    BLOCK = "block"


class MutationKind(StrEnum):
    ADD_TAG = "add_tag"
    UPDATE_DESCRIPTION = "update_description"
    SAVE_DOCUMENT = "save_document"


@dataclass(frozen=True, slots=True)
class ChangeSignal:
    source_urn: str
    kind: ChangeKind
    field: str | None = None
    before: str | float | int | None = None
    after: str | float | int | None = None
    observed_at: datetime = dataclass_field(default_factory=lambda: datetime.now(UTC))


@dataclass(frozen=True, slots=True)
class Asset:
    urn: str
    name: str
    entity_type: str
    platform: str
    owner: str | None = None
    criticality: int = 1
    lifecycle: str = "production"
    tags: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class LineageEvidence:
    asset: Asset
    hops: int
    path: tuple[str, ...]
    matched_field: str | None = None


@dataclass(frozen=True, slots=True)
class RiskFinding:
    evidence: LineageEvidence
    score: int
    reasons: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class ProposedMutation:
    kind: MutationKind
    target_urn: str
    payload: dict[str, Any]
    reason: str


@dataclass(frozen=True, slots=True)
class IncidentPlan:
    incident_id: str
    signal: ChangeSignal
    findings: tuple[RiskFinding, ...]
    action: ResponseAction
    confidence: float
    summary: str
    mutations: tuple[ProposedMutation, ...]


@dataclass(slots=True)
class AppliedMutation:
    mutation: ProposedMutation
    succeeded: bool
    message: str


@dataclass(frozen=True, slots=True)
class Counterfactual:
    kind: ChangeKind
    action: ResponseAction
    peak_risk: int
    exposed_assets: int
    high_risk_assets: int
    delta_from_observed: int
