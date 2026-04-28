# Database Schema

The app uses PostgreSQL UUID primary keys, organization scoping, audit timestamps, and soft deletion for user-owned business data. Representative DDL lives in `prisma/schema.prisma`.

## Core Tables
- `organizations`: fabricator accounts.
- `users`: authenticated people.
- `organization_memberships`: role and permission membership.
- `projects`: bid projects.
- `files`: uploaded source objects and versions.
- `documents`: logical document derived from a file.
- `pages`: page-level processing records.
- `drawing_sheets`: drawing metadata and classification.
- `spec_sections`: CSI/spec section excerpts and summaries.
- `addenda`: addenda packages.
- `revisions`: sheet/file revision graph and comparison output.
- `ocr_text`: vector/OCR text with confidence.
- `extracted_entities`: steel terms, risk terms, schedules, notes, alternates, and scope candidates.
- `takeoff_items`: estimator-reviewed material/takeoff lines.
- `estimate_items`: priced lines tied to takeoff items or manual estimate rows.
- `pricing_templates`: editable pricing assumptions.
- `steel_shapes`: AISC-oriented shape catalog.
- `assemblies`: reusable stair/rail/frame/etc. assemblies.
- `markups`: drawing annotations.
- `measurements`: calibrated manual measurements.
- `risk_flags`: scope, contract, schedule, finish, inspection, and coordination risks.
- `rfis`: questions generated or manually created from missing/conflicting evidence.
- `clarifications`: bid clarification/exclusion/assumption statements.
- `reports`: export jobs and generated artifacts.
- `audit_logs`: immutable event trail.

## Indexing
- Full-text GIN indexes on page text, tables, sheet titles, entities, risk flags, and takeoff notes.
- B-tree indexes on organization, project, file, page, sheet number, status, and revision lineage.
- Optional `vector` columns for page/entity embeddings when `pgvector` is enabled.

## Access Pattern
Every repository method receives an auth context and includes `organization_id` filters. Cross-organization lookups are forbidden by construction.
