from __future__ import annotations

import pytest

from faultline.mcp_gateway import (
    DataHubMCPConfig,
    DataHubMCPGateway,
    _extract_between_path,
    _extract_path,
    _lineage_records,
    _mutation_call,
)
from faultline.models import Asset, MutationKind, ProposedMutation


def test_official_datahub_lineage_shape_is_parsed() -> None:
    payload = {
        "downstreams": {
            "searchResults": [
                {
                    "entity": {
                        "urn": "urn:li:mlModel:churn",
                        "type": "MLMODEL",
                        "name": "churn",
                    },
                    "degree": 2,
                    "lineageColumns": ["customer_value"],
                }
            ]
        }
    }

    records = _lineage_records(payload, direction="downstreams")
    assert records[0]["degree"] == 2
    assert records[0]["entity"]["type"] == "MLMODEL"


def test_official_mutation_argument_names_are_used() -> None:
    tag = ProposedMutation(
        kind=MutationKind.ADD_TAG,
        target_urn="urn:li:mlModel:churn",
        payload={"tag": "faultline-at-risk"},
        reason="test",
    )
    name, args = _mutation_call(tag)
    assert name == "add_tags"
    assert args == {
        "entity_urns": ["urn:li:mlModel:churn"],
        "tag_urns": ["urn:li:tag:faultline-at-risk"],
    }

    document = ProposedMutation(
        kind=MutationKind.SAVE_DOCUMENT,
        target_urn="urn:li:dataset:orders",
        payload={
            "title": "Incident",
            "contents": "Evidence",
            "related_assets": ["urn:li:dataset:orders"],
        },
        reason="test",
    )
    name, args = _mutation_call(document)
    assert name == "save_document"
    assert args["document_type"] == "Analysis"
    assert args["content"] == "Evidence"


def test_lineage_paths_preserve_intermediate_assets() -> None:
    record = {
        "paths": [
            {
                "path": [
                    {"urn": "urn:li:dataset:orders"},
                    {"urn": "urn:li:mlFeature:customer_value"},
                    {"urn": "urn:li:mlModel:churn"},
                ]
            }
        ]
    }
    assert _extract_path(
        record,
        "urn:li:dataset:orders",
        "urn:li:mlModel:churn",
    ) == (
        "urn:li:dataset:orders",
        "urn:li:mlFeature:customer_value",
        "urn:li:mlModel:churn",
    )


def test_column_path_is_collapsed_to_parent_asset_urns() -> None:
    payload = {
        "paths": [
            {
                "path": [
                    {
                        "urn": "urn:li:schemaField:orders.total",
                        "parent": {"urn": "urn:li:dataset:orders"},
                    },
                    {
                        "urn": "urn:li:schemaField:features.value",
                        "parent": {"urn": "urn:li:dataset:features"},
                    },
                    {"urn": "urn:li:mlModel:churn"},
                ]
            }
        ]
    }
    assert _extract_between_path(
        payload,
        "urn:li:dataset:orders",
        "urn:li:mlModel:churn",
    ) == (
        "urn:li:dataset:orders",
        "urn:li:dataset:features",
        "urn:li:mlModel:churn",
    )


class StubMCPGateway(DataHubMCPGateway):
    def __init__(self, payload, tags=()) -> None:
        super().__init__(DataHubMCPConfig("http://unused.test/mcp"))
        self.payload = payload
        self.tags = tags

    async def _call(self, name, arguments):
        return self.payload

    async def get_asset(self, urn):
        return Asset(urn, "churn", "MLMODEL", "mlflow", tags=self.tags)


@pytest.mark.asyncio
async def test_mutation_false_payload_fails_closed() -> None:
    gateway = StubMCPGateway({"success": False, "message": "mutations disabled"})
    mutation = ProposedMutation(
        kind=MutationKind.ADD_TAG,
        target_urn="urn:li:mlModel:churn",
        payload={"tag": "faultline-at-risk"},
        reason="test",
    )
    result = await gateway.apply(mutation)

    assert not result.succeeded
    assert "mutations disabled" in result.message


@pytest.mark.asyncio
async def test_accepted_tag_is_verified_with_read_after_write() -> None:
    gateway = StubMCPGateway(
        {"success": True},
        tags=("urn:li:tag:faultline-at-risk",),
    )
    mutation = ProposedMutation(
        kind=MutationKind.ADD_TAG,
        target_urn="urn:li:mlModel:churn",
        payload={"tag": "faultline-at-risk"},
        reason="test",
    )
    result = await gateway.apply(mutation)

    assert result.succeeded
    assert "verified tag" in result.message
