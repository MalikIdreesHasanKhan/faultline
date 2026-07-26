from __future__ import annotations

import httpx
import pytest

from faultline.web import app


@pytest.mark.asyncio
async def test_judge_console_end_to_end() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://faultline.test",
    ) as client:
        assert (await client.get("/")).status_code == 200
        assert (await client.get("/healthz")).json()["status"] == "ok"

        response = await client.post("/api/investigate")
        assert response.status_code == 200
        incident = response.json()
        assert len(incident["findings"]) == 5
        assert len(incident["counterfactuals"]) == 5
        assert incident["decision"]["action"] == "block"

        alternate = await client.post(
            "/api/investigate",
            json={"kind": "freshness_breach"},
        )
        assert alternate.status_code == 200
        assert alternate.json()["signal"]["kind"] == "freshness_breach"
        assert alternate.json()["decision"]["action"] == "retrain"
        incident = (await client.post("/api/investigate")).json()

        refused = await client.post("/api/execute", json={"confirmation": "yes please"})
        assert refused.status_code == 403

        approved = await client.post(
            "/api/execute",
            json={"confirmation": f"APPLY {incident['incident_id']}"},
        )
        assert approved.status_code == 200
        assert approved.json()["status"] == "applied"

        repeated = await client.post(
            "/api/execute",
            json={"confirmation": f"APPLY {incident['incident_id']}"},
        )
        assert repeated.status_code == 200
        assert repeated.json()["status"] == "already_applied"

        receipt = await client.get("/api/receipt.md")
        assert receipt.status_code == 200
        assert incident["incident_id"] in receipt.text
