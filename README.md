# FAULTLINE

> Catch the upstream tremor before the model breaks.

FAULTLINE is a DataHub-native incident-response agent for production ML. Give it one
schema or quality signal and it traces the downstream path from dataset to feature to
model to deployment, ranks the blast radius with inspectable evidence, recommends a
response, and—only after human approval—writes durable incident context back into
DataHub.

It targets **Production ML Agents** in the 2026 Build with DataHub Agent Hackathon,
with a second strong fit for **Agents That Do Real Work**.

## The 60-second judge path

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
python -m pip install -e ".[dev]"
faultline serve
```

Open `http://127.0.0.1:8000`, select **Trigger incident replay**, and watch a
`DECIMAL → VARCHAR` change propagate from Snowflake through Feast and MLflow into a
live Kubernetes model deployment. The console then lets you:

- replay the animated lineage blast radius;
- open the evidence behind every risk score;
- compare five counterfactual failure modes;
- inspect policy-as-code thresholds;
- download a SHA-256-sealed evidence receipt;
- preview every DataHub mutation;
- authorize writes with an incident-specific approval phrase.

No credentials or network access are needed for this judge scenario.

## The 2:26 cinematic demo

The submission includes a programmatic Remotion film rather than a captured slide
deck. Its seven scene-aligned chapters animate the incident graph, evidence ledger,
five counterfactuals, approval boundary, verified writes, and engineering proof.
It is deliberately voiceless: animated captions carry the story over a deterministic
original ambient score under `video/public/audio`.

```bash
cd video
npm install
npm run typecheck
npm run still
npm run render
```

The final 1920x1080 H.264 film is written to
`video/out/faultline-demo.mp4`. See [the film README](video/README.md) and the
[timed visual rundown](docs/demo-script.md).

## Why it matters

Monitoring tools tell an on-call engineer that a column changed. FAULTLINE answers
the expensive questions that follow:

1. Which production models are actually exposed?
2. Through which features and transformation paths?
3. Is that dependency confirmed at column level?
4. Should we validate, retrain, quarantine, or block?
5. What evidence supports that decision?
6. How do we leave enough context that the next human or agent does not start over?

The differentiator is the last step. FAULTLINE uses DataHub as both the source of
context and the durable memory of the response. It turns an incident into better
metadata.

## One agent loop, fully visible

```text
READ                  REASON                 PROPOSE
DataHub entities  ->  ranked path risk  ->  tags + incident document
lineage + columns     policy thresholds     exact payload preview
owners + lifecycle    counterfactuals
                                                  |
                                                  v
LEARN                 VERIFY                 APPROVE
future agents     <-  re-read mutations  <-  incident-specific phrase
inherit context       report partials        required at write boundary
```

There is no opaque “AI confidence” shortcut. Risk is deterministic and every point
has a reason: signal severity, asset type, criticality, production lifecycle, hop
distance, and confirmed column lineage. The agent reports concise evidence—not
private chain-of-thought.

## DataHub integration

The production adapter speaks the official streamable-HTTP MCP interface:

- reads with `get_entities` and downstream, column-aware `get_lineage`;
- writes high-risk tags with `add_tags`;
- saves the incident receipt with `save_document`;
- discovers tools at runtime and fails closed when a required capability is absent.

Set `DATAHUB_TOKEN` in the environment; never pass it on the command line.

```bash
export DATAHUB_MCP_URL="http://localhost:8080/mcp"
export DATAHUB_TOKEN="..."

faultline live \
  --source-urn "urn:li:dataset:(urn:li:dataPlatform:snowflake,retail.raw_orders,PROD)" \
  --kind type_changed \
  --field order_total \
  --before "DECIMAL(18,2)" \
  --after VARCHAR
```

That command is a dry run. Review the plan, then append `--approve` to authorize
the listed writes. DataHub mutation tools must be enabled on the server with
`TOOLS_IS_MUTATION_ENABLED=true`.

For the visual console against a real graph, copy `.env.example` values into your
runtime environment before `faultline serve`. When configuration is absent, the
console deliberately falls back to the deterministic scenario.

## More than the app

`skills/datahub-investigate-ml-blast-radius` is an installable agent skill that
teaches any compatible agent the safe investigation workflow: read automatically,
show evidence, preview writes, ask at the mutation boundary, and verify. It is
structured as a standalone open-source contribution candidate for the official
DataHub skills repository.

## CLI

```text
faultline demo [--approve] [--policy …] terminal replay, memory-only writes
faultline serve [--host …] [--port …]  interactive incident console
faultline live … [--approve] [--policy …] real DataHub MCP investigation
faultline export --format json [--policy …] deterministic evidence artifact
```

## Verification

```bash
python -m pip install -e ".[dev]"
ruff check .
pytest
python -m build
```

The test suite covers cycle-safe lineage traversal, deterministic decisions,
counterfactuals, policy overrides, explicit approval, ordered write-back, official
DataHub MCP payload shapes, receipt generation, and the full web API workflow.
CI runs on CPython 3.10 and 3.12.

## Repository map

```text
src/faultline/
  agent.py          investigation, counterfactuals, approval gate
  mcp_gateway.py    official DataHub MCP adapter
  risk.py           explainable scoring
  policy.py         versionable response thresholds
  receipts.py       Markdown/JSON evidence receipts and seal
  web.py            judge console API
  static/           dependency-free cinematic interface
skills/             reusable DataHub incident-response skill
tests/              unit, adapter-contract, and end-to-end tests
docs/               architecture, judge map, and recording script
examples/           deterministic sample outputs
video/              editable Remotion film, ambient score, and render scripts
```

See [architecture](docs/architecture.md), [judging map](docs/judging-map.md), and
[demo script](docs/demo-script.md).

## Contest and license

This is a new project created during the 2026 hackathon submission period. The
repository is licensed under the required [Apache License 2.0](LICENSE). It is
designed for open-source DataHub and the official
[DataHub MCP Server](https://docs.datahub.com/docs/features/feature-guides/mcp).

No external services, paid APIs, or pre-existing project code are required by the
credential-free demo.
