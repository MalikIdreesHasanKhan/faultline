# Devpost submission draft

## Project name

FAULTLINE

## Tagline

Catch the upstream tremor before the model breaks.

## Category

Production ML Agents

## Inspiration

The first alert in a data incident is rarely the hardest part. The expensive part is
working out whether a small upstream change reaches a production feature, model, or
deployment—and proving it quickly enough to act. DataHub already knows those
relationships. FAULTLINE turns that passive context into an active, governed
incident response.

## What it does

FAULTLINE accepts a schema or quality signal, traverses downstream DataHub lineage at
entity and column level, and ranks every exposed asset with deterministic,
inspectable evidence. It recommends one of five responses: observe, validate,
retrain, quarantine, or block.

The console animates the blast radius and replays the graph under five
counterfactual failure modes. It previews high-risk tags and a durable incident
document. Nothing is written until a human types an incident-specific approval
phrase. After approval, FAULTLINE calls DataHub mutation tools and reports each
result in order.

## How we built it

The application is Python 3.10+ with FastAPI, the official Python MCP client, and a
dependency-free browser interface. The incident engine sits behind a small catalog
gateway with both a deterministic in-memory implementation and a real DataHub MCP
adapter.

Risk combines signal severity, downstream entity type, criticality, production
lifecycle, graph distance, and confirmed field lineage. Policy thresholds live in
TOML. Markdown and JSON evidence receipts include a SHA-256 seal over the canonical
incident plan.

The 2:02 demo film is built in Remotion at 1920x1080 and 30 fps. It is intentionally
voiceless and tells the story through kinetic captions with word-level reveals,
semantic highlights, directional transitions, and scan/glitch accents over a
deterministic ambient score synthesized locally from noise and sine waves. Every
frame, transition, graph, card, terminal readout, and caption is editable React code
rather than a screen-recording effect. Campaign-style chapter punches, impact
flashes, scene shutters, parallax HUD motion, camera pushes, speed lines, and
animated telemetry bookend a continuous cursor-driven walkthrough that clicks the
real console controls, changes application state, types approval, and verifies writes.

## Use of DataHub

FAULTLINE reads entities and downstream column lineage with `get_entities` and
`get_lineage`. After explicit approval, it adds visible risk context with `add_tags`
and persists the complete investigation with `save_document`. That write-back
creates a feedback loop: the next responder or agent begins with the previous
incident’s evidence.

## Challenges

The hardest design problem was making an agent useful without letting “agentic”
become a synonym for unreviewable. We separated evidence collection, deterministic
scoring, proposal, approval, and execution. We also built a complete offline
scenario so judges can evaluate every feature without credentials while preserving
the identical domain workflow used by the live adapter.

## Accomplishments

- End-to-end dataset → feature → model → deployment impact analysis.
- Explainable scoring with counterfactual replay.
- Explicit, incident-scoped human approval.
- Durable DataHub write-back and portable evidence receipts.
- Reusable DataHub ML incident-response skill.
- Fifteen automated tests, CI on Python 3.10 and 3.12, and a container image.
- A fully programmatic, voiceless Remotion demo film under the three-minute limit.

## What we learned

Metadata becomes much more valuable when an agent not only consumes it but improves
it. Lineage explains the present blast radius; the incident document explains why a
decision was made. Together they make the catalog a shared memory surface.

## What is next

Add native assertion-event ingestion, integrate proposal workflows for organizations
that require metadata review, and connect approved BLOCK or RETRAIN recommendations
to separate operational executors with their own authorization boundary.

## Links required before submission

- Public Apache-2.0 repository: TODO
- Public demo URL or judge access: TODO
- Public video under three minutes: TODO — publish `video/out/faultline-demo.mp4`
- Optional upstream DataHub skill pull request: TODO
