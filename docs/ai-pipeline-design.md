# AI Pipeline Design

## Provider Interfaces
- OCR provider: image/PDF page to text, tables, confidence, bounding boxes.
- LLM provider: structured extraction and report drafting with schema validation.
- Embedding provider: text chunks to vectors for semantic search.
- Vision provider: visual detection overlays and changed area hints.

## Extraction Principles
- Deterministic term detection runs before LLM extraction.
- LLM outputs must match typed schemas and include reason, confidence, source references, and review status.
- Low confidence, missing evidence, conflicting notes, or absent scale always creates a review flag.
- AI cannot auto-approve takeoff or pricing lines.

## Scope Intelligence
The pipeline scans all disciplines:
- Architectural: stairs, rails, canopies, loose lintels, ladders, bollards.
- Structural: beams, columns, bracing, base plates, embeds, anchor rods, details.
- Civil: rails, gates, bollards, exterior metals.
- MEP: dunnage, supports, roof frames, platforms.
- Specs: finish, AESS, galvanizing, paint, welding, inspection, submittals.
- Bid forms: alternates, unit prices, allowances, separate pricing.
- Addenda: changed sheets/specs/scope.
- General notes: responsibility and delegated design language.

## Human Review Output
Every AI result includes:
- source page/sheet and text or visual reference
- confidence score
- reason
- review status
- editable fields
- generated/approved timestamps
- audit trail
