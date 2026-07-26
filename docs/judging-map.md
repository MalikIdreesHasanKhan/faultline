# Judging map

The hackathon weights five criteria equally. The demo and repository are structured
so each criterion has visible proof.

| Criterion | What judges see | Evidence |
| --- | --- | --- |
| Use of DataHub | Column-aware multi-hop impact analysis, entity context, tags, durable incident document | `mcp_gateway.py`, mutation preview, receipt write-back |
| Technical execution | Typed domain boundary, deterministic engine, fail-closed approval, Docker image, CI across Python 3.10/3.12 | `tests/`, `Dockerfile`, workflow |
| Originality | “Seismic” incident replay, counterfactual blast radius, catalog-as-agent-memory feedback loop | interactive console |
| Real-world usefulness | Answers the deployed-model impact question before rollout or incident escalation | retail churn scenario and live CLI |
| Submission quality | 60-second setup, no credentials, under-three-minute story, sample outputs, architecture and policy receipts | README, demo script, `examples/` |

## Bonus contribution

`skills/datahub-investigate-ml-blast-radius` is a validated, reusable skill prepared
as an upstream contribution candidate. It codifies a safe DataHub-native ML incident
workflow and uses the official read and mutation tool names.

Do not claim the bonus until a public upstream pull request exists. Link that pull
request in the final submission if accepted or under active review.

## Claims discipline

The submission may claim:

- deterministic and explainable risk ranking;
- real DataHub MCP read/write integration;
- explicit human approval and partial-failure handling;
- a credential-free reproducible scenario.

It must not claim:

- that DataHub tags themselves block deployments;
- that the bundled scenario is a live production incident;
- that the reusable skill is an accepted upstream contribution before acceptance.
