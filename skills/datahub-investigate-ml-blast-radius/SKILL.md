---
name: datahub-investigate-ml-blast-radius
description: Trace upstream schema or data-quality changes through DataHub lineage into features, models, deployments, dashboards, and other consumers; rank production ML blast radius; recommend a governed response; and leave durable incident context in DataHub. Use for breaking schema changes, quality incidents, freshness failures, model-risk triage, deployment gates, impact analysis, and ML incident postmortems.
---

# Investigate ML blast radius

Turn a data change into an evidence-backed incident plan. Keep reads automatic.
Keep mutations explicit, previewed, approved, and verified.

## Workflow

1. Normalize the signal.
   - Record the source URN, change kind, affected field, before/after values, and observation time.
   - Treat removed fields and incompatible type changes as high-severity signals.

2. Collect DataHub evidence.
   - Call `get_entities` for source metadata, ownership, tags, lifecycle, and criticality.
   - Call `list_schema_fields` when field identity or type is uncertain.
   - Call `get_lineage` downstream with multiple hops.
   - Use column-level lineage when the signal names a field.
   - Call `get_lineage_paths_between` when an exact path to a critical model or deployment
     must be proven.

3. Build the blast radius.
   - Rank every affected asset using severity, entity type, criticality, production
     lifecycle, graph distance, and confirmed column dependency.
   - Preserve the complete path and score contributions for every finding.
   - Distinguish direct evidence from inference. Never invent lineage.

4. Select a response.
   - Observe when no meaningful downstream exposure exists.
   - Validate for moderate or indirect exposure.
   - Retrain when feature or model behavior may be invalid.
   - Quarantine when production consumers are likely compromised.
   - Block when a critical feature, model, or deployment has confirmed high-risk exposure.

5. Present a governed plan.
   - State the incident summary, highest-risk assets, owners, exact paths, confidence,
     recommended response, and proposed DataHub mutations.
   - Show all mutations before invoking a mutation tool.
   - Ask for explicit human approval immediately before write-back.

6. Leave the graph better.
   - After approval, use `add_tags` to mark high-risk assets.
   - Use `save_document` to persist an incident evidence receipt and related asset URNs.
   - Prefer proposal tools when the organization requires governed review.
   - Verify every accepted mutation with a read tool. Report partial failure and stop
     dependent writes.

## Safety invariants

- Never mutate DataHub during investigation or preview.
- Never treat a request to investigate as approval to write.
- Never claim a response action was executed when only metadata was updated.
- Never expose access tokens in receipts, output, or tool arguments beyond authentication.
- If mutation tools are unavailable, return a complete dry-run plan.

## Output contract

Return:

1. Signal and source.
2. Recommended action and confidence.
3. Ranked assets with risk score, evidence path, and concise reasons.
4. Counterfactual comparison when multiple plausible failure modes exist.
5. Proposed write-back operations.
6. Approval state and verified results.
