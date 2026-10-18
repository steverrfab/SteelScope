// Read a batch of estimating@ emails into the pipeline's own tables.
//
// Safe to run again on the same emails: each email is stored once, by its
// Microsoft message ID. Writes only to inbox_messages, bid_invites and
// quarantined_invites. Never writes to the bid tool and never sends mail.

import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";

import { findDueInBody } from "./dates";
import { readEmail } from "./index";
import { findDuplicate, matchUpdate, projectKey, type InviteKey } from "./matching";
import type { EmailInput, InviteFields } from "./types";

export interface IncomingEmail {
  graphMessageId: string;
  internetMessageId?: string;
  email: EmailInput;
}

export interface ScanSummary {
  read: number;
  alreadySeen: number;
  newInvites: number;
  duplicateInvites: number;
  updatesMatched: number;
  updatesAmbiguous: number;
  updatesUnmatched: number;
  dueDateNotices: number;
  digests: number;
  other: number;
  quarantinedNew: number;
}

/** Minimal database handle: a pg Pool or Client both fit. */
export interface Db {
  connect(): Promise<PoolClient>;
}

const SAFE_TEXT_LIMIT = 20000;

function emptySummary(): ScanSummary {
  return {
    read: 0, alreadySeen: 0, newInvites: 0, duplicateInvites: 0,
    updatesMatched: 0, updatesAmbiguous: 0, updatesUnmatched: 0, dueDateNotices: 0,
    digests: 0, other: 0, quarantinedNew: 0,
  };
}

async function openInvites(c: PoolClient): Promise<InviteKey[]> {
  const r = await c.query<{ id: string; project_key: string | null; gc: string | null }>(
    "SELECT id, project_key, gc FROM bid_invites WHERE status <> 'passed'",
  );
  return r.rows.map((x) => ({ id: x.id, projectKey: x.project_key, gc: x.gc }));
}

async function insertInvite(c: PoolClient, source: string, f: InviteFields, now: Date): Promise<string> {
  const id = randomUUID();
  await c.query(
    `INSERT INTO bid_invites
      (id, source, project_name, project_key, gc, contact, location, scopes,
       due_date, due_time, due_time_zone, walkthrough, rfi_deadline, plan_links,
       flags, status, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'new',$16,$16)`,
    [
      id, source, f.projectName, projectKey(f.projectName), f.gc, f.contact, f.location, f.scopes,
      f.dueDate, f.dueTime, f.dueTimeZone, f.walkthrough, f.rfiDeadline, JSON.stringify(f.planLinks),
      f.flags, now,
    ],
  );
  return id;
}

async function addFlag(c: PoolClient, inviteId: string, flag: string, now: Date) {
  await c.query(
    `UPDATE bid_invites SET flags = array_append(flags, $2), updated_at = $3
     WHERE id = $1 AND NOT ($2 = ANY(flags))`,
    [inviteId, flag, now],
  );
}

/** An update that states a due date different from the invite's: flag it. */
async function checkDueDate(c: PoolClient, inviteId: string, text: string, received: string, now: Date) {
  const stated = findDueInBody(text).find((d) => d.date);
  if (!stated?.date) return false;
  const r = await c.query<{ due: string | null }>(
    "SELECT to_char(due_date, 'YYYY-MM-DD') AS due FROM bid_invites WHERE id = $1",
    [inviteId],
  );
  const onFile = r.rows[0]?.due ?? null;
  if (onFile === stated.date) return false;
  const day = received.slice(0, 10);
  await addFlag(
    c, inviteId,
    onFile
      ? `Email of ${day} says "${stated.raw}", but the invite shows ${onFile}. Confirm and update the Calendar.`
      : `Email of ${day} says "${stated.raw}". Confirm and enter the due date.`,
    now,
  );
  return true;
}

export async function scanEmails(db: Db, batch: IncomingEmail[], now = new Date()): Promise<ScanSummary> {
  const s = emptySummary();
  // Oldest first, so an invite is on file before its addenda arrive.
  const ordered = [...batch].sort((a, b) => a.email.receivedAt.localeCompare(b.email.receivedAt));
  const c = await db.connect();
  try {
    for (const item of ordered) {
      const seen = await c.query("SELECT 1 FROM inbox_messages WHERE graph_message_id = $1", [item.graphMessageId]);
      if (seen.rowCount) {
        s.alreadySeen++;
        continue;
      }
      const r = readEmail(item.email);
      const { kind, source, reason } = r.classification;
      let inviteId: string | null = null;
      let matchStatus: string | null = null;
      let matchNote: string | null = null;

      await c.query("BEGIN");
      try {
        if (kind === "new_invite" && r.invite) {
          const dup = findDuplicate(await openInvites(c), r.invite.projectName, r.invite.gc);
          if (dup) {
            inviteId = dup.id;
            matchStatus = "duplicate";
            matchNote = "Same project and GC already on file. Linked, not added again.";
            await addFlag(c, dup.id, `Also received via ${source} on ${item.email.receivedAt.slice(0, 10)}.`, now);
            s.duplicateInvites++;
          } else {
            inviteId = await insertInvite(c, source, r.invite, now);
            s.newInvites++;
          }
        } else if (kind === "update") {
          const hay = `${item.email.subject}\n${item.email.fromName ?? ""}\n${r.safeText.slice(0, 1500)}`;
          const m = matchUpdate(await openInvites(c), hay);
          matchStatus = m.status;
          matchNote = m.note;
          if (m.status === "matched") {
            inviteId = m.inviteId;
            s.updatesMatched++;
            if (await checkDueDate(c, m.inviteId, r.safeText, item.email.receivedAt, now)) s.dueDateNotices++;
          } else if (m.status === "ambiguous") {
            s.updatesAmbiguous++;
          } else {
            s.updatesUnmatched++;
          }
        } else if (kind === "digest") {
          s.digests++;
        } else if (kind === "other") {
          s.other++;
        }

        const msgId = randomUUID();
        await c.query(
          `INSERT INTO inbox_messages
            (id, graph_message_id, internet_message_id, received_at, from_address, from_name,
             subject, kind, source, reason, safe_text, invite_id, match_status, match_note, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [
            msgId, item.graphMessageId, item.internetMessageId ?? null, item.email.receivedAt,
            item.email.fromAddress, item.email.fromName ?? null, item.email.subject, kind, source, reason,
            r.safeText.slice(0, SAFE_TEXT_LIMIT), inviteId, matchStatus, matchNote, now,
          ],
        );

        for (const q of r.quarantined) {
          const ins = await c.query(
            `INSERT INTO quarantined_invites (id, sender, subject, held_on, first_seen_at, digest_message_id)
             VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (sender, subject, held_on) DO NOTHING`,
            [randomUUID(), q.sender, q.subject, q.heldOn, now, msgId],
          );
          s.quarantinedNew += ins.rowCount ?? 0;
        }

        await c.query("COMMIT");
        s.read++;
      } catch (err) {
        await c.query("ROLLBACK");
        throw err;
      }
    }
  } finally {
    c.release();
  }
  return s;
}
