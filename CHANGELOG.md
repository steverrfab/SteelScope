# Changelog

Plain-language record of changes to the R&R takeoff pipeline.

## Unreleased

### Inbox reader logic (Phase 2, part 1)
- Reads one email and decides what it is: new bid invite, update to a known
  invite, digest or marketing, spam filter digest, or other.
- Pulls invite fields: project, GC, contact, location, scopes, bid due date
  and time, site visit, RFI deadline, plans links.
- Leaves a field blank and flags it when the email does not state it plainly.
  If the subject and body give different due dates or times, no date is set and
  both are shown for a person to settle.
- BuildingConnected invites always arrive with the due date blank and flagged,
  since their emails do not include it.
- Recovers real links from spam filter wrapped links. Hides access codes in
  text meant for logs and screens.
- Lists bid invites held in the spam filter digest so they are not missed.
- Not connected to the mailbox yet. Tested on made-up emails copied from real
  formats. No database, nothing sent anywhere.
- Bid tool: not touched.

### Docs
- ARCHITECTURE.md: plan approved October 18, 2026; inbox sample findings added.
