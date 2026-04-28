# MVP Implementation Plan

## Milestone 1: Foundations
- Next.js app shell, navigation, project dashboard.
- Auth context and role checks.
- Domain models, enums, and source evidence types.
- PostgreSQL schema and repository contracts.
- Storage, queue, OCR, LLM, embedding, and report interfaces.

## Milestone 2: Upload and Processing Contracts
- Resumable upload initiate/chunk/complete routes.
- File validation service.
- File/page/document records.
- Queue job contracts and worker skeletons.
- Processing status dashboard.

## Milestone 3: Page Intelligence
- PDF page split adapter interface.
- OCR/vector text ingestion schema.
- Page classifier and steel/risk vocabulary detection.
- Search indexing contracts.
- Drawing log metadata fields.

## Milestone 4: Estimating Core
- Steel shape database and calculations.
- Manual takeoff table.
- Review statuses and source citations.
- Pricing template engine.
- Estimate breakdown.

## Milestone 5: Reports and Addenda
- Excel workbook generator interface and initial tabs.
- PDF report generator interface.
- Revision comparison model.
- Addenda impact delta model.

## First Coding Slice
This repository implements Milestones 1 and 2 with production-shaped boundaries, plus a usable UI shell and domain logic for steel shapes, pricing, scope vocabulary, review status, upload contracts, and worker jobs.
