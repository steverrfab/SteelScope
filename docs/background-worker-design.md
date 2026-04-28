# Background Worker Design

## Queues
- `file-processing`: validate and fan out file pages.
- `page-processing`: vector text, OCR, tables, thumbnails, metadata.
- `classification`: discipline/page type/sheet metadata.
- `extraction`: steel terms, scope risks, schedules, specs, takeoff candidates.
- `pricing`: estimate recalculation.
- `reports`: Excel/PDF generation.
- `revision-compare`: addenda and changed sheet comparison.

## Job Contract
Each job has:
- `job_id`, `organization_id`, `project_id`
- optional `file_id`, `document_id`, `page_id`, `sheet_id`
- `stage`
- `attempt`
- `idempotency_key`
- `requested_by_user_id`

## State Transitions
`queued -> running -> succeeded | failed | needs_review | skipped`

Each processor writes stage-level status and audit events. Retrying a failed stage does not clear downstream approved estimator edits.

## Worker Responsibilities
- Never trust source file names or MIME types without validation.
- Stream file/page assets from storage.
- Persist intermediate page artifacts separately.
- Keep provider output raw payloads for audit/debug where allowed by security settings.
- Emit extraction evidence for every entity or takeoff candidate.

## Failure Handling
- Retry transient provider/storage failures with backoff.
- Mark unreadable/low-confidence pages as `needs_review`.
- Store last error without leaking secrets.
- Allow project-level retry for failed pages.
