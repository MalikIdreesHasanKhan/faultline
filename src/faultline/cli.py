"""Command-line entry point."""

from __future__ import annotations

import argparse
import asyncio
import os

from .agent import FaultlineAgent
from .mcp_gateway import DataHubMCPConfig, DataHubMCPGateway
from .models import ChangeKind, ChangeSignal
from .policy import DEFAULT_POLICY, ResponsePolicy
from .receipts import receipt_json, receipt_markdown
from .render import render_plan, render_results
from .scenario import retail_churn_scenario


async def _demo(*, approve: bool, policy: str | None = None) -> int:
    gateway, signal = retail_churn_scenario()
    agent = FaultlineAgent(gateway, policy=_load_policy(policy))
    plan = await agent.investigate(signal)
    print(render_plan(plan))
    if approve:
        print(render_results(await agent.execute(plan, approved=True)))
    else:
        print("Dry run only. Re-run with --approve to apply writes to the demo catalog.")
    return 0


def _load_policy(path: str | None) -> ResponsePolicy:
    return ResponsePolicy.from_toml(path) if path else DEFAULT_POLICY


async def _live(args: argparse.Namespace) -> int:
    gateway = DataHubMCPGateway(
        DataHubMCPConfig(
            url=args.mcp_url,
            token=os.environ.get("DATAHUB_TOKEN"),
        )
    )
    signal = ChangeSignal(
        source_urn=args.source_urn,
        kind=ChangeKind(args.kind),
        field=args.field,
        before=args.before,
        after=args.after,
    )
    agent = FaultlineAgent(gateway, policy=_load_policy(args.policy))
    plan = await agent.investigate(signal)
    print(render_plan(plan))
    if args.approve:
        print(render_results(await agent.execute(plan, approved=True)))
    else:
        print(
            f"Dry run. Review the plan, then append --approve to authorize "
            f"{len(plan.mutations)} DataHub writes."
        )
    return 0


async def _export(args: argparse.Namespace) -> int:
    gateway, signal = retail_churn_scenario()
    agent = FaultlineAgent(gateway, policy=_load_policy(args.policy))
    plan = await agent.investigate(signal)
    content = (
        receipt_json(plan, agent.policy)
        if args.format == "json"
        else receipt_markdown(plan, agent.policy)
    )
    if args.output:
        from pathlib import Path

        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(content + "\n", encoding="utf-8", newline="\n")
        print(f"Wrote deterministic {args.format.upper()} receipt to {output}")
    else:
        print(content)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="faultline",
        description="Predict ML incident blast radius using DataHub context.",
    )
    subcommands = parser.add_subparsers(dest="command", required=True)
    demo = subcommands.add_parser("demo", help="run the credential-free retail ML scenario")
    demo.add_argument(
        "--approve",
        action="store_true",
        help="apply the previewed mutations to the in-memory demo catalog",
    )
    demo.add_argument("--policy", help="load response thresholds from a TOML file")
    serve = subcommands.add_parser("serve", help="launch the interactive judge console")
    serve.add_argument("--host", default="127.0.0.1")
    serve.add_argument("--port", default=8000, type=int)
    live = subcommands.add_parser("live", help="investigate a real DataHub graph over MCP")
    live.add_argument(
        "--mcp-url",
        default=os.environ.get("DATAHUB_MCP_URL"),
        required=os.environ.get("DATAHUB_MCP_URL") is None,
    )
    live.add_argument("--source-urn", required=True)
    live.add_argument("--kind", choices=[item.value for item in ChangeKind], required=True)
    live.add_argument("--field")
    live.add_argument("--before")
    live.add_argument("--after")
    live.add_argument("--policy", help="load response thresholds from a TOML file")
    live.add_argument(
        "--approve",
        action="store_true",
        help="apply the previewed mutations through DataHub MCP",
    )
    export = subcommands.add_parser(
        "export",
        help="export the deterministic judge scenario as an evidence receipt",
    )
    export.add_argument("--format", choices=["json", "markdown"], default="markdown")
    export.add_argument("--output")
    export.add_argument("--policy", help="load response thresholds from a TOML file")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    if args.command == "demo":
        return asyncio.run(_demo(approve=args.approve, policy=args.policy))
    if args.command == "serve":
        import uvicorn

        uvicorn.run("faultline.web:app", host=args.host, port=args.port)
        return 0
    if args.command == "live":
        return asyncio.run(_live(args))
    if args.command == "export":
        return asyncio.run(_export(args))
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
