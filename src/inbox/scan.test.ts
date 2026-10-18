// Matching rules always run. Database tests run only when TEST_DATABASE_URL
// points at a throwaway Postgres; they drop and recreate the pipeline tables.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

import { gcKey, matchUpdate, projectKey, findDuplicate } from "./matching";
import { scanEmails, type IncomingEmail } from "./scan";
import * as fx from "./fixtures";
import type { EmailInput } from "./types";

test("project and GC keys", () => {
  assert.equal(projectKey("Falling Waters Elementary School (Falling Waters, WV)"), "falling waters elementary school");
  assert.equal(projectKey("County Fire Station #9 Project"), "county fire station 9");
  assert.equal(projectKey("Gym"), null, "too short to match on safely");
  assert.equal(gcKey("Sample Contracting, Inc"), "sample");
  assert.equal(gcKey("Example Construction Co."), "example");
});

test("update matching: one clear match, ambiguous, or none", () => {
  const invites = [
    { id: "a", projectKey: "transit maintenance facility", gc: "Alpha Builders Inc" },
    { id: "b", projectKey: "transit maintenance facility", gc: "Beta Contracting LLC" },
    { id: "c", projectKey: "riverside middle entrance renovation", gc: "Example Builders LLC" },
  ];
  assert.deepEqual(matchUpdate(invites, "Addendum 2 - Riverside Middle Entrance Renovation").status, "matched");
  const twoGc = matchUpdate(invites, "Addendum 1 - Transit Maintenance Facility");
  assert.equal(twoGc.status, "ambiguous");
  const withGc = matchUpdate(invites, "Beta Contracting sent a message about Transit Maintenance Facility");
  assert.equal(withGc.status, "matched");
  assert.equal(withGc.status === "matched" && withGc.inviteId, "b");
  assert.equal(matchUpdate(invites, "Addendum #3 - 10 Sample Road").status, "unmatched");
  assert.equal(findDuplicate(invites, "Transit Maintenance Facility", "Beta Contracting, LLC")?.id, "b");
  assert.equal(findDuplicate(invites, "Transit Maintenance Facility", "Gamma Inc"), null);
});

const url = process.env.TEST_DATABASE_URL;
// These tests drop tables. Refuse anything that is not on this machine.
if (url && !/^postgres(ql)?:\/\/[^@/]*@?(localhost|127\.0\.0\.1)(:\d+)?\//.test(url)) {
  throw new Error("TEST_DATABASE_URL must point at a local throwaway database (localhost or 127.0.0.1).");
}
const sql = readFileSync(join(__dirname, "test-schema.sql"), "utf8");
const item = (id: string, email: EmailInput): IncomingEmail => ({ graphMessageId: id, email });

const all: IncomingEmail[] = (Object.keys(fx) as (keyof typeof fx)[]).map((k) => item(`msg-${k}`, fx[k] as EmailInput));

test("scan: stores every email once, sorts and links them", { skip: !url && "TEST_DATABASE_URL not set" }, async () => {
  const pool = new Pool({ connectionString: url });
  try {
    await pool.query(sql);
    const s = await scanEmails(pool, all);
    assert.equal(s.read, all.length);
    assert.equal(s.newInvites, 6);
    assert.equal(s.updatesMatched, 2, "Blue Book addenda and BuildingConnected extension");
    assert.equal(s.updatesUnmatched, 1, "addendum for a project not on file");
    assert.equal(s.digests, 2);
    assert.equal(s.other, 1);
    assert.equal(s.quarantinedNew, 2);
    assert.equal(s.dueDateNotices, 0, "addenda repeats the same due date");

    // Nothing written outside the pipeline's three tables; spot-check content.
    const inv = await pool.query("SELECT * FROM bid_invites WHERE project_key = 'riverside middle entrance renovation'");
    assert.equal(inv.rowCount, 1);
    assert.equal(inv.rows[0].status, "new");
    assert.equal(inv.rows[0].gc, "Example Builders LLC");
    const linked = await pool.query("SELECT count(*)::int AS n FROM inbox_messages WHERE invite_id = $1", [inv.rows[0].id]);
    assert.equal(linked.rows[0].n, 2, "invite plus its addenda notice");

    const secret = await pool.query("SELECT count(*)::int AS n FROM inbox_messages WHERE safe_text LIKE '%Fake$Key9%'");
    assert.equal(secret.rows[0].n, 0, "access code never stored");

    const conflict = await pool.query("SELECT due_date, flags FROM bid_invites WHERE project_key = 'visitor center rehabilitation'");
    assert.equal(conflict.rows[0].due_date, null);
    assert.ok(conflict.rows[0].flags.some((f: string) => /conflicts/.test(f)));

    // Running the same batch again changes nothing.
    const again = await scanEmails(pool, all);
    assert.equal(again.alreadySeen, all.length);
    assert.equal(again.read, 0);
    const n = await pool.query("SELECT (SELECT count(*) FROM bid_invites)::int AS i, (SELECT count(*) FROM quarantined_invites)::int AS q");
    assert.deepEqual(n.rows[0], { i: 6, q: 2 });
  } finally {
    await pool.end();
  }
});

test("scan: duplicate invite is linked; a changed due date is flagged, not applied", { skip: !url && "TEST_DATABASE_URL not set" }, async () => {
  const pool = new Pool({ connectionString: url });
  try {
    await pool.query(sql);
    const resent: EmailInput = { ...fx.blueBookInvite, receivedAt: "2026-10-17T10:00:00Z" };
    const memo: EmailInput = {
      fromAddress: "ExampleBuildersLLC.oneteam.build@bbbid.thebluebook.com",
      fromName: "Example Builders LLC",
      subject: 'General Memo for "Bid date moved" Riverside Middle Entrance Renovation (Sampletown, MD)',
      receivedAt: "2026-10-18T09:00:00Z",
      html: "<p>General Memo</p><p>Bid is due by 2:00 PM (Eastern) on November 13, 2026</p><p>Example Builders LLC has invited you to bid on Riverside Middle Entrance Renovation.</p>",
    };
    const s = await scanEmails(pool, [item("m1", fx.blueBookInvite), item("m2", resent), item("m3", memo)]);
    assert.equal(s.newInvites, 1);
    assert.equal(s.duplicateInvites, 1);
    assert.equal(s.updatesMatched, 1);
    assert.equal(s.dueDateNotices, 1);
    const r = await pool.query("SELECT to_char(due_date,'YYYY-MM-DD') AS due, flags FROM bid_invites");
    assert.equal(r.rowCount, 1);
    assert.equal(r.rows[0].due, "2026-11-06", "due date on file is not changed automatically");
    assert.ok(r.rows[0].flags.some((f: string) => /November 13, 2026/.test(f) && /2026-11-06/.test(f)));
    assert.ok(r.rows[0].flags.some((f: string) => /Also received via bluebook/.test(f)));
  } finally {
    await pool.end();
  }
});

test("scan: an update for a project bid by two GCs is held for a person", { skip: !url && "TEST_DATABASE_URL not set" }, async () => {
  const pool = new Pool({ connectionString: url });
  try {
    await pool.query(sql);
    const inviteFrom = (gc: string, id: string): IncomingEmail =>
      item(id, {
        fromAddress: `${id}@message.planhub.com`,
        fromName: "Estimator",
        subject: `ITB - Transit Maintenance Facility Sampleville, Maryland (${gc})`,
        receivedAt: "2026-10-01T10:00:00Z",
      });
    const addendum = item("a1", {
      fromAddress: "plans@example-planroom.com",
      fromName: "Plan Room",
      subject: "Addendum 1 - Transit Maintenance Facility Sampleville, Maryland",
      receivedAt: "2026-10-05T10:00:00Z",
      text: "Addendum 1 has been posted.",
    });
    const s = await scanEmails(pool, [inviteFrom("Alpha Builders Inc", "p1"), inviteFrom("Beta Contracting LLC", "p2"), addendum]);
    assert.equal(s.newInvites, 2);
    assert.equal(s.updatesAmbiguous, 1);
    const m = await pool.query("SELECT invite_id, match_status FROM inbox_messages WHERE graph_message_id = 'a1'");
    assert.deepEqual(m.rows[0], { invite_id: null, match_status: "ambiguous" });
  } finally {
    await pool.end();
  }
});
