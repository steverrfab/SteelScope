# Railway Deployment

Railway and GitHub are a strong fit for SteelScope. Railway can run the web app, Postgres, Redis, a worker service, and S3-compatible object storage buckets in one project.

## Services

Create one Railway project with:

- `web`: GitHub repo service running the Next.js app.
- `worker`: second service from the same GitHub repo running background jobs.
- `postgres`: Railway PostgreSQL database.
- `redis`: Railway Redis database.
- `bucket`: Railway Storage Bucket for uploaded bid packages and generated artifacts.

## Web Service

Build command:

```bash
npm run railway:build
```

Pre-deploy command:

```bash
npm run railway:predeploy
```

Start command:

```bash
npm run start
```

## Worker Service

Create another Railway service from the same GitHub repo.

Start command:

```bash
npm run worker
```

The worker should share the same variables as the web service.

## Required Variables

Use Railway reference variables where possible.

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
QUEUE_DRIVER=bullmq
STORAGE_DRIVER=s3
S3_REGION=auto
S3_ENDPOINT=${{Bucket.S3_ENDPOINT}}
S3_BUCKET=${{Bucket.S3_BUCKET}}
S3_ACCESS_KEY_ID=${{Bucket.S3_ACCESS_KEY_ID}}
S3_SECRET_ACCESS_KEY=${{Bucket.S3_SECRET_ACCESS_KEY}}
APP_BASE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
SESSION_SECRET=generate-a-long-random-secret
OCR_PROVIDER=disabled
LLM_PROVIDER=disabled
EMBEDDING_PROVIDER=disabled
```

Exact bucket variable names can differ by Railway bucket configuration. Use the variable references exposed by the bucket service.

## First Deploy

1. Push this repo to GitHub.
2. Create a Railway project from the GitHub repo.
3. Add PostgreSQL.
4. Add Redis.
5. Add a Storage Bucket.
6. Set web service variables.
7. Deploy web service.
8. Add a worker service from the same repo.
9. Set worker variables and start command.
10. Deploy worker service.

## Current Product Limitations

The deployed app can ingest vector/text PDFs and detect searchable steel/risk terms. Scanned-only plans still need an OCR provider before they can be reliably processed.
