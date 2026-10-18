# R&R takeoff pipeline

This repo (SteelScope) is the R&R Fabrication takeoff pipeline: inbox reading,
invite review, drawing intake, takeoff, and handoff to the bid tool. The plan
is ARCHITECTURE.md. Read it first.

## Rules from Steve

- Plain English in everything Steve reads. No jargon. No em dashes.
- One change at a time. Verify each step works before moving on.
- No commits or pushes without Steve's explicit confirmation.
- Update README.md, ARCHITECTURE.md, CLAUDE.md and CHANGELOG.md as work lands.
- Nothing is submitted or sent to a GC automatically. A person approves every bid.
- No invented numbers. Unclear, conflicting or missing information is flagged,
  never guessed.

## The bid tool

The bid tool lives in `steverrfab/rrfab-bid` and `steverrfab/rrfab-bid-frontend`.
Its rules are in rrfab-bid's BUSINESS_RULES.md and both repos' CLAUDE.md.

- Nothing in this repo may change the bid tool's data except through one
  locked entry point that reuses the bid tool's own Calendar and Start bid logic.
- Any bid tool change is proven on the bid tool's test copy before live, and
  ships with a What's New entry saying whether existing bids are affected.
- The bid tool redeploys on every push to its main branch. Use a pull request.

## Safety

- This repo is public. Never commit real emails, project files, names,
  links, access codes or credentials. Test emails are made up.
- Credentials live only in Railway variables. Never in code, logs or chat.
- Portal login walls and CAPTCHAs are flagged for a person. Never bypassed.

## Checks before any commit

- `npm test` (inbox reader tests)
- `npx eslint <changed files>`
- `npx tsc --noEmit` (9 errors exist today in older `src/infrastructure`
  files; new code must add none)
