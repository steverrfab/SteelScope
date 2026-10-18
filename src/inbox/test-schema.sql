-- Test-only copy of the three pipeline tables in prisma/schema.prisma.
-- Used by scan.test.ts against a throwaway local database. In production,
-- Prisma creates these tables from schema.prisma. Keep the two in step.

DROP TABLE IF EXISTS quarantined_invites;
DROP TABLE IF EXISTS inbox_messages;
DROP TABLE IF EXISTS bid_invites;

CREATE TABLE bid_invites (
  id                 uuid PRIMARY KEY,
  source             text NOT NULL,
  project_name       text,
  project_key        text,
  gc                 text,
  contact            text,
  location           text,
  scopes             text[],
  due_date           date,
  due_time           text,
  due_time_zone      text,
  walkthrough        text,
  rfi_deadline       text,
  plan_links         jsonb NOT NULL,
  flags              text[],
  status             text NOT NULL,
  decision_by        text,
  decision_at        timestamp(3),
  decision_reason    text,
  calendar_entry_id  integer,
  created_at         timestamp(3) NOT NULL,
  updated_at         timestamp(3) NOT NULL
);
CREATE INDEX bid_invites_status_due_date_idx ON bid_invites (status, due_date);
CREATE INDEX bid_invites_project_key_idx ON bid_invites (project_key);

CREATE TABLE inbox_messages (
  id                   uuid PRIMARY KEY,
  graph_message_id     text NOT NULL UNIQUE,
  internet_message_id  text,
  received_at          timestamp(3) NOT NULL,
  from_address         text NOT NULL,
  from_name            text,
  subject              text NOT NULL,
  kind                 text NOT NULL,
  source               text NOT NULL,
  reason               text NOT NULL,
  safe_text            text NOT NULL,
  invite_id            uuid REFERENCES bid_invites (id) ON DELETE SET NULL ON UPDATE CASCADE,
  match_status         text,
  match_note           text,
  created_at           timestamp(3) NOT NULL
);
CREATE INDEX inbox_messages_kind_received_at_idx ON inbox_messages (kind, received_at);
CREATE INDEX inbox_messages_invite_id_idx ON inbox_messages (invite_id);

CREATE TABLE quarantined_invites (
  id                 uuid PRIMARY KEY,
  sender             text NOT NULL,
  subject            text NOT NULL,
  held_on            text NOT NULL,
  first_seen_at      timestamp(3) NOT NULL,
  digest_message_id  uuid NOT NULL,
  UNIQUE (sender, subject, held_on)
);
