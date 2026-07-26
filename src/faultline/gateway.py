"""Catalog boundary: real DataHub and deterministic in-memory implementations."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections import deque

from .models import AppliedMutation, Asset, LineageEvidence, ProposedMutation


class DataHubGateway(ABC):
    """The smallest DataHub surface FAULTLINE needs.

    Keeping this boundary explicit makes the incident logic independently
    testable while ensuring the production adapter's reads and writes are
    visible in one place.
    """

    @abstractmethod
    async def get_asset(self, urn: str) -> Asset:
        raise NotImplementedError

    @abstractmethod
    async def downstream_lineage(
        self,
        source_urn: str,
        *,
        max_hops: int = 6,
        field: str | None = None,
    ) -> list[LineageEvidence]:
        raise NotImplementedError

    @abstractmethod
    async def apply(self, mutation: ProposedMutation) -> AppliedMutation:
        raise NotImplementedError


class MemoryDataHubGateway(DataHubGateway):
    """A faithful, credential-free graph used for tests and the judge demo."""

    def __init__(
        self,
        assets: list[Asset],
        edges: list[tuple[str, str]],
        field_paths: dict[tuple[str, str], str] | None = None,
    ) -> None:
        self.assets = {asset.urn: asset for asset in assets}
        self.edges = edges
        self.field_paths = field_paths or {}
        self.applied: list[ProposedMutation] = []

    async def get_asset(self, urn: str) -> Asset:
        try:
            return self.assets[urn]
        except KeyError as error:
            raise LookupError(f"Unknown DataHub entity: {urn}") from error

    async def downstream_lineage(
        self,
        source_urn: str,
        *,
        max_hops: int = 6,
        field: str | None = None,
    ) -> list[LineageEvidence]:
        adjacency: dict[str, list[str]] = {}
        for upstream, downstream in self.edges:
            adjacency.setdefault(upstream, []).append(downstream)

        queue: deque[tuple[str, tuple[str, ...]]] = deque([(source_urn, (source_urn,))])
        visited = {source_urn}
        evidence: list[LineageEvidence] = []

        while queue:
            current, path = queue.popleft()
            hops = len(path) - 1
            if hops >= max_hops:
                continue
            for downstream in adjacency.get(current, []):
                if downstream in visited:
                    continue
                visited.add(downstream)
                next_path = (*path, downstream)
                evidence.append(
                    LineageEvidence(
                        asset=await self.get_asset(downstream),
                        hops=len(next_path) - 1,
                        path=next_path,
                        matched_field=self.field_paths.get((current, downstream)),
                    )
                )
                queue.append((downstream, next_path))
        return evidence

    async def apply(self, mutation: ProposedMutation) -> AppliedMutation:
        self.applied.append(mutation)
        return AppliedMutation(
            mutation=mutation,
            succeeded=True,
            message=f"memory catalog accepted and verified {mutation.kind.value}",
        )
