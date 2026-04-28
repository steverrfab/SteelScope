# Frontend Component Map

## App Sections
- Dashboard: bid pipeline, processing health, recent risks, pending approvals.
- Projects: project list, project metadata, bid dates, client/GC, status.
- Upload Center: chunked upload queue, progress, validation, processing status, retry controls.
- Document Viewer: page thumbnails, text/table/search sidebars, status badges.
- Drawing Viewer: pan/zoom shell, thumbnails, overlays, markups, measurement tools, takeoff linking.
- Search: unified search across text, entities, risks, specs, drawings, and takeoff.
- Takeoff: editable review table with statuses, evidence panel, shape picker, approvals.
- Estimate: pricing template selection, estimate breakdown, repricing, margin controls.
- Scope Review: included/potential/excluded/conflict/risk findings, RFIs, clarifications.
- Addenda: upload addenda, changed sheets, affected items, approval queue, net delta.
- Reports: export jobs and artifact download links.
- Settings: users, roles, organization, integrations, storage/AI configuration.
- Pricing Database: templates, rates, shape catalog, assemblies.

## Shared Components
- `AppShell`: navigation and project context.
- `StatusBadge`: processing/review/export status.
- `EvidenceLink`: jumps from business row to source page/sheet.
- `ConfidenceMeter`: numeric confidence plus review flag.
- `MoneyBreakdown`: estimate category totals.
- `RiskFlagList`: grouped risk and scope warnings.
- `SourceCitationPanel`: text quote, sheet/page, bbox, extraction reason.
- `ReviewStatusControl`: not reviewed, needs review, approved, rejected, edited, excluded, clarification needed.

## Viewer Components
- `ThumbnailRail`
- `PageCanvas`
- `DrawingToolbar`
- `SearchInSheet`
- `MeasurementLayer`
- `MarkupLayer`
- `AIDetectionOverlay`
- `RevisionCompareLayer`

## Data Loading
Server components fetch stable project data. Client components own upload progress, viewer gestures, measurement state, and optimistic takeoff edits.
