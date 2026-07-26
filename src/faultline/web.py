"""FastAPI judge console for the FAULTLINE workflow."""

from __future__ import annotations

import os
from dataclasses import asdict, replace
from pathlib import Path
from typing import Annotated

from fastapi import Body, FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .agent import FaultlineAgent
from .gateway import DataHubGateway
from .mcp_gateway import DataHubMCPConfig, DataHubMCPGateway
from .models import AppliedMutation, ChangeKind, ChangeSignal, IncidentPlan
from .policy import DEFAULT_POLICY, ResponsePolicy
from .receipts import plan_dict, receipt_markdown
from .scenario import retail_churn_scenario

STATIC = Path(__file__).with_name("static")

app = FastAPI(
    title="FAULTLINE",
    description="DataHub-native ML incident blast-radius command.",
    version="0.2.0",
)
app.mount("/static", StaticFiles(directory=STATIC), name="static")

def _runtime() -> tuple[DataHubGateway, ChangeSignal, str]:
    url = os.environ.get("DATAHUB_MCP_URL")
    source = os.environ.get("FAULTLINE_SOURCE_URN")
    if url and source:
        return (
            DataHubMCPGateway(
                DataHubMCPConfig(url=url, token=os.environ.get("DATAHUB_TOKEN"))
            ),
            ChangeSignal(
                source_urn=source,
                kind=ChangeKind(os.environ.get("FAULTLINE_CHANGE_KIND", "type_changed")),
                field=os.environ.get("FAULTLINE_FIELD"),
                before=os.environ.get("FAULTLINE_BEFORE"),
                after=os.environ.get("FAULTLINE_AFTER"),
            ),
            "datahub-mcp",
        )
    gateway, signal = retail_churn_scenario()
    return gateway, signal, "credential-free-demo"


_gateway, _signal, _mode = _runtime()
_policy_path = os.environ.get("FAULTLINE_POLICY")
_agent = FaultlineAgent(
    _gateway,
    policy=ResponsePolicy.from_toml(_policy_path) if _policy_path else DEFAULT_POLICY,
)
_active_plan: IncidentPlan | None = None
_completed: dict[str, list[AppliedMutation]] = {}


class InvestigationRequest(BaseModel):
    kind: ChangeKind | None = None


@app.get("/", include_in_schema=False)
async def index() -> FileResponse:
    return FileResponse(STATIC / "index.html")


@app.get("/healthz")
async def health() -> dict[str, str]:
    return {"status": "ok", "mode": _mode}


@app.post("/api/investigate")
async def investigate(request: InvestigationRequest | None = None) -> JSONResponse:
    global _active_plan
    signal = replace(_signal, kind=request.kind) if request and request.kind else _signal
    _active_plan = await _agent.investigate(signal)
    payload = plan_dict(_active_plan, _agent.policy)
    payload["counterfactuals"] = [
        asdict(item) for item in await _agent.counterfactuals(signal)
    ]
    payload["source"] = asdict(await _gateway.get_asset(signal.source_urn))
    payload["mode"] = _mode
    payload["timeline"] = [
        {"at": "09:41:17", "event": "Schema tremor detected", "state": "signal"},
        {"at": "09:41:18", "event": "Column lineage confirmed", "state": "evidence"},
        {"at": "09:41:19", "event": "Blast radius ranked", "state": "decision"},
        {"at": "09:41:20", "event": "Governed write-back staged", "state": "approval"},
    ]
    return JSONResponse(jsonable_encoder(payload))


@app.post("/api/execute")
async def execute(
    confirmation: Annotated[str, Body(embed=True)],
) -> dict[str, object]:
    if _active_plan is None:
        raise HTTPException(409, "Run an investigation first.")
    expected = f"APPLY {_active_plan.incident_id}"
    if confirmation.strip().upper() != expected:
        raise HTTPException(403, f"Type {expected!r} to authorize catalog writes.")
    if _active_plan.incident_id in _completed:
        previous = _completed[_active_plan.incident_id]
        return {
            "incident_id": _active_plan.incident_id,
            "status": "already_applied",
            "results": [asdict(item) for item in previous],
        }
    results = await _agent.execute(_active_plan, approved=True)
    if all(item.succeeded for item in results):
        _completed[_active_plan.incident_id] = results
    return {
        "incident_id": _active_plan.incident_id,
        "status": "applied" if all(item.succeeded for item in results) else "partial",
        "results": [asdict(item) for item in results],
    }


@app.get("/api/receipt.md", response_class=PlainTextResponse)
async def download_receipt() -> PlainTextResponse:
    if _active_plan is None:
        raise HTTPException(409, "Run an investigation first.")
    return PlainTextResponse(
        receipt_markdown(_active_plan, _agent.policy),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{_active_plan.incident_id.lower()}-receipt.md"'
            )
        },
        media_type="text/markdown",
    )
