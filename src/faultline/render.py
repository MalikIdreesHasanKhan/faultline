"""Human-readable rendering for the CLI, README examples, and demo recording."""

from __future__ import annotations

from .models import AppliedMutation, IncidentPlan


def render_plan(plan: IncidentPlan) -> str:
    lines = [
        "",
        "FAULTLINE // ML INCIDENT COMMAND",
        f"{plan.incident_id}  action={plan.action.value.upper()}  "
        f"confidence={plan.confidence:.0%}",
        "",
        plan.summary,
        "",
        "BLAST RADIUS",
    ]
    for finding in plan.findings:
        asset = finding.evidence.asset
        lines.append(
            f"  {finding.score:>3}/100  {asset.entity_type:<18} {asset.name}"
        )
        lines.append(f"           {' -> '.join(finding.evidence.path)}")
        for reason in finding.reasons:
            lines.append(f"           · {reason}")
    lines.extend(["", "GOVERNED WRITE-BACK (PREVIEW)"])
    for index, mutation in enumerate(plan.mutations, start=1):
        lines.append(
            f"  {index}. {mutation.kind.value:<18} {mutation.target_urn}"
        )
        lines.append(f"     {mutation.reason}")
    lines.append("")
    return "\n".join(lines)


def render_results(results: list[AppliedMutation]) -> str:
    lines = ["WRITE-BACK RESULTS"]
    for result in results:
        status = "OK" if result.succeeded else "FAILED"
        lines.append(
            f"  [{status}] {result.mutation.kind.value}: {result.message}"
        )
    return "\n".join(lines)
