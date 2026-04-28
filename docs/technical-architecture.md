# Technical Architecture

## Stack
- Frontend: Next.js App Router with React Server Components for project data and client components for upload/viewer interactivity.
- API: Next.js route handlers organized by bounded domain. Long-running work is delegated to queue workers.
- Database: PostgreSQL with row-level organization isolation enforced in repository queries. `pgvector` is optional for semantic search.
- Search: PostgreSQL full-text search over OCR/vector text, tables, entities, sheets, risk flags, and takeoff items; vector search when configured.
- Queue: Redis/BullMQ-compatible queue adapter.
- Storage: S3-compatible object storage abstraction with private keys, multipart/chunk support, and signed URLs.
- Workers: document processing, OCR, classification, extraction, pricing, report generation, revision comparison.
- AI: provider-agnostic OCR, LLM, embedding, and vision/document interfaces.

## Service Boundaries
- `domain`: Type-safe enums, value objects, extraction vocabularies, calculations.
- `application`: use cases that coordinate repositories, storage, AI, queues, and audit logs.
- `infrastructure`: concrete adapters for storage, queues, AI, database, file validation, and reports.
- `app/api`: HTTP route handlers with validation, auth context, and use-case invocation.
- `workers`: idempotent processors that claim jobs, process page/file granularity, and emit audit/status events.
- `components`: estimator-facing workflows.

## Processing Model
Uploads create immutable file versions. Completed uploads enqueue file processing. PDFs are split into page records; each page is processed independently:
1. detect page count and metadata
2. extract vector text
3. OCR if vector text is missing or low quality
4. extract tables
5. create thumbnail and optional raster image for viewer overlays
6. classify page type and discipline
7. detect sheet metadata
8. extract steel/risk entities
9. upsert search documents

## Source Traceability
Evidence references are first-class:
- `source_type`: text, table, visual, manual, calculated
- `project_id`, `file_id`, `page_id`, `sheet_id`
- optional bounding box, text span, table cell, detail reference, and quote
- confidence and reason

## Reliability
- Jobs are idempotent by `project_id`, `file_id`, `page_id`, and processing stage.
- Each stage stores status, attempts, last error, and timestamps.
- Failed pages can be retried without reprocessing the entire package.
- Workers stream objects and page assets; no full-document memory loading.

## Deployment Shape
- Web/API service
- Worker service pool
- PostgreSQL
- Redis
- S3-compatible object storage
- OCR provider service or API
- LLM/embedding provider
- Observability: structured logs, audit logs, job metrics, per-page failure dashboards
