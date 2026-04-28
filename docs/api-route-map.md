# API Route Map

All routes are organization-scoped through authenticated context.

## Auth
- `POST /api/auth/session`
- `DELETE /api/auth/session`
- `GET /api/auth/me`

## Projects
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`

## Uploads and Files
- `POST /api/projects/:projectId/uploads/initiate`
- `PUT /api/projects/:projectId/uploads/:uploadId/chunks/:partNumber`
- `POST /api/projects/:projectId/uploads/:uploadId/complete`
- `POST /api/projects/:projectId/uploads/:uploadId/abort`
- `GET /api/projects/:projectId/files`
- `GET /api/projects/:projectId/files/:fileId`
- `GET /api/projects/:projectId/files/:fileId/status`
- `POST /api/projects/:projectId/files/:fileId/retry`

## Processing
- `GET /api/projects/:projectId/processing/status`
- `POST /api/projects/:projectId/processing/retry-failed`

## Search
- `GET /api/projects/:projectId/search?q=&type=&discipline=&sheet=`

## Documents and Drawings
- `GET /api/projects/:projectId/documents`
- `GET /api/projects/:projectId/pages/:pageId`
- `GET /api/projects/:projectId/pages/:pageId/signed-url`
- `GET /api/projects/:projectId/drawings`
- `GET /api/projects/:projectId/drawings/:sheetId`

## Takeoff and Estimate
- `GET /api/projects/:projectId/takeoff-items`
- `POST /api/projects/:projectId/takeoff-items`
- `PATCH /api/projects/:projectId/takeoff-items/:itemId`
- `POST /api/projects/:projectId/takeoff-items/:itemId/approve`
- `POST /api/projects/:projectId/takeoff-items/:itemId/reject`
- `GET /api/projects/:projectId/estimate-items`
- `POST /api/projects/:projectId/estimate-items/reprice`

## Pricing and Shapes
- `GET /api/pricing-templates`
- `POST /api/pricing-templates`
- `PATCH /api/pricing-templates/:templateId`
- `GET /api/steel-shapes?shape=&size=`
- `POST /api/steel-shapes/import`

## Scope, Addenda, Reports
- `GET /api/projects/:projectId/scope-review`
- `POST /api/projects/:projectId/scope-review/generate`
- `GET /api/projects/:projectId/addenda`
- `POST /api/projects/:projectId/addenda/:addendumId/compare`
- `GET /api/projects/:projectId/rfis`
- `POST /api/projects/:projectId/rfis`
- `GET /api/projects/:projectId/clarifications`
- `POST /api/projects/:projectId/reports`
- `GET /api/projects/:projectId/reports/:reportId`
- `GET /api/projects/:projectId/exports/:reportId/download`
