# Airam AC Service — Admin Panel Design

Status: Approved
Date: 2026-08-06

## Purpose

Airam AC Service's site (`airam-ac-service`, Next.js 16) is currently a pure marketing site with no backend: bookings are appended to a local `data/leads.jsonl` file and there is no database, auth, or admin surface. This design adds a real, production-usable admin panel so the business can run day-to-day operations from it: leads, job scheduling, customers, technicians, service pricing, invoicing, and inventory.

This is for **real business use** (not a demo) — the owner will use this to actually run the company.

## Architecture & Auth

- **Stack**: existing Next.js 16 App Router app, extended with `@supabase/supabase-js` and `@supabase/ssr`.
- **Database**: a **new, dedicated Supabase project**, created and owned by the user in a separate Supabase account (not shared with CentuMania projects). This design does not provision that project — the user supplies the project URL + keys once created, via environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- **Auth**: Supabase Auth, email/password. Public self-signup is disabled at the Supabase project level — the one admin user is created directly via the Supabase dashboard (or a one-off script), not through an in-app signup flow.
- **Authorization model**: single role. Having a valid Supabase session in this project *is* being an admin — there is no separate roles/permissions table. This matches the "single admin role" requirement and avoids a permissions system that has nothing to enforce yet.
- **Route protection**: Next.js middleware guards every `/admin/**` route (except `/admin/login`), redirecting unauthenticated requests to login and authenticated requests away from `/admin/login`.
- **Data access**: admin mutations run through Next.js Server Actions using a server-side Supabase client authenticated with the **service role key** (never sent to the browser). RLS is enabled on every table with a single default-deny policy (`service_role` only) as defense in depth, even though the service role bypasses RLS by design — this ensures a future anon/authenticated key can never read these tables.
- **Public site integration**: `POST /api/book` (existing route) is changed to insert into the new `leads` table (via the service-role client) instead of appending to `data/leads.jsonl`. No other public-facing page changes — service/blog/location marketing pages and content JSON are untouched.

## Data Model (Postgres)

```
customers
  id, name, phone, email, address, area, notes, active, created_at

ac_units
  id, customer_id -> customers, type (split|window|cassette|vrf|vrv),
  brand, capacity_tons, install_date, location_in_property, notes, created_at

technicians
  id, name, phone, areas_covered (text[], values from the 14 site locations),
  skills (text[]), active, joined_date, created_at

leads
  id, name, phone, area, service, source (website|whatsapp|phone|referral),
  status (new|contacted|scheduled|converted|lost), notes, created_at

jobs
  id, lead_id -> leads (nullable), customer_id -> customers (nullable),
  ac_unit_id -> ac_units (nullable), technician_id -> technicians (nullable),
  service_id -> services, scheduled_date, scheduled_time_slot,
  address, area, status (unassigned|assigned|in_progress|completed|cancelled),
  notes, completed_at, created_at

services
  id, slug, name, category, base_price, active, created_at
  -- operational price list only; distinct from src/content/services/*.json
  -- (marketing copy), which is untouched by this design

invoices
  id, job_id -> jobs, customer_id -> customers, invoice_number,
  line_items (jsonb: [{description, qty, rate, amount}]),
  subtotal, tax_amount (manually entered, no auto GST% engine), total,
  status (unpaid|partial|paid), payment_method, paid_amount, paid_at,
  notes, created_at

inventory_items
  id, name, category, unit, quantity_on_hand, reorder_level,
  cost_price, notes, created_at

inventory_usage
  id, item_id -> inventory_items, job_id -> jobs (nullable, null = manual restock),
  quantity_delta (negative = usage, positive = restock), used_at, notes

settings
  singleton row: business_name, address, phone, gstin (nullable, for future use)
```

Notes:
- Customers/technicians are soft-deleted via `active` — never hard-deleted, since jobs/invoices reference them and history must be preserved.
- `inventory_usage.quantity_delta` is the single ledger for both consumption and restocks; `inventory_items.quantity_on_hand` is a maintained running total, updated transactionally whenever a usage row is inserted.

## Module Screens

- **`/admin/login`** — email/password sign-in.
- **`/admin`** (Dashboard) — KPI cards (revenue this month, jobs this month, lead conversion %, low-stock count), today's schedule, leads needing action, top areas/services.
- **`/admin/leads`** — table with status filter, inline status change, "Convert to job" (creates job + optionally new customer/AC unit).
- **`/admin/jobs`** — Kanban board (by status) and calendar view (day/week, by technician), toggleable. Job detail: assign technician, schedule date/time, link customer + AC unit, notes; marking complete prompts for parts used (inventory) and invoice creation.
- **`/admin/customers`** — list + detail (contact info, AC units, job/service history, invoices).
- **`/admin/technicians`** — list + detail (contact info, areas covered — multi-select of the 14 site locations, active toggle, assigned job counts).
- **`/admin/services`** — operational price list: name, category, base price, active toggle.
- **`/admin/invoices`** — list filterable by status; create/edit with line items (auto subtotal), manual tax amount, total, payment method, mark paid/partial with amount + date.
- **`/admin/inventory`** — stock list with reorder-level highlighting, restock action; usage auto-logged when parts are recorded against a completed job, with a hard block against negative stock.
- **`/admin/settings`** — business info printed/shown on invoices (name, address, phone, optional GSTIN).

## Error Handling & Data Integrity

- All writes validated with Zod schemas, client and server side (consistent with the existing booking form pattern).
- Customers/technicians are soft-deleted (`active` flag) rather than hard-deleted when they have related jobs/invoices, to avoid orphaned records and preserve history.
- Inventory usage cannot exceed `quantity_on_hand` — blocked in the UI with an inline error.
- All Server Actions wrap Supabase calls in try/catch and surface failures via toast — no silent failures on network/DB errors.

## Testing

- No test framework currently exists in the repo. Vitest will be added for pure-logic unit tests only:
  - invoice total calculation (line items → subtotal → total with manual tax)
  - low-stock detection
  - lead → job conversion mapping
  - Zod schema edge cases (invalid phone, negative quantities)
- No end-to-end/browser test suite is added — for a single-admin internal tool this is disproportionate scaffolding. Every screen will instead be manually verified against the live dev preview before being considered done.

## Explicitly Out of Scope

- AMC contract tracking/renewal admin (site's existing static AMC marketing content/plans page is untouched).
- Reviews & feedback module.
- Online payment gateway integration (Razorpay etc.) — invoices are tracked manually.
- PDF invoice generation — on-screen invoice records only.
- Automatic GST % calculation — tax is a manually entered amount.
- Multi-role permissions (owner vs staff) or technician self-service logins.
