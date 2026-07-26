"""Auditable policy-as-code for FAULTLINE decisions."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    import tomllib
except ModuleNotFoundError:  # pragma: no cover - Python 3.10 fallback
    import tomli as tomllib  # type: ignore[no-redef]

from .models import ResponseAction, RiskFinding


@dataclass(frozen=True, slots=True)
class ResponsePolicy:
    validate_at: int = 50
    retrain_at: int = 70
    quarantine_at: int = 82
    block_at: int = 92
    write_back_at: int = 70

    @classmethod
    def from_toml(cls, path: str | Path) -> ResponsePolicy:
        with Path(path).open("rb") as stream:
            values = tomllib.load(stream).get("response", {})
        allowed = set(cls.__dataclass_fields__)
        return cls(**{key: int(value) for key, value in values.items() if key in allowed})

    def choose(self, findings: list[RiskFinding]) -> tuple[ResponseAction, float]:
        if not findings:
            return ResponseAction.OBSERVE, 0.55

        maximum = max(finding.score for finding in findings)
        confirmed = sum(finding.evidence.matched_field is not None for finding in findings)
        confidence = min(0.99, 0.62 + confirmed * 0.07 + len(findings) * 0.02)
        if maximum >= self.block_at:
            return ResponseAction.BLOCK, confidence
        if maximum >= self.quarantine_at:
            return ResponseAction.QUARANTINE, confidence
        if maximum >= self.retrain_at:
            return ResponseAction.RETRAIN, confidence
        if maximum >= self.validate_at:
            return ResponseAction.VALIDATE, confidence
        return ResponseAction.OBSERVE, confidence

    def as_dict(self) -> dict[str, Any]:
        return {
            "validate_at": self.validate_at,
            "retrain_at": self.retrain_at,
            "quarantine_at": self.quarantine_at,
            "block_at": self.block_at,
            "write_back_at": self.write_back_at,
        }


DEFAULT_POLICY = ResponsePolicy()
