# SteelScope

SteelScope is a production-shaped steel takeoff and estimating web app for structural steel and miscellaneous metals fabricators. It is built around large bid-package ingestion, source-traceable extraction, estimator review, pricing, addenda impacts, and bid/report exports.

## What Is Implemented
- Product and architecture deliverables in `docs/`.
- Next.js/TypeScript app shell with core bid sections.
- Prisma schema covering organizations, projects, files, pages, sheets, OCR, entities, takeoff, estimate, pricing, shapes, reports, RFIs, clarifications, revisions, and audit logs.
- Domain models for source evidence, review statuses, processing states, scope vocabulary, steel shapes, and pricing.
- Provider interfaces for storage, queues, OCR, LLM, embeddings, PDF processing, and reports.
- Resumable upload API contract routes.
- Project, search, takeoff, pricing, steel shape, scope review, and processing status route skeletons.
- Worker contracts and processors that fail fast when real providers are not configured.

## Local Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`.
3. Start local services when using Postgres/Redis/MinIO: `docker compose up -d`
4. Run Prisma migrations: `npm run prisma:migrate`
5. Seed development organization, user, membership, and shape data: `npm run seed:dev`
6. Start the app: `npm run dev`
7. Start workers separately: `npm run worker`

By default the app can use local object storage and an in-memory queue for development. Set `STORAGE_DRIVER=s3` and `QUEUE_DRIVER=bullmq` to use S3-compatible storage and Redis/BullMQ. OCR, LLM, embedding, PDF processing, and report generation remain provider interfaces until concrete vendors are selected.

## Railway

See [docs/railway-deployment.md](docs/railway-deployment.md) for GitHub-to-Railway deployment with Postgres, Redis, a worker service, and S3-compatible storage buckets.
