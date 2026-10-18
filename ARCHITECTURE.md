# R&R Takeoff Pipeline: Architecture

Status: approved plan, no code yet. Last updated October 18, 2026
(inbox sample findings added).

## What it does

Reads bid invites from estimating@rrfabrication.org, lets a person decide which
jobs to bid, gets the drawings and specs, runs a takeoff on R&R's scope only,
proves every page was reviewed, and hands an approved takeoff to the bid tool.

Nothing is ever sent or submitted to a GC automatically.

## Ground rules

1. **The bid tool must not be harmed.** The pipeline is a separate app with its
   own database. A failure in the pipeline cannot reach the bid tool.
2. **The bid tool's existing rules apply.** See BUSINESS_RULES.md in rrfab-bid.
   No new rules without Steve's approval.
3. **No invented numbers.** Anything unclear, conflicting or missing becomes an
   RFI candidate.
4. **A person approves before anything moves forward** at each gate listed
   below.
5. **One change at a time.** Each step is verified before the next starts.
6. **No commits without Steve's explicit confirmation.**

## The parts

| Part | What it is | Built from |
|---|---|---|
| Pipeline app | Inbox reader, Invite Review list, takeoff review screens, Excel export, bid tool hookup | SteelScope repo (Next.js, TypeScript, Postgres) |
| Reading engine | Splits plan sets into pages, reads text, OCR for scanned sheets, drawing index check, coverage tracking | Takeoffs repo (Python), runs beside the app |
| Bid tool | Unchanged except one small, locked add-on described below | rrfab-bid, rrfab-bid-frontend |

## Step by step

### 1. Inbox reading
- Read-only access to estimating@ through Microsoft Graph, limited to that one
  mailbox.
- Every email is logged and sorted into one of four types:
  - **New invite:** Blue Book, BuildingConnected, PlanHub, or a GC directly.
  - **Update to a known invite:** addenda, RFI responses, due date extensions,
    site visits, scope of work posted, reminders. Attached to the matching
    invite. A due date change is flagged for a person to confirm on the
    Calendar. Nothing in the bid tool changes on its own.
  - **Digest or marketing:** daily summaries, "projects near you," vendor
    sales emails. Logged and ignored.
  - **Spam filter digest:** any bid invite the filter quarantined is shown on
    the Invite Review list so it is not missed.
- From invites it pulls: project name, GC, bid due date, walkthrough date, RFI
  deadline, plans link, platform.
- A field it cannot find is left blank and flagged. Never guessed.
  BuildingConnected invite emails never include the due date, so those always
  arrive with the date blank for a person to fill.
- Links wrapped by the spam filter are unwrapped to the real address.
- Portal access codes that appear in email text are masked in logs and screens.
- The same project from two platforms is matched, not entered twice. Each GC
  stays a separate invite, matching the bid tool's one-estimate-per-GC rule.
  One invite can cover more than one scope (for example Structural Steel and
  Misc Metals).
- Dodge invites arrive through The Blue Book, which Dodge owns. No separate
  Dodge source is needed.

### 2. Invite Review (person decides)
- Each invite appears on the Invite Review list inside the pipeline.
- **Nothing is added to the bid tool at this stage.**
- A person clicks **Bid** or **Pass**.
  - Pass: reason is logged. Nothing else happens.
  - Bid: the pipeline adds the invite to the bid tool's Bid Calendar, the same
    way an estimator does today, then starts step 3.

### 3. Getting the drawings and specs
- Direct download links in emails are used first. Many invites need no login.
- Portal logins use credentials stored only in Railway variables. Never written
  to logs, never sent through chat.
- Login wall, CAPTCHA or two-factor code: stop, mark "manual download needed,"
  and show an upload button. No attempt to get around it.
- Each file is fingerprinted so re-sent sets and addenda are detected.
- Portals are automated one at a time, only where the portal's terms allow it.

### 4. Takeoff

**Our scope:** structural steel (beams, columns, braces, joists, deck if in
scope, embeds, base plates, connections), miscellaneous metals (lintels, angles,
bollards, ladders, gratings, frames, supports), stairs (pan, stringers,
landings), railings, guardrails, handrails.

**Not our scope:** sheet metal, roofing, HVAC ductwork, anything outside these
divisions. These go on an Excluded list with their source so the line can be
checked.

**How nothing gets skipped:**

1. **Page inventory.** Every PDF is split into single pages. Each page gets a
   record: file, page number, sheet number, sheet title. Nothing moves on until
   every page has a record.
2. **Drawing index check.** The sheet list on the cover sheet is compared with
   the pages received. Missing sheets are flagged right away.
3. **Screening pass.** Every page is read and marked: our scope, not our scope,
   or unsure. The reason is recorded. Unsure is treated as our scope.
4. **Detail pass.** Our-scope pages are read at high resolution. Large sheets
   are cut into overlapping tiles so small callouts are not missed.
5. **Specs.** Division 05 (Metals) is read in full. Every other section is
   searched for metals terms (steel, galvanized, embed, lintel, bollard,
   railing, grating, and more) and every hit is read. Finish and grade
   requirements from the specs are applied to matching items.
6. **Weights.** Calculated from the bid tool's own AISC table, not by AI. A
   missing length means a blank weight plus an RFI candidate.
7. **Cross-check.** Schedule counts are compared with plan counts. An item shown
   on both a plan and a detail is counted once. Conflicts become RFI candidates.
8. **Second read.** Structural sheets get an independent second pass.
   Disagreements are flagged.
9. **Coverage gate.** The takeoff cannot be marked complete while any page or
   spec section shows "not reviewed."

**Every item records:** description, size, quantity, length, unit weight, total
weight, finish (galvanized, primed, painted), connection type, grade, source
sheet or spec page, location on the sheet, and confidence.

**Connections** shown as "by fabricator" or "designed by others" are flagged for
an allowance, not counted. **Joists and deck** are flagged for scope
confirmation, since they are often bought from a supplier.

### 5. Takeoff Review (person decides)
- An estimator reviews items, RFI candidates, excluded items and the coverage
  report.
- They can accept, fix or reject any item and add missing ones.
- Only an approved takeoff moves to step 6.

### 6. Into the bid tool
- After approval, the pipeline runs the bid tool's existing **Start bid** steps
  on the Calendar entry: new estimate, status Draft, next bid number, owned by
  the assigned estimator.
- Approved takeoff rows are loaded with their sheet references.
- Why not earlier: bid numbers are one shared series. Creating estimates for
  invites R&R might drop would waste numbers.
- The bid tool's takeoff grid does not store finish or grade per row. The full
  detail stays in the pipeline and the Excel file.

### 7. Notice to Steve
Email to stevem@rrfabrication.org: project name, GC, bid due date, link to the
estimate. Internal only.

### 8. Excel file
- **Takeoff** tab: item, description, size, quantity, length, unit weight, total
  weight, finish, source sheet/page.
- **Coverage** tab: every sheet and spec section, with its review status.
- **RFI Candidates** tab: each question with its source.
- **Excluded Items** tab: out-of-scope items with their source.

## Person approval gates

1. **Bid or Pass** on each invite.
2. **Manual download** when a portal blocks login.
3. **Takeoff Review** before anything enters an estimate.
4. **Submission to the GC**, done by a person in the bid tool, as today.

## Bid tool changes

The only change planned: one locked entry point (same shared-key method the bid
tool already uses for other tools) that lets the pipeline:
- add a Calendar entry, and
- run Start bid and load approved takeoff rows.

Both reuse the bid tool's existing logic. No changes to pricing math, existing
tables or existing bids. Proven on the test copy build before the live tool.
Ships with a What's New entry that says existing bids are not affected.

Deferred: The Blue Book and Dodge are not on the Calendar's source list. Until
Steve decides otherwise, those invites save as "Other."

## Pipeline database

| Table | Holds |
|---|---|
| inbox_messages | Every email seen and how it was sorted |
| bid_invites | Parsed invite fields, platform, Bid/Pass decision, Calendar entry link |
| documents | Each file, fingerprint, download status, manual flag |
| pages | One row per page, sheet number, screened and read status |
| spec_sections | Each spec section and whether it was read |
| takeoff_runs | Each takeoff attempt and its version |
| takeoff_items | Every item with all fields, source page, confidence, review status |
| excluded_items | Out-of-scope items with source |
| rfi_candidates | Unclear, conflicting or missing information with source |
| activity_log | Every action, for an audit trail |

## Risks and limits

- **Accuracy.** AI-read takeoffs are a first draft. Expect misses on dense or
  poorly scanned sheets. Takeoff Review is required.
- **Accuracy bar.** Before trusting results: 98% item match and 98% quantity
  match against human takeoffs on 2 or 3 past jobs, with 100% of items traced
  to a source. This is the test already written in the Takeoffs repo.
- **Portals.** Many bid platforms prohibit automated logins, use two-factor
  codes, or change their pages. Automated logins will break. Direct links and
  manual upload come first.
- **Spam filter.** In the sample month, the spam filter quarantined 6 real
  PlanHub invites. Until PlanHub is allow-listed, those never reach the inbox
  and the pipeline only sees them in the quarantine digest.
- **Cost.** Reading a large set at high resolution costs money per job. Measured
  in phase 6. The Bid/Pass gate keeps cost off jobs R&R will not bid.

## Build order

| Phase | Work | Done when |
|---|---|---|
| 1 | Docs: BUSINESS_RULES.md, this file | Steve approves |
| 2 | Inbox reader, read-only | Correctly sorts the last 30 days of real invites |
| 3 | Invite Review list with Bid/Pass | Steve can decide on real invites |
| 4 | Bid tool entry point, Calendar add on Bid | Works on test copy, then live |
| 5 | Document intake, page inventory, coverage report | Every page of a real set accounted for |
| 6 | Spec reading, Division 05 first | Matches a human spec review on a past job |
| 7 | Drawing takeoff | Meets the 98% bar on past jobs |
| 8 | Takeoff Review screen and Excel export | Estimator can approve and download |
| 9 | Start bid, load takeoff, notify Steve | Works on test copy, then live |
| 10 | Portal logins, one at a time | Only where permitted |
