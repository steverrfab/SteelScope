# Security Plan

## Authentication and Authorization
- Authenticated sessions are required for all business routes.
- Organization membership is checked on every request.
- Roles: owner, admin, chief_estimator, estimator, reviewer, viewer.
- Permissions gate upload, edit, approve, price, export, admin, and delete actions.

## File Security
- Private object storage only.
- Signed URLs are short-lived and scoped to the requested file/page/report.
- Safe file validation checks size, extension, MIME, magic bytes, and malware scan hook.
- Source file names are treated as untrusted display labels.

## Data Security
- Secrets live in encrypted environment management outside source control.
- Audit logs record project, upload, extraction, approval, pricing, report, and admin events.
- Business records are organization-scoped.
- Sensitive provider payloads can be redacted by configuration.

## AI Safety
- AI output is structured, validated, and always reviewable.
- Prompts do not expose unrelated organization data.
- Provider adapters centralize logging/redaction and timeout controls.

## Operational Security
- Rate limits on upload initiation and API mutations.
- Antivirus/malware scanning hook before processing.
- Background jobs are idempotent and avoid duplicate side effects.
- Report downloads require authorization and signed URLs.
