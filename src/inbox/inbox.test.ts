import { test } from "node:test";
import assert from "node:assert/strict";

import { readEmail } from "./index";
import { redactUrl, maskSecrets, unwrapUrl } from "./urls";
import { to24h } from "./dates";
import * as fx from "./fixtures";

test("sorts every sample email into the right type", () => {
  const expect: [keyof typeof fx, string, string][] = [
    ["blueBookInvite", "new_invite", "bluebook"],
    ["blueBookAddenda", "update", "bluebook"],
    ["blueBookSummary", "digest", "bluebook"],
    ["bcInviteTwoScopes", "new_invite", "buildingconnected"],
    ["bcInviteOneScope", "new_invite", "buildingconnected"],
    ["bcUpdate", "update", "buildingconnected"],
    ["directGcConflict", "new_invite", "direct"],
    ["directGcPipeline", "new_invite", "direct"],
    ["directGcAddendum", "update", "direct"],
    ["vendorSpam", "other", "unknown"],
    ["planHubMarketing", "digest", "planhub"],
    ["planHubInvite", "new_invite", "planhub"],
    ["quarantineDigest", "quarantine_digest", "spam_filter"],
  ];
  for (const [name, kind, source] of expect) {
    const c = readEmail(fx[name] as never).classification;
    assert.equal(c.kind, kind, `${name}: kind`);
    assert.equal(c.source, source, `${name}: source`);
  }
});

test("Blue Book invite: all fields, real plans link, no flags", () => {
  const inv = readEmail(fx.blueBookInvite).invite!;
  assert.equal(inv.gc, "Example Builders LLC");
  assert.equal(inv.projectName, "Riverside Middle Entrance Renovation");
  assert.equal(inv.dueDate, "2026-11-06");
  assert.equal(inv.dueTime, "17:00");
  assert.equal(inv.dueTimeZone, "eastern");
  assert.equal(inv.location, "Sampletown, MD 21000 (Sampletown)");
  assert.deepEqual(inv.scopes, ["Structural Steel Fabricators", "Ironwork--Miscellaneous & Ornamental"]);
  assert.equal(inv.contact, "Jordan Sample");
  assert.equal(inv.planLinks.length, 1);
  assert.match(inv.planLinks[0].url, /^http:\/\/ExampleBuildersLLC\.oneteam\.build\/proj\?/);
  assert.match(inv.walkthrough ?? "", /site visit will be held on November 2/);
  assert.deepEqual(inv.flags, []);
});

test("BuildingConnected invite with two scopes: due date left blank and flagged", () => {
  const inv = readEmail(fx.bcInviteTwoScopes).invite!;
  assert.equal(inv.gc, "Sample Contracting, Inc");
  assert.equal(inv.contact, "Pat Lee");
  assert.equal(inv.projectName, "County Fire Station #9");
  assert.deepEqual(inv.scopes, ["Structural Steel", "Misc. Metals"]);
  assert.match(inv.location ?? "", /^100 Example Drive/);
  assert.equal(inv.planLinks.length, 2);
  assert.equal(inv.dueDate, null);
  assert.ok(inv.flags.some((f) => /do not include the bid due date/.test(f)));
});

test("BuildingConnected invite with one scope", () => {
  const inv = readEmail(fx.bcInviteOneScope).invite!;
  assert.equal(inv.projectName, "Cafe at Lakeside");
  assert.deepEqual(inv.scopes, ["Decorative ornamental panels"]);
  assert.equal(inv.gc, "Example Construction");
});

test("Direct GC: subject says 4 PM, body says 5 PM: no date, conflict flagged", () => {
  const inv = readEmail(fx.directGcConflict).invite!;
  assert.equal(inv.projectName, "Visitor Center Rehabilitation");
  assert.equal(inv.dueDate, null);
  assert.equal(inv.dueTime, null);
  assert.ok(inv.flags.some((f) => /conflicts/.test(f) && /4PM/.test(f) && /5:00 P/.test(f)));
  assert.ok(inv.flags.some((f) => /GC taken from sender address only/.test(f)));
  assert.equal(inv.planLinks.length, 2, "duplicate file link counted once");
  assert.ok(inv.planLinks.every((l) => l.url.startsWith("https://www.examplegc.com/files/")));
});

test("Direct GC via bid software: date, site visit, scope, access code hidden", () => {
  const r = readEmail(fx.directGcPipeline);
  const inv = r.invite!;
  assert.equal(inv.projectName, "Transition Academy");
  assert.equal(inv.dueDate, "2026-11-17");
  assert.equal(inv.dueTime, "14:00");
  assert.match(inv.walkthrough ?? "", /site visit on Tuesday, October 20, 2026/);
  assert.deepEqual(inv.scopes, ["051200: Structural Steel Framing"]);
  assert.ok(inv.flags.some((f) => /department name/.test(f)));
  assert.ok(!r.safeText.includes("Fake$Key9"), "access code must not appear in safe text");
  assert.match(r.safeText, /Security Key: \[hidden\]/);
});

test("PlanHub invite: project and GC from subject, missing due date flagged", () => {
  const inv = readEmail(fx.planHubInvite).invite!;
  assert.equal(inv.projectName, "New Field Office Sampletown, Maryland");
  assert.equal(inv.gc, "Example Construction");
  assert.equal(inv.dueDate, null);
  assert.ok(inv.flags.some((f) => /No bid due date/.test(f)));
});

test("Spam filter digest: lists held bid invites, skips marketing", () => {
  const q = readEmail(fx.quarantineDigest).quarantined;
  assert.equal(q.length, 2);
  assert.match(q[0].subject, /^ITB - New Field Office/);
  assert.equal(q[0].heldOn, "12 Oct 26 - 11:50");
  assert.match(q[1].subject, /Transit Maintenance Facility/);
});

test("updates and other emails produce no invite", () => {
  for (const e of [fx.blueBookAddenda, fx.bcUpdate, fx.directGcAddendum, fx.vendorSpam, fx.planHubMarketing]) {
    assert.equal(readEmail(e).invite, null);
  }
});

test("link helpers", () => {
  assert.equal(
    unwrapUrl("https://urldefense.proofpoint.com/v2/url?u=http-3A__www.example.com_path-3Fa-3D1-26b-3D2&d=x&e="),
    "http://www.example.com/path?a=1&b=2",
  );
  assert.equal(
    unwrapUrl("https://urldefense.com/v3/__https://example.com/a?b=1__;!!abc$"),
    "https://example.com/a?b=1",
  );
  assert.equal(unwrapUrl("https://example.com/x"), "https://example.com/x");
  assert.equal(redactUrl("https://example.com/proj?quickid=SECRET"), "https://example.com/proj?[hidden]");
  assert.equal(maskSecrets("Password: hunter2 and PIN# 1234"), "Password: [hidden] and PIN# [hidden]");
});

test("time conversion", () => {
  assert.equal(to24h("5:00 PM"), "17:00");
  assert.equal(to24h("5:00 P"), "17:00");
  assert.equal(to24h("4PM"), "16:00");
  assert.equal(to24h("12:00 PM"), "12:00");
  assert.equal(to24h("12:00 AM"), "00:00");
  assert.equal(to24h("10:00 am"), "10:00");
});
