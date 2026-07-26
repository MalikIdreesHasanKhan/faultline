# Security policy

FAULTLINE is an incident-planning and metadata write-back tool. It does not execute
deployment blocks, retraining jobs, or quarantine operations.

## Reporting

Report suspected vulnerabilities privately to the repository maintainers. Do not
open a public issue containing access tokens, tenant URLs, private URNs, or incident
data.

## Operational guidance

- Use a scoped DataHub service account for unattended workflows.
- Keep `DATAHUB_TOKEN` in the environment or a secret manager.
- Leave DataHub mutation tools disabled unless write-back is required.
- Review the complete mutation preview before approval.
- Run real write-back first against a non-production DataHub instance.
