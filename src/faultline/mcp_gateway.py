"""DataHub MCP adapter with runtime tool discovery and safe mutation mapping."""

from __future__ import annotations

import json
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import Any

import anyio
import httpx
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

from .gateway import DataHubGateway
from .models import AppliedMutation, Asset, LineageEvidence, MutationKind, ProposedMutation


@dataclass(frozen=True, slots=True)
class DataHubMCPConfig:
    url: str
    token: str | None = None
    timeout_seconds: float = 30.0


class DataHubMCPGateway(DataHubGateway):
    """Call official DataHub MCP tools without baking in one server version's schema."""

    def __init__(self, config: DataHubMCPConfig) -> None:
        self.config = config

    @asynccontextmanager
    async def _session(self) -> AsyncIterator[ClientSession]:
        headers = {"Authorization": f"Bearer {self.config.token}"} if self.config.token else {}
        async with httpx.AsyncClient(
            headers=headers,
            timeout=self.config.timeout_seconds,
        ) as client, streamable_http_client(
            self.config.url,
            http_client=client,
        ) as (read_stream, write_stream, _), ClientSession(
            read_stream, write_stream
        ) as session:
            await session.initialize()
            yield session

    async def _call(self, name: str, arguments: dict[str, Any]) -> Any:
        async with self._session() as session:
            tools = {tool.name: tool for tool in (await session.list_tools()).tools}
            if name not in tools:
                raise RuntimeError(
                    f"DataHub MCP server does not expose {name!r}; available: "
                    f"{', '.join(sorted(tools))}"
                )
            result = await session.call_tool(name, arguments)
            if result.isError:
                raise RuntimeError(f"DataHub MCP {name} failed: {_result_text(result)}")
            structured = getattr(result, "structuredContent", None)
            return structured if structured is not None else _decode_text(_result_text(result))

    async def get_asset(self, urn: str) -> Asset:
        payload = await self._call("get_entities", {"urns": [urn]})
        entity = _first_entity(payload)
        return _to_asset(entity, fallback_urn=urn)

    async def downstream_lineage(
        self,
        source_urn: str,
        *,
        max_hops: int = 6,
        field: str | None = None,
    ) -> list[LineageEvidence]:
        payload = await self._call(
            "get_lineage",
            {
                "urn": source_urn,
                "column": field,
                "upstream": False,
                "max_hops": max_hops,
                "max_results": 100,
            },
        )
        records = _lineage_records(payload, direction="downstreams")
        evidence: list[LineageEvidence] = []
        for record in records:
            entity = record.get("entity", record)
            urn = _pick(entity, "urn", "entityUrn", "entity_urn")
            if not urn or urn == source_urn:
                continue
            hops = int(_pick(record, "degree", "hops", "hop") or 1)
            path = _extract_path(record, source_urn, str(urn))
            if hops > 1 and len(path) == 2 and len(records) <= 15:
                arguments: dict[str, Any] = {
                    "source_urn": source_urn,
                    "target_urn": str(urn),
                    "direction": "downstream",
                }
                target_columns = record.get("lineageColumns")
                if field and isinstance(target_columns, list) and target_columns:
                    arguments["source_column"] = field
                    arguments["target_column"] = target_columns[0]
                try:
                    exact = await self._call("get_lineage_paths_between", arguments)
                    path = _extract_between_path(exact, source_urn, str(urn))
                except RuntimeError:
                    pass
            evidence.append(
                LineageEvidence(
                    asset=_to_asset(entity, fallback_urn=str(urn)),
                    hops=hops,
                    path=path,
                    matched_field=field if record.get("lineageColumns") else None,
                )
            )
        return evidence

    async def apply(self, mutation: ProposedMutation) -> AppliedMutation:
        name, arguments = _mutation_call(mutation)
        try:
            payload = await self._call(name, arguments)
            if isinstance(payload, dict) and payload.get("success") is False:
                raise RuntimeError(str(payload.get("message", f"{name} was rejected")))
            verification = await self._verify_mutation(mutation, payload)
        except Exception as error:
            return AppliedMutation(mutation=mutation, succeeded=False, message=str(error))
        return AppliedMutation(
            mutation=mutation,
            succeeded=True,
            message=f"DataHub MCP accepted {name}; {verification}",
        )

    async def _verify_mutation(
        self,
        mutation: ProposedMutation,
        payload: Any,
    ) -> str:
        if mutation.kind is MutationKind.SAVE_DOCUMENT:
            document_urn = payload.get("urn") if isinstance(payload, dict) else None
            if not document_urn:
                raise RuntimeError("save_document succeeded without returning a document URN")
            await self.get_asset(str(document_urn))
            return f"verified document {document_urn}"

        if mutation.kind is MutationKind.ADD_TAG:
            expected = str(mutation.payload["tag"]).lower()
            for attempt in range(3):
                asset = await self.get_asset(mutation.target_urn)
                if any(
                    expected in tag.lower() or tag.lower().endswith(f":{expected}")
                    for tag in asset.tags
                ):
                    return f"verified tag {expected}"
                if attempt < 2:
                    await anyio.sleep(0.2 * (attempt + 1))
            raise RuntimeError(
                f"add_tags was accepted but tag {expected!r} was not visible on re-read"
            )

        return "server acknowledged mutation"


def _mutation_call(mutation: ProposedMutation) -> tuple[str, dict[str, Any]]:
    if mutation.kind is MutationKind.ADD_TAG:
        tag = str(mutation.payload["tag"])
        tag_urn = tag if tag.startswith("urn:li:tag:") else f"urn:li:tag:{tag}"
        return "add_tags", {
            "entity_urns": [mutation.target_urn],
            "tag_urns": [tag_urn],
        }
    if mutation.kind is MutationKind.UPDATE_DESCRIPTION:
        return "update_description", {
            "urn": mutation.target_urn,
            "description": mutation.payload["description"],
        }
    if mutation.kind is MutationKind.SAVE_DOCUMENT:
        payload = dict(mutation.payload)
        return "save_document", {
            "document_type": "Analysis",
            "title": payload["title"],
            "content": payload["contents"],
            "topics": ["faultline", "ml-incident", "lineage"],
            "related_assets": payload.get("related_assets", []),
        }
    raise ValueError(f"Unsupported DataHub mutation: {mutation.kind}")


def _result_text(result: Any) -> str:
    return "\n".join(
        str(getattr(block, "text", ""))
        for block in getattr(result, "content", [])
        if getattr(block, "text", None)
    )


def _decode_text(value: str) -> Any:
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return {"text": value}


def _pick(record: dict[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in record and record[key] is not None:
            return record[key]
    return None


def _walk_dicts(value: Any) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    if isinstance(value, dict):
        found.append(value)
        for child in value.values():
            found.extend(_walk_dicts(child))
    elif isinstance(value, list):
        for child in value:
            found.extend(_walk_dicts(child))
    return found


def _first_entity(payload: Any) -> dict[str, Any]:
    for record in _walk_dicts(payload):
        if _pick(record, "urn", "entityUrn", "entity_urn"):
            return record
    raise LookupError("DataHub MCP returned no entity record")


def _lineage_records(payload: Any, *, direction: str) -> list[dict[str, Any]]:
    if isinstance(payload, dict):
        branch = payload.get(direction, {})
        if isinstance(branch, dict) and isinstance(branch.get("searchResults"), list):
            return [item for item in branch["searchResults"] if isinstance(item, dict)]
    records = [
        record for record in _walk_dicts(payload) if isinstance(record.get("entity"), dict)
    ]
    seen: set[str] = set()
    unique: list[dict[str, Any]] = []
    for record in records:
        entity = record.get("entity", record)
        urn = str(_pick(entity, "urn", "entityUrn", "entity_urn"))
        if urn not in seen:
            seen.add(urn)
            unique.append(record)
    return unique


def _extract_path(record: dict[str, Any], source_urn: str, target_urn: str) -> tuple[str, ...]:
    paths = record.get("paths")
    if isinstance(paths, list) and paths and isinstance(paths[0], dict):
        nodes = paths[0].get("path", [])
        urns = [
            str(node["urn"])
            for node in nodes
            if isinstance(node, dict) and node.get("urn")
        ]
        if urns:
            if urns[0] != source_urn:
                urns.insert(0, source_urn)
            return tuple(dict.fromkeys(urns))
    return (source_urn, target_urn)


def _extract_between_path(
    payload: Any,
    source_urn: str,
    target_urn: str,
) -> tuple[str, ...]:
    paths = payload.get("paths") if isinstance(payload, dict) else None
    if not isinstance(paths, list) or not paths or not isinstance(paths[0], dict):
        return (source_urn, target_urn)
    nodes = paths[0].get("path", [])
    urns: list[str] = []
    for node in nodes:
        if not isinstance(node, dict):
            continue
        parent = node.get("parent")
        value = (
            parent.get("urn")
            if isinstance(parent, dict) and parent.get("urn")
            else node.get("urn")
        )
        if value:
            urns.append(str(value))
    if not urns or urns[0] != source_urn:
        urns.insert(0, source_urn)
    if urns[-1] != target_urn:
        urns.append(target_urn)
    return tuple(dict.fromkeys(urns))


def _to_asset(record: dict[str, Any], *, fallback_urn: str) -> Asset:
    urn = str(_pick(record, "urn", "entityUrn", "entity_urn") or fallback_urn)
    properties = record.get("properties") if isinstance(record.get("properties"), dict) else {}
    name = str(
        _pick(record, "name", "displayName", "title")
        or _pick(properties, "name", "displayName")
        or urn.rsplit(":", 1)[-1].rstrip(")")
    )
    entity_type = str(_pick(record, "type", "entityType", "entity_type") or "DATASET")
    platform = _pick(record, "platform", "platformName", "platform_name")
    if isinstance(platform, dict):
        platform = _pick(platform, "name", "displayName")
    owners = record.get("owners", [])
    owner = None
    if isinstance(owners, list) and owners:
        first = owners[0]
        owner = str(_pick(first, "name", "owner", "urn") if isinstance(first, dict) else first)
    tags = _tag_values(record)
    return Asset(
        urn=urn,
        name=name,
        entity_type=entity_type,
        platform=str(platform or "datahub"),
        owner=owner,
        criticality=int(record.get("criticality", 2) or 2),
        lifecycle=str(record.get("lifecycle", "production")),
        tags=tuple(
            str(_pick(tag, "name", "urn") if isinstance(tag, dict) else tag) for tag in tags
        ),
    )


def _tag_values(record: dict[str, Any]) -> list[Any]:
    tags = record.get("tags")
    if isinstance(tags, list):
        return tags
    global_tags = record.get("globalTags")
    if not isinstance(global_tags, dict) or not isinstance(global_tags.get("tags"), list):
        return []
    values: list[str] = []
    for association in global_tags["tags"]:
        if not isinstance(association, dict):
            continue
        tag = association.get("tag", association)
        if not isinstance(tag, dict):
            continue
        value = _pick(tag, "urn", "name")
        if value:
            values.append(str(value))
    return values
