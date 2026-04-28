# SteelScope PRD

## Product Goal
SteelScope is a takeoff and estimating system for structural steel and miscellaneous metals fabricators bidding real construction projects. It ingests large bid packages, extracts scope evidence, supports estimator review, prices approved takeoff items, and exports bid-ready reports with citations.

## Users
- Estimator: uploads bid packages, reviews extracted scope, edits takeoff, prices bid.
- Chief estimator: reviews risk, clarifications, exclusions, and final totals.
- Project manager/detailing lead: reviews award handoff, drawings, revisions, alternates.
- Organization admin: manages users, pricing templates, permissions, audit records.

## Core Workflows
1. Create project and upload bid package files with resumable chunks.
2. Process each file in background jobs without loading entire documents into memory.
3. Split PDFs into pages, extract vector text, OCR weak pages, extract tables, classify pages, create thumbnails, and detect sheet metadata.
4. Search across pages, specs, schedules, entities, takeoff items, risk flags, and addenda.
5. Detect steel and miscellaneous metals scope terms across all disciplines.
6. Convert candidate entities into reviewable takeoff lines with source citations and confidence.
7. Apply pricing templates and assemblies to approved items.
8. Generate scope review, RFIs, clarifications, exclusions, estimate reports, and Excel/PDF exports.
9. Upload addenda, compare revisions, flag changed scope and estimate deltas for approval.

## Non-Negotiables
- AI extraction is never final. Every generated item has evidence, confidence, reason, editable fields, and review status.
- Every takeoff and estimate line must be source traceable to project, file, page/sheet, and optional visual/text span.
- Processing is page-level and job-driven.
- File storage uses private object storage and signed URLs.
- Organization isolation, roles, audit logs, and safe file validation are required from the first implementation phase.

## MVP Phases
### Phase 1
Project creation, chunked upload contracts, file records, document/page records, PDF page processing jobs, OCR/text extraction interfaces, page classification, search index model, document viewer shell.

### Phase 2
Drawing log, spec extraction, steel term detection, risk flags, manual takeoff table, AISC-oriented steel shape database, basic pricing templates.

### Phase 3
AI-assisted takeoff candidates, source-linked estimate lines, confidence/review workflow, Excel exports, PDF reports.

### Phase 4
Drawing measurements, scale calibration, markup overlays, revision comparison, addenda impact report.

### Phase 5
Advanced pricing, assemblies, RFI/proposal generation, integrations.

## Success Metrics
- Uploads resume after interruption for multi-GB plan sets.
- Page processing status is visible within seconds of upload completion.
- Estimators can jump from any takeoff item to source evidence.
- Search finds steel scope across drawings, specs, addenda, and bid forms.
- Scope review catches non-obvious metals work in architectural, civil, and MEP sheets.
- Exported Excel/PDF reports are usable as internal pricing backup and bid documentation.
