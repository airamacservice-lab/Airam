# Airam AC Service — Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Supabase-backed admin login and admin panel (dashboard, leads, jobs, customers, technicians, service catalog, invoices, inventory, settings) to the existing Airam AC Service Next.js marketing site, per `docs/superpowers/specs/2026-08-06-admin-panel-design.md`.

**Architecture:** Next.js 16 App Router, Supabase Postgres + Supabase Auth (email/password, single admin role = "has a session"). All admin routes live under `/admin`, guarded by root middleware. All data reads/writes happen server-side via Server Actions using the Supabase **service role** client — the browser never talks to Supabase directly. RLS is enabled on every table with zero grant policies (default-deny to anon/authenticated; service role bypasses RLS by design).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, `@supabase/supabase-js`, `@supabase/ssr`, Zod, Vitest (new — no test runner exists yet).

---

## Prerequisites (blocking, not part of the tasks below)

The user must create the Supabase project themselves (account creation is not something the agent can do) and supply:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Until these are supplied, Tasks 0–17 (all code) can be completed and verified structurally (build passes, unit tests pass), but Task 18 (apply the SQL migration to the live project) and full manual end-to-end verification require the real keys. Task 18's steps assume the Supabase MCP tools have been pointed at the Airam project, or that the SQL is run by the user via the Supabase SQL editor if MCP access isn't available.

---

## File Structure

```
supabase/migrations/0001_init.sql          # schema, triggers, RLS
.env.local.example                          # documents required env vars

src/lib/supabase/service.ts                 # service-role client (server-only, all data ops)
src/lib/supabase/server.ts                  # session-aware client (Server Components/Actions, auth only)
src/lib/supabase/middleware.ts              # session refresh + route guard helper
middleware.ts                               # root middleware, wires the guard into /admin/*

src/types/database.ts                       # hand-written row types matching the schema
src/lib/locations.ts                        # shared 15-location list (slug/name)

src/lib/calc/invoice.ts (+ .test.ts)        # subtotal/total math
src/lib/calc/inventory.ts (+ .test.ts)      # low-stock + stock-deduction guards
src/lib/calc/convert-lead.ts (+ .test.ts)   # lead -> job mapping + convertibility guard
src/lib/validation/index.ts (+ .test.ts)    # all Zod schemas for admin forms

vitest.config.ts
package.json                                # add vitest + supabase deps/scripts

src/app/login/page.tsx                      # login (sibling of /admin, not nested — no sidebar)
src/app/login/actions.ts
src/app/admin/layout.tsx
src/components/admin/sidebar.tsx
# No shared data-table/toast components: each list screen renders its own
# table and each form shows its own inline error state (YAGNI — nothing here
# is reused enough yet to justify the abstraction).

src/app/admin/page.tsx                      # dashboard
src/app/admin/dashboard-queries.ts

src/app/admin/leads/page.tsx
src/app/admin/leads/actions.ts
src/app/admin/leads/lead-row-actions.tsx

src/app/admin/customers/page.tsx
src/app/admin/customers/actions.ts
src/app/admin/customers/[id]/page.tsx
src/app/admin/customers/[id]/ac-unit-form.tsx

src/app/admin/technicians/page.tsx
src/app/admin/technicians/actions.ts
src/app/admin/technicians/technician-form.tsx

src/app/admin/services/page.tsx
src/app/admin/services/actions.ts
src/app/admin/services/service-row.tsx

src/app/admin/jobs/page.tsx
src/app/admin/jobs/actions.ts
src/app/admin/jobs/job-board.tsx            # kanban view
src/app/admin/jobs/job-calendar.tsx         # calendar view
src/app/admin/jobs/job-detail-drawer.tsx

src/app/admin/invoices/page.tsx
src/app/admin/invoices/actions.ts
src/app/admin/invoices/invoice-form.tsx

src/app/admin/inventory/page.tsx
src/app/admin/inventory/actions.ts
src/app/admin/inventory/restock-form.tsx

src/app/admin/settings/page.tsx
src/app/admin/settings/actions.ts

src/app/api/book/route.ts                   # MODIFY: write to Supabase leads instead of leads.jsonl
```

---

## Task 0: Dependencies, env scaffolding, Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `.env.local.example`

- [ ] **Step 1: Install dependencies**

Run:
```bash
cd ~/Downloads/Claude/airam-ac-service
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest
```

- [ ] **Step 2: Add test script**

Modify `package.json` scripts block to add:
```json
"test": "vitest run"
```

- [ ] **Step 3: Create Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 4: Document required env vars**

Create `.env.local.example`:
```bash
# Supabase project for Airam AC Service admin panel.
# Get these from Project Settings -> API in the Supabase dashboard.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Server-only. Never prefix with NEXT_PUBLIC_. Full database access — do not commit.
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 5: Verify Vitest runs (no tests yet)**

Run: `npm test`
Expected: `No test files found` (exits non-zero — expected until Task 1 adds a test; this step only confirms the binary and config resolve correctly, not a passing run).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts .env.local.example
git commit -m "chore: add supabase deps, vitest, env template"
```

---

## Task 1: Database schema (SQL migration)

**Files:**
- Create: `supabase/migrations/0001_init.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0001_init.sql`:
```sql
-- Airam AC Service admin panel schema.
create extension if not exists pgcrypto;

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  address text,
  area text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table ac_units (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  type text not null check (type in ('split','window','cassette','vrf','vrv')),
  brand text,
  capacity_tons numeric(3,1),
  install_date date,
  location_in_property text,
  notes text,
  created_at timestamptz not null default now()
);
create index ac_units_customer_id_idx on ac_units(customer_id);

create table technicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  areas_covered text[] not null default '{}',
  skills text[] not null default '{}',
  active boolean not null default true,
  joined_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  area text not null,
  service text not null,
  source text not null default 'website' check (source in ('website','whatsapp','phone','referral')),
  status text not null default 'new' check (status in ('new','contacted','scheduled','converted','lost')),
  notes text,
  created_at timestamptz not null default now()
);
create index leads_status_idx on leads(status);

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  base_price numeric(10,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  customer_id uuid references customers(id) on delete set null,
  ac_unit_id uuid references ac_units(id) on delete set null,
  technician_id uuid references technicians(id) on delete set null,
  service_id uuid not null references services(id),
  scheduled_date date,
  scheduled_time_slot text,
  address text,
  area text,
  status text not null default 'unassigned' check (status in ('unassigned','assigned','in_progress','completed','cancelled')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index jobs_status_idx on jobs(status);
create index jobs_scheduled_date_idx on jobs(scheduled_date);
create index jobs_technician_id_idx on jobs(technician_id);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete set null,
  customer_id uuid not null references customers(id),
  invoice_number text not null unique,
  line_items jsonb not null default '[]',
  subtotal numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  status text not null default 'unpaid' check (status in ('unpaid','partial','paid')),
  payment_method text,
  paid_amount numeric(10,2) not null default 0,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index invoices_status_idx on invoices(status);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  unit text not null default 'pcs',
  quantity_on_hand numeric(10,2) not null default 0,
  reorder_level numeric(10,2) not null default 0,
  cost_price numeric(10,2),
  notes text,
  created_at timestamptz not null default now()
);

create table inventory_usage (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  quantity_delta numeric(10,2) not null,
  used_at timestamptz not null default now(),
  notes text
);
create index inventory_usage_item_id_idx on inventory_usage(item_id);

create table settings (
  id boolean primary key default true check (id),
  business_name text not null default 'Airam AC Service',
  address text,
  phone text,
  gstin text
);
insert into settings (id) values (true);

-- Keep inventory_items.quantity_on_hand as a running total driven by the
-- usage ledger, and hard-block any insert that would take stock negative.
create or replace function apply_inventory_usage() returns trigger as $$
declare
  new_quantity numeric(10,2);
begin
  update inventory_items
    set quantity_on_hand = quantity_on_hand + new.quantity_delta
    where id = new.item_id
    returning quantity_on_hand into new_quantity;

  if new_quantity < 0 then
    raise exception 'Insufficient stock for item %: would go negative', new.item_id;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_inventory_usage_apply
  after insert on inventory_usage
  for each row execute function apply_inventory_usage();

-- Default-deny RLS: no policies are created for anon/authenticated, so those
-- roles get zero access. The app only ever talks to Postgres via the
-- service_role key, which bypasses RLS by design.
alter table customers enable row level security;
alter table ac_units enable row level security;
alter table technicians enable row level security;
alter table leads enable row level security;
alter table services enable row level security;
alter table jobs enable row level security;
alter table invoices enable row level security;
alter table inventory_items enable row level security;
alter table inventory_usage enable row level security;
alter table settings enable row level security;

-- Seed the operational service/price list from the site's existing service pages.
insert into services (slug, name, category, base_price) values
  ('ac-compressor-repair', 'AC Compressor Repair & Replacement', 'repair', 299),
  ('ac-cooling-issues', 'AC Not Cooling — Diagnosis & Repair', 'repair', 299),
  ('ac-deep-cleaning', 'AC Deep Cleaning (Jet & Foam)', 'maintenance', 799),
  ('ac-gas-filling', 'AC Gas Filling & Leak Repair', 'repair', 799),
  ('ac-installation', 'AC Installation', 'installation', 1499),
  ('ac-pcb-repair', 'AC PCB Repair', 'repair', 299),
  ('ac-uninstallation', 'AC Uninstallation', 'installation', 599),
  ('ac-water-leakage', 'AC Water Leakage Repair', 'repair', 599),
  ('amc-plans', 'Annual Maintenance Contracts', 'maintenance', 1199),
  ('cassette-ac-service', 'Cassette AC Service', 'commercial', 1299),
  ('commercial-ac-service', 'Commercial AC Service', 'commercial', 449),
  ('commercial-amc-contracts', 'Commercial AMC Contracts', 'commercial', 1499),
  ('split-ac-service', 'Split AC Service & Repair', 'repair', 499),
  ('vrf-service', 'VRF System Service', 'commercial', 599),
  ('vrv-service', 'VRV System Service', 'commercial', 999),
  ('window-ac-service', 'Window AC Service & Repair', 'repair', 449);

update settings set business_name = 'Airam AC Service';
```

- [ ] **Step 2: Commit** (this file is applied to the live project in Task 18, once credentials exist)

```bash
git add supabase/migrations/0001_init.sql
git commit -m "feat(db): add admin panel schema migration"
```

---

## Task 2: Supabase client helpers + route guard

**Files:**
- Create: `src/lib/supabase/service.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Service-role client (all data reads/writes)**

Create `src/lib/supabase/service.ts`:
```ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Server-only client using the service role key. Full database access,
 * bypasses RLS. Never import this into a Client Component.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — set them in .env.local",
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
```

- [ ] **Step 2: Session-aware client (auth only — login/logout/session checks)**

Create `src/lib/supabase/server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Session-aware client for Server Components/Actions. Uses the anon key and
 * the request's cookies — used ONLY to check/establish the admin's auth
 * session (login, logout, "who is logged in"). All actual data access goes
 * through createServiceClient() in service.ts instead.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — set them in .env.local",
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component render (no response to write
          // cookies to) — middleware.ts refreshes the session cookie instead.
        }
      },
    },
  });
}
```

- [ ] **Step 3: Middleware session-refresh + redirect helper**

Create `src/lib/supabase/middleware.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // No Supabase configured yet — let requests through unguarded rather
    // than hard-crashing every page load before credentials exist.
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  // Login lives at /login (a sibling of /admin, not nested under it) so it
  // never inherits the admin sidebar layout.
  const isLoginPage = pathname === "/login";
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute && !isLoginPage && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginPage && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
```

- [ ] **Step 4: Wire into root middleware**

Create `middleware.ts` (project root, alongside `next.config.ts`):
```ts
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase middleware.ts
git commit -m "feat(auth): add supabase clients and admin route guard"
```

---

## Task 3: Shared types & locations list

**Files:**
- Create: `src/types/database.ts`
- Create: `src/lib/locations.ts`

- [ ] **Step 1: Row types**

Create `src/types/database.ts`:
```ts
export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  area: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
};

export type AcUnitType = "split" | "window" | "cassette" | "vrf" | "vrv";

export type AcUnit = {
  id: string;
  customer_id: string;
  type: AcUnitType;
  brand: string | null;
  capacity_tons: number | null;
  install_date: string | null;
  location_in_property: string | null;
  notes: string | null;
  created_at: string;
};

export type Technician = {
  id: string;
  name: string;
  phone: string;
  areas_covered: string[];
  skills: string[];
  active: boolean;
  joined_date: string;
  created_at: string;
};

export type LeadSource = "website" | "whatsapp" | "phone" | "referral";
export type LeadStatus = "new" | "contacted" | "scheduled" | "converted" | "lost";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  area: string;
  service: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
};

export type ServiceCatalogItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  base_price: number;
  active: boolean;
  created_at: string;
};

export type JobStatus = "unassigned" | "assigned" | "in_progress" | "completed" | "cancelled";

export type Job = {
  id: string;
  lead_id: string | null;
  customer_id: string | null;
  ac_unit_id: string | null;
  technician_id: string | null;
  service_id: string;
  scheduled_date: string | null;
  scheduled_time_slot: string | null;
  address: string | null;
  area: string | null;
  status: JobStatus;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
};

export type InvoiceLineItem = {
  description: string;
  qty: number;
  rate: number;
  amount: number;
};

export type InvoiceStatus = "unpaid" | "partial" | "paid";

export type Invoice = {
  id: string;
  job_id: string | null;
  customer_id: string;
  invoice_number: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax_amount: number;
  total: number;
  status: InvoiceStatus;
  payment_method: string | null;
  paid_amount: number;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  quantity_on_hand: number;
  reorder_level: number;
  cost_price: number | null;
  notes: string | null;
  created_at: string;
};

export type InventoryUsage = {
  id: string;
  item_id: string;
  job_id: string | null;
  quantity_delta: number;
  used_at: string;
  notes: string | null;
};

export type Settings = {
  business_name: string;
  address: string | null;
  phone: string | null;
  gstin: string | null;
};

/** Minimal Supabase-JS generic param placeholder — no generated types yet. */
export type Database = Record<string, unknown>;
```

- [ ] **Step 2: Shared locations list**

Create `src/lib/locations.ts`:
```ts
/**
 * Mirrors the 15 location slugs in src/content/locations/*.json — kept as a
 * plain constant (not read from the content files) so technician areas and
 * lead areas don't depend on the marketing content layer.
 */
export const LOCATIONS = [
  { slug: "adyar", name: "Adyar" },
  { slug: "anna-nagar", name: "Anna Nagar" },
  { slug: "chromepet", name: "Chromepet" },
  { slug: "ecr", name: "ECR" },
  { slug: "guindy", name: "Guindy" },
  { slug: "medavakkam", name: "Medavakkam" },
  { slug: "mylapore", name: "Mylapore" },
  { slug: "nungambakkam", name: "Nungambakkam" },
  { slug: "omr", name: "OMR" },
  { slug: "perungudi", name: "Perungudi" },
  { slug: "porur", name: "Porur" },
  { slug: "sholinganallur", name: "Sholinganallur" },
  { slug: "t-nagar", name: "T Nagar" },
  { slug: "tambaram", name: "Tambaram" },
  { slug: "velachery", name: "Velachery" },
] as const;

export type LocationSlug = (typeof LOCATIONS)[number]["slug"];
```

- [ ] **Step 3: Commit**

```bash
git add src/types/database.ts src/lib/locations.ts
git commit -m "feat: add admin panel row types and locations list"
```

---

## Task 4: Pure calc functions (TDD)

**Files:**
- Create: `src/lib/calc/invoice.ts`, `src/lib/calc/invoice.test.ts`
- Create: `src/lib/calc/inventory.ts`, `src/lib/calc/inventory.test.ts`
- Create: `src/lib/calc/convert-lead.ts`, `src/lib/calc/convert-lead.test.ts`

- [ ] **Step 1: Write failing invoice math tests**

Create `src/lib/calc/invoice.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { calcSubtotal, calcTotal } from "./invoice";

describe("calcSubtotal", () => {
  it("sums qty * rate across line items", () => {
    const subtotal = calcSubtotal([
      { description: "Gas top-up", qty: 1, rate: 799, amount: 0 },
      { description: "Filter", qty: 2, rate: 150, amount: 0 },
    ]);
    expect(subtotal).toBe(1099);
  });

  it("returns 0 for an empty line item list", () => {
    expect(calcSubtotal([])).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    const subtotal = calcSubtotal([{ description: "x", qty: 3, rate: 33.333, amount: 0 }]);
    expect(subtotal).toBe(100);
  });
});

describe("calcTotal", () => {
  it("adds the manually entered tax amount to the subtotal", () => {
    expect(calcTotal(1099, 100)).toBe(1199);
  });

  it("handles zero tax", () => {
    expect(calcTotal(500, 0)).toBe(500);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- invoice`
Expected: FAIL — `Cannot find module './invoice'`

- [ ] **Step 3: Implement**

Create `src/lib/calc/invoice.ts`:
```ts
import type { InvoiceLineItem } from "@/types/database";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calcSubtotal(lineItems: InvoiceLineItem[]): number {
  return round2(lineItems.reduce((sum, item) => sum + item.qty * item.rate, 0));
}

export function calcTotal(subtotal: number, taxAmount: number): number {
  return round2(subtotal + taxAmount);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- invoice`
Expected: PASS (5 tests)

- [ ] **Step 5: Write failing inventory guard tests**

Create `src/lib/calc/inventory.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { isLowStock, canDeductStock } from "./inventory";

describe("isLowStock", () => {
  it("is true when stock is at or below the reorder level", () => {
    expect(isLowStock({ quantity_on_hand: 2, reorder_level: 5 })).toBe(true);
    expect(isLowStock({ quantity_on_hand: 5, reorder_level: 5 })).toBe(true);
  });

  it("is false when stock is above the reorder level", () => {
    expect(isLowStock({ quantity_on_hand: 6, reorder_level: 5 })).toBe(false);
  });
});

describe("canDeductStock", () => {
  it("allows a deduction that leaves stock at zero or above", () => {
    expect(canDeductStock({ quantity_on_hand: 3 }, 3)).toBe(true);
    expect(canDeductStock({ quantity_on_hand: 3 }, 2)).toBe(true);
  });

  it("blocks a deduction that would go negative", () => {
    expect(canDeductStock({ quantity_on_hand: 2 }, 3)).toBe(false);
  });
});
```

- [ ] **Step 6: Run to verify it fails, then implement**

Run: `npm test -- inventory` → FAIL (module not found)

Create `src/lib/calc/inventory.ts`:
```ts
import type { InventoryItem } from "@/types/database";

export function isLowStock(
  item: Pick<InventoryItem, "quantity_on_hand" | "reorder_level">,
): boolean {
  return item.quantity_on_hand <= item.reorder_level;
}

export function canDeductStock(
  item: Pick<InventoryItem, "quantity_on_hand">,
  quantityUsed: number,
): boolean {
  return item.quantity_on_hand - quantityUsed >= 0;
}
```

Run: `npm test -- inventory`
Expected: PASS (4 tests)

- [ ] **Step 7: Write failing lead-conversion tests**

Create `src/lib/calc/convert-lead.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { canConvertLead, jobFromLead } from "./convert-lead";
import type { Lead } from "@/types/database";

const baseLead: Lead = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Ravi Kumar",
  phone: "9876543210",
  area: "adyar",
  service: "split-ac-service",
  source: "website",
  status: "new",
  notes: null,
  created_at: "2026-08-06T00:00:00.000Z",
};

describe("canConvertLead", () => {
  it("allows conversion for new/contacted/scheduled leads", () => {
    expect(canConvertLead({ status: "new" })).toBe(true);
    expect(canConvertLead({ status: "contacted" })).toBe(true);
    expect(canConvertLead({ status: "scheduled" })).toBe(true);
  });

  it("blocks conversion for already-converted or lost leads", () => {
    expect(canConvertLead({ status: "converted" })).toBe(false);
    expect(canConvertLead({ status: "lost" })).toBe(false);
  });
});

describe("jobFromLead", () => {
  it("maps a lead into an unassigned job draft", () => {
    expect(jobFromLead(baseLead)).toEqual({
      lead_id: "11111111-1111-1111-1111-111111111111",
      area: "adyar",
      address: null,
      status: "unassigned",
    });
  });
});
```

- [ ] **Step 8: Run to verify it fails, then implement**

Run: `npm test -- convert-lead` → FAIL (module not found)

Create `src/lib/calc/convert-lead.ts`:
```ts
import type { Lead, LeadStatus } from "@/types/database";

export function canConvertLead(lead: Pick<Lead, "status">): boolean {
  const blocked: LeadStatus[] = ["converted", "lost"];
  return !blocked.includes(lead.status);
}

export type NewJobFromLead = {
  lead_id: string;
  area: string;
  address: string | null;
  status: "unassigned";
};

export function jobFromLead(lead: Lead): NewJobFromLead {
  return {
    lead_id: lead.id,
    area: lead.area,
    address: null,
    status: "unassigned",
  };
}
```

Run: `npm test -- convert-lead`
Expected: PASS (3 tests)

- [ ] **Step 9: Run the full suite and commit**

Run: `npm test`
Expected: PASS (12 tests total)

```bash
git add src/lib/calc
git commit -m "feat: add invoice, inventory, and lead-conversion calc logic with tests"
```

---

## Task 5: Validation schemas (TDD)

**Files:**
- Create: `src/lib/validation/index.ts`
- Create: `src/lib/validation/index.test.ts`

- [ ] **Step 1: Write failing edge-case tests**

Create `src/lib/validation/index.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  phoneSchema,
  customerSchema,
  technicianSchema,
  invoiceSchema,
  inventoryUsageSchema,
} from "./index";

describe("phoneSchema", () => {
  it("accepts a valid 10-digit Indian mobile number", () => {
    expect(phoneSchema.safeParse("9876543210").success).toBe(true);
  });

  it("rejects numbers starting with 0-5", () => {
    expect(phoneSchema.safeParse("5876543210").success).toBe(false);
  });

  it("rejects numbers that aren't exactly 10 digits", () => {
    expect(phoneSchema.safeParse("98765432").success).toBe(false);
    expect(phoneSchema.safeParse("987654321099").success).toBe(false);
  });
});

describe("customerSchema", () => {
  it("requires a name of at least 2 characters", () => {
    expect(
      customerSchema.safeParse({ name: "A", phone: "9876543210", area: "adyar" }).success,
    ).toBe(false);
  });

  it("accepts a minimal valid customer", () => {
    expect(
      customerSchema.safeParse({ name: "Ravi Kumar", phone: "9876543210", area: "adyar" })
        .success,
    ).toBe(true);
  });
});

describe("technicianSchema", () => {
  it("requires at least one covered area", () => {
    const result = technicianSchema.safeParse({
      name: "Suresh",
      phone: "9876543210",
      areas_covered: [],
      skills: [],
      active: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("invoiceSchema", () => {
  it("requires at least one line item", () => {
    const result = invoiceSchema.safeParse({
      customer_id: "11111111-1111-1111-1111-111111111111",
      line_items: [],
      tax_amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative tax amount", () => {
    const result = invoiceSchema.safeParse({
      customer_id: "11111111-1111-1111-1111-111111111111",
      line_items: [{ description: "Gas top-up", qty: 1, rate: 799, amount: 799 }],
      tax_amount: -10,
    });
    expect(result.success).toBe(false);
  });
});

describe("inventoryUsageSchema", () => {
  it("rejects a zero quantity delta", () => {
    const result = inventoryUsageSchema.safeParse({
      item_id: "11111111-1111-1111-1111-111111111111",
      quantity_delta: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a negative delta (usage) and a positive delta (restock)", () => {
    expect(
      inventoryUsageSchema.safeParse({
        item_id: "11111111-1111-1111-1111-111111111111",
        quantity_delta: -2,
      }).success,
    ).toBe(true);
    expect(
      inventoryUsageSchema.safeParse({
        item_id: "11111111-1111-1111-1111-111111111111",
        quantity_delta: 10,
      }).success,
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- validation`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

Create `src/lib/validation/index.ts`:
```ts
import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const customerSchema = z.object({
  name: z.string().min(2).max(80),
  phone: phoneSchema,
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(200).optional(),
  area: z.string().min(1, "Select an area"),
  notes: z.string().max(1000).optional(),
});

export const acUnitSchema = z.object({
  customer_id: z.string().uuid(),
  type: z.enum(["split", "window", "cassette", "vrf", "vrv"]),
  brand: z.string().max(60).optional(),
  capacity_tons: z.number().positive().max(20).optional(),
  install_date: z.string().optional(),
  location_in_property: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export const technicianSchema = z.object({
  name: z.string().min(2).max(80),
  phone: phoneSchema,
  areas_covered: z.array(z.string()).min(1, "Select at least one area"),
  skills: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export const leadStatusSchema = z.enum(["new", "contacted", "scheduled", "converted", "lost"]);

export const serviceSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(2).max(120),
  category: z.string().min(1),
  base_price: z.number().nonnegative(),
  active: z.boolean().default(true),
});

export const jobStatusSchema = z.enum([
  "unassigned",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const jobSchema = z.object({
  lead_id: z.string().uuid().nullable().optional(),
  customer_id: z.string().uuid().nullable().optional(),
  ac_unit_id: z.string().uuid().nullable().optional(),
  technician_id: z.string().uuid().nullable().optional(),
  service_id: z.string().uuid(),
  scheduled_date: z.string().nullable().optional(),
  scheduled_time_slot: z.string().nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  area: z.string().min(1),
  status: jobStatusSchema,
  notes: z.string().max(1000).nullable().optional(),
});

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1).max(200),
  qty: z.number().positive(),
  rate: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});

export const invoiceSchema = z.object({
  job_id: z.string().uuid().nullable().optional(),
  customer_id: z.string().uuid(),
  line_items: z.array(invoiceLineItemSchema).min(1, "Add at least one line item"),
  tax_amount: z.number().nonnegative().default(0),
  payment_method: z.string().max(40).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export const inventoryItemSchema = z.object({
  name: z.string().min(2).max(80),
  category: z.string().max(60).optional(),
  unit: z.string().min(1).max(20).default("pcs"),
  reorder_level: z.number().nonnegative(),
  cost_price: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
});

export const inventoryUsageSchema = z.object({
  item_id: z.string().uuid(),
  job_id: z.string().uuid().nullable().optional(),
  quantity_delta: z.number().refine((n) => n !== 0, "Quantity cannot be zero"),
  notes: z.string().max(200).optional(),
});

export const settingsSchema = z.object({
  business_name: z.string().min(2).max(120),
  address: z.string().max(200).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  gstin: z.string().max(20).nullable().optional(),
});
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS (all 21 tests across the suite)

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation
git commit -m "feat: add zod validation schemas for admin panel forms"
```

---

## Task 6: Login page + auth actions

Login lives at `src/app/login` — a **sibling** of `src/app/admin`, not nested under it — so it never inherits the admin sidebar layout built in Task 7. No route restructuring needed later.

**Files:**
- Create: `src/app/login/actions.ts`
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Auth server actions**

Create `src/app/login/actions.ts`:
```ts
"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export async function login(formData: FormData): Promise<{ error: string } | void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password." };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

- [ ] **Step 2: Login page**

Create `src/app/login/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        action={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Airam Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage bookings and jobs.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-[15px] focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-[15px] focus:border-slate-500 focus:outline-none"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-lg bg-slate-900 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Manual verification**

Since there's no live Supabase project yet, verify the page renders and the form submits without a crash (it will show "Invalid email or password" because there's no backend to authenticate against — that's expected and confirms error handling works):

1. `preview_start` the `airam-ac-service` dev server (already configured in `.claude/launch.json`, port 3081).
2. Navigate to `http://localhost:3081/admin` — expect a redirect to `/login` once Task 2's middleware is active, or a thrown "Missing NEXT_PUBLIC_SUPABASE_URL" error if env vars aren't set yet (acceptable pre-credentials; re-verify once keys are supplied in Task 18).

- [ ] **Step 4: Commit**

```bash
git add src/app/login
git commit -m "feat(auth): add admin login page and actions"
```

---

## Task 7: Admin shell (layout + sidebar)

Because Task 6 already put login at `src/app/login` (a sibling of `src/app/admin`), the sidebar layout below only wraps `/admin/**` — login never sees it. No restructuring needed.

**Files:**
- Create: `src/components/admin/sidebar.tsx`
- Create: `src/app/admin/layout.tsx`

- [ ] **Step 1: Sidebar**

Create `src/components/admin/sidebar.tsx`:
```tsx
import Link from "next/link";
import { logout } from "@/app/login/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/technicians", label: "Technicians" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function Sidebar() {
  return (
    <aside className="flex h-full w-56 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4">
        <span className="text-sm font-semibold text-slate-900">Airam Admin</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <form action={logout} className="border-t border-slate-200 p-3">
        <button
          type="submit"
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100"
        >
          Sign out
        </button>
      </form>
    </aside>
  );
}
```

- [ ] **Step 2: Admin layout**

Create `src/app/admin/layout.tsx`:
```tsx
import { Sidebar } from "@/components/admin/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Manual verification**

`preview_start` the dev server, navigate to `http://localhost:3081/login` — confirm the login form renders without a sidebar. Navigate to `http://localhost:3081/admin` — confirm it redirects to `/login` (once env vars exist; otherwise confirms the guarded route at least resolves).

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/layout.tsx src/components/admin
git commit -m "feat(admin): add sidebar shell layout"
```

---

## Task 8: Dashboard

**Files:**
- Create: `src/app/admin/dashboard-queries.ts`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Query helpers**

Create `src/app/admin/dashboard-queries.ts`:
```ts
import { createServiceClient } from "@/lib/supabase/service";
import { isLowStock } from "@/lib/calc/inventory";

export async function getDashboardData() {
  const supabase = createServiceClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthIso = startOfMonth.toISOString();
  const today = new Date().toISOString().slice(0, 10);

  const [
    { data: paidInvoicesThisMonth },
    { data: jobsThisMonth },
    { count: leadsThisMonth },
    { count: convertedLeadsThisMonth },
    { data: todaysJobs },
    { data: newLeads },
    { data: inventoryItems },
  ] = await Promise.all([
    supabase.from("invoices").select("total").eq("status", "paid").gte("paid_at", startOfMonthIso),
    supabase.from("jobs").select("id").gte("created_at", startOfMonthIso),
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", startOfMonthIso),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "converted")
      .gte("created_at", startOfMonthIso),
    supabase
      .from("jobs")
      .select("id, area, scheduled_time_slot, status, technician_id")
      .eq("scheduled_date", today),
    supabase.from("leads").select("id, name, area, service, created_at").eq("status", "new").order("created_at", { ascending: false }).limit(5),
    supabase.from("inventory_items").select("id, name, quantity_on_hand, reorder_level"),
  ]);

  const revenueThisMonth = (paidInvoicesThisMonth ?? []).reduce((sum, inv) => sum + Number(inv.total), 0);
  const conversionRate =
    leadsThisMonth && leadsThisMonth > 0
      ? Math.round(((convertedLeadsThisMonth ?? 0) / leadsThisMonth) * 100)
      : 0;
  const lowStockItems = (inventoryItems ?? []).filter(isLowStock);

  return {
    revenueThisMonth,
    jobsThisMonth: jobsThisMonth?.length ?? 0,
    conversionRate,
    lowStockCount: lowStockItems.length,
    todaysJobs: todaysJobs ?? [],
    newLeads: newLeads ?? [],
    lowStockItems,
  };
}
```

- [ ] **Step 2: Dashboard page**

Create `src/app/admin/page.tsx`:
```tsx
import Link from "next/link";
import { getDashboardData } from "./dashboard-queries";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue this month" value={`₹${data.revenueThisMonth.toLocaleString("en-IN")}`} />
        <StatCard label="Jobs this month" value={data.jobsThisMonth} />
        <StatCard label="Lead conversion" value={`${data.conversionRate}%`} />
        <StatCard label="Low stock items" value={data.lowStockCount} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Today's schedule</h2>
          {data.todaysJobs.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No jobs scheduled for today.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.todaysJobs.map((job) => (
                <li key={job.id} className="text-sm text-slate-700">
                  {job.scheduled_time_slot ?? "Unscheduled slot"} — {job.area} ({job.status})
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/jobs" className="mt-3 inline-block text-sm text-slate-900 underline">
            View all jobs
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">New leads</h2>
          {data.newLeads.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No new leads.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.newLeads.map((lead) => (
                <li key={lead.id} className="text-sm text-slate-700">
                  {lead.name} — {lead.service} ({lead.area})
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/leads" className="mt-3 inline-block text-sm text-slate-900 underline">
            View all leads
          </Link>
        </div>
      </div>

      {data.lowStockItems.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="text-sm font-semibold text-amber-900">Low stock</h2>
          <ul className="mt-2 space-y-1">
            {data.lowStockItems.map((item) => (
              <li key={item.id} className="text-sm text-amber-800">
                {item.name}: {item.quantity_on_hand} left (reorder at {item.reorder_level})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/page.tsx src/app/admin/dashboard-queries.ts
git commit -m "feat(admin): add dashboard"
```

---

## Task 9: Leads module

**Files:**
- Create: `src/app/admin/leads/actions.ts`
- Create: `src/app/admin/leads/page.tsx`
- Create: `src/app/admin/leads/lead-row-actions.tsx`

- [ ] **Step 1: Server actions**

Create `src/app/admin/leads/actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { leadStatusSchema } from "@/lib/validation";
import { canConvertLead, jobFromLead } from "@/lib/calc/convert-lead";

export async function updateLeadStatus(leadId: string, status: string) {
  const parsed = leadStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { error: "Invalid status." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("leads").update({ status: parsed.data }).eq("id", leadId);
  if (error) {
    return { error: "Failed to update lead status." };
  }

  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function convertLeadToJob(leadId: string, serviceId: string) {
  const supabase = createServiceClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) {
    return { error: "Lead not found." };
  }

  if (!canConvertLead(lead)) {
    return { error: "This lead has already been converted or marked lost." };
  }

  const jobDraft = jobFromLead(lead);
  const { error: jobError } = await supabase.from("jobs").insert({
    ...jobDraft,
    service_id: serviceId,
  });

  if (jobError) {
    return { error: "Failed to create job." };
  }

  await supabase.from("leads").update({ status: "converted" }).eq("id", leadId);

  revalidatePath("/admin/leads");
  revalidatePath("/admin/jobs");
  return { ok: true };
}
```

- [ ] **Step 2: Row actions (client component for the status dropdown + convert button)**

Create `src/app/admin/leads/lead-row-actions.tsx`:
```tsx
"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus, convertLeadToJob } from "./actions";
import type { Lead, LeadStatus, ServiceCatalogItem } from "@/types/database";

const STATUSES: LeadStatus[] = ["new", "contacted", "scheduled", "converted", "lost"];

export function LeadRowActions({ lead, services }: { lead: Lead; services: ServiceCatalogItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const matchingService = services.find((s) => s.slug === lead.service) ?? services[0];

  function handleStatusChange(status: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateLeadStatus(lead.id, status);
      if (result?.error) setError(result.error);
    });
  }

  function handleConvert() {
    if (!matchingService) {
      setError("No matching service found in the catalog.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await convertLeadToJob(lead.id, matchingService.id);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={lead.status}
        disabled={isPending}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="h-9 rounded-lg border border-slate-300 px-2 text-sm"
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={isPending || lead.status === "converted" || lead.status === "lost"}
        onClick={handleConvert}
        className="h-9 rounded-lg border border-slate-300 px-3 text-sm hover:bg-slate-100 disabled:opacity-50"
      >
        Convert to job
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
```

- [ ] **Step 3: List page**

Create `src/app/admin/leads/page.tsx`:
```tsx
import { createServiceClient } from "@/lib/supabase/service";
import { LeadRowActions } from "./lead-row-actions";

export default async function LeadsPage() {
  const supabase = createServiceClient();
  const [{ data: leads }, { data: services }] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("services").select("*").eq("active", true),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Status / Actions</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((lead) => (
              <tr key={lead.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">{lead.name}</td>
                <td className="px-4 py-3">{lead.phone}</td>
                <td className="px-4 py-3">{lead.area}</td>
                <td className="px-4 py-3">{lead.service}</td>
                <td className="px-4 py-3">{lead.source}</td>
                <td className="px-4 py-3">{new Date(lead.created_at).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <LeadRowActions lead={lead} services={services ?? []} />
                </td>
              </tr>
            ))}
            {(leads ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/leads
git commit -m "feat(admin): add leads inbox with status updates and job conversion"
```

---

## Task 10: Customers module (+ AC units)

**Files:**
- Create: `src/app/admin/customers/actions.ts`
- Create: `src/app/admin/customers/page.tsx`
- Create: `src/app/admin/customers/[id]/page.tsx`
- Create: `src/app/admin/customers/[id]/ac-unit-form.tsx`

- [ ] **Step 1: Server actions**

Create `src/app/admin/customers/actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { customerSchema, acUnitSchema } from "@/lib/validation";

export async function createCustomer(formData: FormData) {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    area: formData.get("area"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid customer details." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("customers").insert(parsed.data);
  if (error) return { error: "Failed to create customer." };

  revalidatePath("/admin/customers");
  return { ok: true };
}

export async function archiveCustomer(customerId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("customers").update({ active: false }).eq("id", customerId);
  if (error) return { error: "Failed to archive customer." };

  revalidatePath("/admin/customers");
  return { ok: true };
}

export async function addAcUnit(customerId: string, formData: FormData) {
  const parsed = acUnitSchema.safeParse({
    customer_id: customerId,
    type: formData.get("type"),
    brand: formData.get("brand") || undefined,
    capacity_tons: formData.get("capacity_tons")
      ? Number(formData.get("capacity_tons"))
      : undefined,
    install_date: formData.get("install_date") || undefined,
    location_in_property: formData.get("location_in_property") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid AC unit details." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("ac_units").insert(parsed.data);
  if (error) return { error: "Failed to add AC unit." };

  revalidatePath(`/admin/customers/${customerId}`);
  return { ok: true };
}
```

- [ ] **Step 2: List page (with inline create form)**

Create `src/app/admin/customers/page.tsx`:
```tsx
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { LOCATIONS } from "@/lib/locations";
import { createCustomer } from "./actions";

export default async function CustomersPage() {
  const supabase = createServiceClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("active", true)
    .order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Customers</h1>

      <form action={createCustomer} className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-5">
        <input name="name" placeholder="Name" required className="h-10 rounded-lg border border-slate-300 px-3 text-sm" />
        <input name="phone" placeholder="Phone" required className="h-10 rounded-lg border border-slate-300 px-3 text-sm" />
        <input name="email" placeholder="Email (optional)" className="h-10 rounded-lg border border-slate-300 px-3 text-sm" />
        <select name="area" required className="h-10 rounded-lg border border-slate-300 px-3 text-sm">
          <option value="">Area</option>
          {LOCATIONS.map((loc) => (
            <option key={loc.slug} value={loc.slug}>
              {loc.name}
            </option>
          ))}
        </select>
        <input name="address" placeholder="Address (optional)" className="h-10 rounded-lg border border-slate-300 px-3 text-sm" />
        <button type="submit" className="col-span-2 h-10 rounded-lg bg-slate-900 text-sm font-medium text-white lg:col-span-1">
          Add customer
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).map((customer) => (
              <tr key={customer.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">{customer.name}</td>
                <td className="px-4 py-3">{customer.phone}</td>
                <td className="px-4 py-3">{customer.area}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/customers/${customer.id}`} className="text-slate-900 underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {(customers ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: AC unit inline form (client component)**

Create `src/app/admin/customers/[id]/ac-unit-form.tsx`:
```tsx
"use client";

import { useState, useTransition } from "react";
import { addAcUnit } from "../actions";

const AC_TYPES = ["split", "window", "cassette", "vrf", "vrv"] as const;

export function AcUnitForm({ customerId }: { customerId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addAcUnit(customerId, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-2 gap-2 lg:grid-cols-5">
      <select name="type" required className="h-9 rounded-lg border border-slate-300 px-2 text-sm">
        {AC_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <input name="brand" placeholder="Brand" className="h-9 rounded-lg border border-slate-300 px-2 text-sm" />
      <input
        name="capacity_tons"
        type="number"
        step="0.5"
        placeholder="Tonnage"
        className="h-9 rounded-lg border border-slate-300 px-2 text-sm"
      />
      <input name="location_in_property" placeholder="Location (e.g. bedroom)" className="h-9 rounded-lg border border-slate-300 px-2 text-sm" />
      <button type="submit" disabled={isPending} className="h-9 rounded-lg bg-slate-900 text-sm font-medium text-white disabled:opacity-60">
        Add unit
      </button>
      {error && <p className="col-span-full text-xs text-red-600">{error}</p>}
    </form>
  );
}
```

- [ ] **Step 4: Detail page**

Create `src/app/admin/customers/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { AcUnitForm } from "./ac-unit-form";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();

  const [{ data: customer }, { data: acUnits }, { data: jobs }, { data: invoices }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase.from("ac_units").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("jobs").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{customer.name}</h1>
        <p className="text-sm text-slate-500">
          {customer.phone} · {customer.area}
          {customer.address ? ` · ${customer.address}` : ""}
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">AC Units</h2>
        <ul className="space-y-1 text-sm text-slate-700">
          {(acUnits ?? []).map((unit) => (
            <li key={unit.id}>
              {unit.type} — {unit.brand ?? "unknown brand"}
              {unit.capacity_tons ? ` — ${unit.capacity_tons} ton` : ""}
              {unit.location_in_property ? ` — ${unit.location_in_property}` : ""}
            </li>
          ))}
          {(acUnits ?? []).length === 0 && <li className="text-slate-500">No AC units recorded yet.</li>}
        </ul>
        <AcUnitForm customerId={id} />
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Job history</h2>
        <ul className="space-y-1 text-sm text-slate-700">
          {(jobs ?? []).map((job) => (
            <li key={job.id}>
              {job.scheduled_date ?? "unscheduled"} — {job.status}
            </li>
          ))}
          {(jobs ?? []).length === 0 && <li className="text-slate-500">No jobs yet.</li>}
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Invoices</h2>
        <ul className="space-y-1 text-sm text-slate-700">
          {(invoices ?? []).map((inv) => (
            <li key={inv.id}>
              {inv.invoice_number} — ₹{inv.total} — {inv.status}
            </li>
          ))}
          {(invoices ?? []).length === 0 && <li className="text-slate-500">No invoices yet.</li>}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/customers
git commit -m "feat(admin): add customers CRM with AC units, job history, invoices"
```

---

## Task 11: Technicians module

**Files:**
- Create: `src/app/admin/technicians/actions.ts`
- Create: `src/app/admin/technicians/technician-form.tsx`
- Create: `src/app/admin/technicians/page.tsx`

- [ ] **Step 1: Server actions**

Create `src/app/admin/technicians/actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { technicianSchema } from "@/lib/validation";

export async function createTechnician(formData: FormData) {
  const areas = formData.getAll("areas_covered").map(String);
  const parsed = technicianSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    areas_covered: areas,
    skills: [],
    active: true,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid technician details." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("technicians").insert(parsed.data);
  if (error) return { error: "Failed to add technician." };

  revalidatePath("/admin/technicians");
  return { ok: true };
}

export async function setTechnicianActive(technicianId: string, active: boolean) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("technicians").update({ active }).eq("id", technicianId);
  if (error) return { error: "Failed to update technician." };

  revalidatePath("/admin/technicians");
  return { ok: true };
}
```

- [ ] **Step 2: Create-technician form (client component, multi-select areas)**

Create `src/app/admin/technicians/technician-form.tsx`:
```tsx
"use client";

import { useState, useTransition } from "react";
import { LOCATIONS } from "@/lib/locations";
import { createTechnician } from "./actions";

export function TechnicianForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTechnician(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="grid grid-cols-2 gap-3">
        <input name="name" placeholder="Name" required className="h-10 rounded-lg border border-slate-300 px-3 text-sm" />
        <input name="phone" placeholder="Phone" required className="h-10 rounded-lg border border-slate-300 px-3 text-sm" />
      </div>
      <div>
        <p className="mb-1 text-sm font-medium text-slate-700">Areas covered</p>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((loc) => (
            <label key={loc.slug} className="flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs">
              <input type="checkbox" name="areas_covered" value={loc.slug} />
              {loc.name}
            </label>
          ))}
        </div>
      </div>
      <button type="submit" disabled={isPending} className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white disabled:opacity-60">
        Add technician
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
```

- [ ] **Step 3: List page**

Create `src/app/admin/technicians/page.tsx`:
```tsx
import { createServiceClient } from "@/lib/supabase/service";
import { TechnicianForm } from "./technician-form";

export default async function TechniciansPage() {
  const supabase = createServiceClient();
  const { data: technicians } = await supabase.from("technicians").select("*").order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Technicians</h1>
      <TechnicianForm />
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Areas</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(technicians ?? []).map((tech) => (
              <tr key={tech.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">{tech.name}</td>
                <td className="px-4 py-3">{tech.phone}</td>
                <td className="px-4 py-3">{tech.areas_covered.join(", ")}</td>
                <td className="px-4 py-3">{tech.active ? "Active" : "Inactive"}</td>
              </tr>
            ))}
            {(technicians ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No technicians yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/technicians
git commit -m "feat(admin): add technician management"
```

---

## Task 12: Service catalog & pricing module

**Files:**
- Create: `src/app/admin/services/actions.ts`
- Create: `src/app/admin/services/service-row.tsx`
- Create: `src/app/admin/services/page.tsx`

- [ ] **Step 1: Server action**

Create `src/app/admin/services/actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";

export async function updateServicePrice(serviceId: string, basePrice: number) {
  if (!Number.isFinite(basePrice) || basePrice < 0) {
    return { error: "Price must be a non-negative number." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("services").update({ base_price: basePrice }).eq("id", serviceId);
  if (error) return { error: "Failed to update price." };

  revalidatePath("/admin/services");
  return { ok: true };
}

export async function setServiceActive(serviceId: string, active: boolean) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("services").update({ active }).eq("id", serviceId);
  if (error) return { error: "Failed to update service." };

  revalidatePath("/admin/services");
  return { ok: true };
}
```

- [ ] **Step 2: Row (client component — editable price + active toggle)**

Create `src/app/admin/services/service-row.tsx`:
```tsx
"use client";

import { useState, useTransition } from "react";
import { updateServicePrice, setServiceActive } from "./actions";
import type { ServiceCatalogItem } from "@/types/database";

export function ServiceRow({ service }: { service: ServiceCatalogItem }) {
  const [price, setPrice] = useState(String(service.base_price));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function savePrice() {
    setError(null);
    startTransition(async () => {
      const result = await updateServicePrice(service.id, Number(price));
      if (result?.error) setError(result.error);
    });
  }

  function toggleActive() {
    startTransition(async () => {
      await setServiceActive(service.id, !service.active);
    });
  }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-3">{service.name}</td>
      <td className="px-4 py-3">{service.category}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={savePrice}
            disabled={isPending}
            className="h-9 w-24 rounded-lg border border-slate-300 px-2 text-sm"
          />
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={toggleActive}
          disabled={isPending}
          className="h-9 rounded-lg border border-slate-300 px-3 text-sm hover:bg-slate-100"
        >
          {service.active ? "Active" : "Inactive"}
        </button>
      </td>
    </tr>
  );
}
```

- [ ] **Step 3: List page**

Create `src/app/admin/services/page.tsx`:
```tsx
import { createServiceClient } from "@/lib/supabase/service";
import { ServiceRow } from "./service-row";

export default async function ServicesPage() {
  const supabase = createServiceClient();
  const { data: services } = await supabase.from("services").select("*").order("category");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Service catalog & pricing</h1>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Base price (₹)</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {(services ?? []).map((service) => (
              <ServiceRow key={service.id} service={service} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/services
git commit -m "feat(admin): add service catalog and pricing management"
```

---

## Task 13: Jobs module (kanban + calendar + detail drawer)

**Files:**
- Create: `src/app/admin/jobs/actions.ts`
- Create: `src/app/admin/jobs/job-board.tsx`
- Create: `src/app/admin/jobs/job-calendar.tsx`
- Create: `src/app/admin/jobs/job-detail-drawer.tsx`
- Create: `src/app/admin/jobs/page.tsx`

- [ ] **Step 1: Server actions**

Create `src/app/admin/jobs/actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { jobSchema } from "@/lib/validation";

export async function updateJob(jobId: string, formData: FormData) {
  const raw = {
    technician_id: (formData.get("technician_id") as string) || null,
    scheduled_date: (formData.get("scheduled_date") as string) || null,
    scheduled_time_slot: (formData.get("scheduled_time_slot") as string) || null,
    status: formData.get("status") as string,
    notes: (formData.get("notes") as string) || null,
  };

  const supabase = createServiceClient();
  const { data: existing } = await supabase.from("jobs").select("*").eq("id", jobId).single();
  if (!existing) return { error: "Job not found." };

  const parsed = jobSchema.safeParse({ ...existing, ...raw });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid job details." };
  }

  const updatePayload: Record<string, unknown> = { ...raw };
  if (raw.status === "completed" && existing.status !== "completed") {
    updatePayload.completed_at = new Date().toISOString();
  }

  const { error } = await supabase.from("jobs").update(updatePayload).eq("id", jobId);
  if (error) return { error: "Failed to update job." };

  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  return { ok: true };
}

export async function recordPartUsage(jobId: string, itemId: string, quantityUsed: number) {
  if (!Number.isFinite(quantityUsed) || quantityUsed <= 0) {
    return { error: "Quantity must be a positive number." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("inventory_usage").insert({
    item_id: itemId,
    job_id: jobId,
    quantity_delta: -quantityUsed,
  });

  if (error) {
    // The DB trigger raises an exception when stock would go negative —
    // surface that as a friendly message instead of the raw Postgres error.
    return { error: "Not enough stock for that quantity." };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/admin/inventory");
  return { ok: true };
}
```

- [ ] **Step 2: Kanban board (client component)**

Create `src/app/admin/jobs/job-board.tsx`:
```tsx
"use client";

import { useState } from "react";
import type { Job } from "@/types/database";
import { JobDetailDrawer } from "./job-detail-drawer";

const COLUMNS: { status: Job["status"]; label: string }[] = [
  { status: "unassigned", label: "Unassigned" },
  { status: "assigned", label: "Assigned" },
  { status: "in_progress", label: "In progress" },
  { status: "completed", label: "Completed" },
  { status: "cancelled", label: "Cancelled" },
];

export function JobBoard({
  jobs,
  technicianNames,
}: {
  jobs: Job[];
  technicianNames: Record<string, string>;
}) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {COLUMNS.map((col) => (
          <div key={col.status} className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
            <div className="space-y-2">
              {jobs
                .filter((job) => job.status === col.status)
                .map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm shadow-sm hover:border-slate-400"
                  >
                    <p className="font-medium text-slate-900">{job.area}</p>
                    <p className="text-xs text-slate-500">
                      {job.technician_id ? technicianNames[job.technician_id] ?? "Technician" : "No technician"}
                    </p>
                    <p className="text-xs text-slate-500">{job.scheduled_date ?? "Unscheduled"}</p>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {selectedJob && <JobDetailDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </>
  );
}
```

- [ ] **Step 3: Calendar view (client component)**

Create `src/app/admin/jobs/job-calendar.tsx`:
```tsx
"use client";

import { useMemo, useState } from "react";
import type { Job } from "@/types/database";
import { JobDetailDrawer } from "./job-detail-drawer";

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function JobCalendar({ jobs }: { jobs: Job[] }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  function jobsForDay(day: Date) {
    const iso = day.toISOString().slice(0, 10);
    return jobs.filter((job) => job.scheduled_date === iso);
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setWeekStart((d) => new Date(d.getTime() - 7 * 86400000))}
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm"
        >
          ← Previous week
        </button>
        <button
          type="button"
          onClick={() => setWeekStart((d) => new Date(d.getTime() + 7 * 86400000))}
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm"
        >
          Next week →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day.toISOString()} className="min-h-[140px] rounded-xl border border-slate-200 bg-white p-2">
            <p className="text-xs font-medium text-slate-500">
              {day.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}
            </p>
            <div className="mt-1 space-y-1">
              {jobsForDay(day).map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setSelectedJob(job)}
                  className="block w-full rounded-lg bg-slate-100 px-2 py-1 text-left text-xs hover:bg-slate-200"
                >
                  {job.scheduled_time_slot ?? "—"} · {job.area}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedJob && <JobDetailDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </>
  );
}
```

- [ ] **Step 4: Detail drawer (client component — assign technician, reschedule, log parts, complete)**

Create `src/app/admin/jobs/job-detail-drawer.tsx`:
```tsx
"use client";

import { useState, useTransition } from "react";
import { updateJob, recordPartUsage } from "./actions";
import type { Job, JobStatus } from "@/types/database";

const STATUSES: JobStatus[] = ["unassigned", "assigned", "in_progress", "completed", "cancelled"];

export function JobDetailDrawer({ job, onClose }: { job: Job; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [partQty, setPartQty] = useState("1");
  const [partItemId, setPartItemId] = useState("");

  function handleUpdate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateJob(job.id, formData);
      if (result?.error) setError(result.error);
      else onClose();
    });
  }

  function handleLogPart() {
    if (!partItemId) {
      setError("Select a part first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await recordPartUsage(job.id, partItemId, Number(partQty));
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md space-y-4 overflow-y-auto bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Job — {job.area}</h2>
          <button type="button" onClick={onClose} className="text-slate-500">
            Close
          </button>
        </div>

        <form action={handleUpdate} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-700">Status</label>
            <select name="status" defaultValue={job.status} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm">
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700">Technician ID</label>
            <input
              name="technician_id"
              defaultValue={job.technician_id ?? ""}
              placeholder="Paste technician ID from the Technicians page"
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-slate-700">Date</label>
              <input
                type="date"
                name="scheduled_date"
                defaultValue={job.scheduled_date ?? ""}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Time slot</label>
              <input
                name="scheduled_time_slot"
                defaultValue={job.scheduled_time_slot ?? ""}
                placeholder="e.g. 10am-12pm"
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-700">Notes</label>
            <textarea
              name="notes"
              defaultValue={job.notes ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <button type="submit" disabled={isPending} className="h-10 w-full rounded-lg bg-slate-900 text-sm font-medium text-white disabled:opacity-60">
            Save
          </button>
        </form>

        <div className="space-y-2 border-t border-slate-200 pt-4">
          <h3 className="text-sm font-semibold text-slate-900">Log a part used</h3>
          <p className="text-xs text-slate-500">Paste an inventory item ID from the Inventory page.</p>
          <div className="flex gap-2">
            <input
              value={partItemId}
              onChange={(e) => setPartItemId(e.target.value)}
              placeholder="Item ID"
              className="h-9 flex-1 rounded-lg border border-slate-300 px-2 text-sm"
            />
            <input
              value={partQty}
              onChange={(e) => setPartQty(e.target.value)}
              type="number"
              min="1"
              className="h-9 w-20 rounded-lg border border-slate-300 px-2 text-sm"
            />
            <button type="button" onClick={handleLogPart} disabled={isPending} className="h-9 rounded-lg border border-slate-300 px-3 text-sm">
              Log
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: List page (toggle between board/calendar)**

Create `src/app/admin/jobs/page.tsx`:
```tsx
import { createServiceClient } from "@/lib/supabase/service";
import { JobsView } from "./jobs-view";

export default async function JobsPage() {
  const supabase = createServiceClient();
  const [{ data: jobs }, { data: technicians }] = await Promise.all([
    supabase.from("jobs").select("*").order("scheduled_date", { ascending: true }),
    supabase.from("technicians").select("id, name"),
  ]);

  const technicianNames = Object.fromEntries((technicians ?? []).map((t) => [t.id, t.name]));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Jobs</h1>
      <JobsView jobs={jobs ?? []} technicianNames={technicianNames} />
    </div>
  );
}
```

Create `src/app/admin/jobs/jobs-view.tsx` (client toggle wrapper — kept separate from `page.tsx` since a Server Component can't hold `useState`):
```tsx
"use client";

import { useState } from "react";
import type { Job } from "@/types/database";
import { JobBoard } from "./job-board";
import { JobCalendar } from "./job-calendar";

export function JobsView({
  jobs,
  technicianNames,
}: {
  jobs: Job[];
  technicianNames: Record<string, string>;
}) {
  const [view, setView] = useState<"board" | "calendar">("board");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setView("board")}
          className={`rounded-lg px-3 py-1.5 text-sm ${view === "board" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
        >
          Board
        </button>
        <button
          type="button"
          onClick={() => setView("calendar")}
          className={`rounded-lg px-3 py-1.5 text-sm ${view === "calendar" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
        >
          Calendar
        </button>
      </div>
      {view === "board" ? (
        <JobBoard jobs={jobs} technicianNames={technicianNames} />
      ) : (
        <JobCalendar jobs={jobs} />
      )}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/jobs
git commit -m "feat(admin): add job scheduling with kanban board and calendar views"
```

---

## Task 14: Invoices module

**Files:**
- Create: `src/app/admin/invoices/actions.ts`
- Create: `src/app/admin/invoices/invoice-form.tsx`
- Create: `src/app/admin/invoices/page.tsx`

- [ ] **Step 1: Server actions**

Create `src/app/admin/invoices/actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { invoiceSchema } from "@/lib/validation";
import { calcSubtotal, calcTotal } from "@/lib/calc/invoice";
import type { InvoiceLineItem } from "@/types/database";

async function nextInvoiceNumber(supabase: ReturnType<typeof createServiceClient>): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01`);
  return `AIRAM-${year}-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export async function createInvoice(formData: FormData) {
  const lineItems: InvoiceLineItem[] = JSON.parse(String(formData.get("line_items") ?? "[]"));
  const taxAmount = Number(formData.get("tax_amount") ?? 0);

  const parsed = invoiceSchema.safeParse({
    job_id: (formData.get("job_id") as string) || undefined,
    customer_id: formData.get("customer_id"),
    line_items: lineItems,
    tax_amount: taxAmount,
    payment_method: (formData.get("payment_method") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid invoice details." };
  }

  const subtotal = calcSubtotal(parsed.data.line_items);
  const total = calcTotal(subtotal, parsed.data.tax_amount);

  const supabase = createServiceClient();
  const invoiceNumber = await nextInvoiceNumber(supabase);

  const { error } = await supabase.from("invoices").insert({
    ...parsed.data,
    invoice_number: invoiceNumber,
    subtotal,
    total,
    status: "unpaid",
    paid_amount: 0,
  });

  if (error) return { error: "Failed to create invoice." };

  revalidatePath("/admin/invoices");
  return { ok: true };
}

export async function markInvoicePayment(invoiceId: string, paidAmount: number, method: string) {
  const supabase = createServiceClient();
  const { data: invoice } = await supabase.from("invoices").select("total").eq("id", invoiceId).single();
  if (!invoice) return { error: "Invoice not found." };

  const status = paidAmount >= invoice.total ? "paid" : paidAmount > 0 ? "partial" : "unpaid";

  const { error } = await supabase
    .from("invoices")
    .update({
      paid_amount: paidAmount,
      payment_method: method,
      status,
      paid_at: status === "unpaid" ? null : new Date().toISOString(),
    })
    .eq("id", invoiceId);

  if (error) return { error: "Failed to record payment." };

  revalidatePath("/admin/invoices");
  revalidatePath("/admin");
  return { ok: true };
}
```

- [ ] **Step 2: Invoice creation form (client component with dynamic line items)**

Create `src/app/admin/invoices/invoice-form.tsx`:
```tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { createInvoice } from "./actions";
import { calcSubtotal, calcTotal } from "@/lib/calc/invoice";
import type { Customer, InvoiceLineItem } from "@/types/database";

export function InvoiceForm({ customers }: { customers: Customer[] }) {
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: "", qty: 1, rate: 0, amount: 0 },
  ]);
  const [taxAmount, setTaxAmount] = useState("0");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => calcSubtotal(lineItems), [lineItems]);
  const total = useMemo(() => calcTotal(subtotal, Number(taxAmount) || 0), [subtotal, taxAmount]);

  function updateLine(index: number, field: keyof InvoiceLineItem, value: string) {
    setLineItems((items) =>
      items.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "description" ? value : Number(value),
              amount:
                field === "qty" || field === "rate"
                  ? (field === "qty" ? Number(value) : item.qty) * (field === "rate" ? Number(value) : item.rate)
                  : item.amount,
            }
          : item,
      ),
    );
  }

  function addLine() {
    setLineItems((items) => [...items, { description: "", qty: 1, rate: 0, amount: 0 }]);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("line_items", JSON.stringify(lineItems));
    startTransition(async () => {
      const result = await createInvoice(formData);
      if (result?.error) setError(result.error);
      else setLineItems([{ description: "", qty: 1, rate: 0, amount: 0 }]);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <select name="customer_id" required className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm">
        <option value="">Select customer</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} — {c.phone}
          </option>
        ))}
      </select>

      <div className="space-y-2">
        {lineItems.map((item, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            <input
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateLine(i, "description", e.target.value)}
              className="col-span-2 h-9 rounded-lg border border-slate-300 px-2 text-sm"
            />
            <input
              type="number"
              placeholder="Qty"
              value={item.qty}
              onChange={(e) => updateLine(i, "qty", e.target.value)}
              className="h-9 rounded-lg border border-slate-300 px-2 text-sm"
            />
            <input
              type="number"
              placeholder="Rate"
              value={item.rate}
              onChange={(e) => updateLine(i, "rate", e.target.value)}
              className="h-9 rounded-lg border border-slate-300 px-2 text-sm"
            />
          </div>
        ))}
        <button type="button" onClick={addLine} className="text-sm text-slate-900 underline">
          + Add line item
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm text-slate-700">
          Tax amount (₹)
          <input
            name="tax_amount"
            value={taxAmount}
            onChange={(e) => setTaxAmount(e.target.value)}
            type="number"
            className="ml-2 h-9 w-24 rounded-lg border border-slate-300 px-2 text-sm"
          />
        </label>
        <input name="payment_method" placeholder="Payment method (optional)" className="h-9 rounded-lg border border-slate-300 px-2 text-sm" />
      </div>

      <div className="text-sm text-slate-700">
        Subtotal: ₹{subtotal.toLocaleString("en-IN")} · Total: ₹{total.toLocaleString("en-IN")}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={isPending} className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white disabled:opacity-60">
        Create invoice
      </button>
    </form>
  );
}
```

- [ ] **Step 3: List page**

Create `src/app/admin/invoices/page.tsx`:
```tsx
import { createServiceClient } from "@/lib/supabase/service";
import { InvoiceForm } from "./invoice-form";

export default async function InvoicesPage() {
  const supabase = createServiceClient();
  const [{ data: invoices }, { data: customers }] = await Promise.all([
    supabase.from("invoices").select("*, customers(name)").order("created_at", { ascending: false }),
    supabase.from("customers").select("*").eq("active", true).order("name"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Invoices</h1>
      <InvoiceForm customers={customers ?? []} />
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(invoices ?? []).map((inv) => (
              <tr key={inv.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">{inv.invoice_number}</td>
                <td className="px-4 py-3">{(inv as { customers?: { name: string } }).customers?.name ?? "—"}</td>
                <td className="px-4 py-3">₹{Number(inv.total).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">{inv.status}</td>
              </tr>
            ))}
            {(invoices ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/invoices
git commit -m "feat(admin): add invoicing with manual payment tracking"
```

---

## Task 15: Inventory module

**Files:**
- Create: `src/app/admin/inventory/actions.ts`
- Create: `src/app/admin/inventory/restock-form.tsx`
- Create: `src/app/admin/inventory/page.tsx`

- [ ] **Step 1: Server actions**

Create `src/app/admin/inventory/actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { inventoryItemSchema, inventoryUsageSchema } from "@/lib/validation";

export async function createInventoryItem(formData: FormData) {
  const parsed = inventoryItemSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category") || undefined,
    unit: formData.get("unit") || "pcs",
    reorder_level: Number(formData.get("reorder_level") ?? 0),
    cost_price: formData.get("cost_price") ? Number(formData.get("cost_price")) : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid item details." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("inventory_items").insert(parsed.data);
  if (error) return { error: "Failed to add item." };

  revalidatePath("/admin/inventory");
  return { ok: true };
}

export async function restockItem(itemId: string, quantity: number) {
  const parsed = inventoryUsageSchema.safeParse({ item_id: itemId, quantity_delta: quantity });
  if (!parsed.success || quantity <= 0) {
    return { error: "Enter a positive restock quantity." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("inventory_usage").insert({
    item_id: itemId,
    quantity_delta: quantity,
    job_id: null,
  });

  if (error) return { error: "Failed to restock item." };

  revalidatePath("/admin/inventory");
  return { ok: true };
}
```

- [ ] **Step 2: Restock form (client component)**

Create `src/app/admin/inventory/restock-form.tsx`:
```tsx
"use client";

import { useState, useTransition } from "react";
import { restockItem } from "./actions";

export function RestockForm({ itemId }: { itemId: string }) {
  const [qty, setQty] = useState("1");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRestock() {
    setError(null);
    startTransition(async () => {
      const result = await restockItem(itemId, Number(qty));
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        className="h-9 w-16 rounded-lg border border-slate-300 px-2 text-sm"
      />
      <button type="button" onClick={handleRestock} disabled={isPending} className="h-9 rounded-lg border border-slate-300 px-3 text-sm hover:bg-slate-100">
        Restock
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
```

- [ ] **Step 3: List page**

Create `src/app/admin/inventory/page.tsx`:
```tsx
import { createServiceClient } from "@/lib/supabase/service";
import { isLowStock } from "@/lib/calc/inventory";
import { RestockForm } from "./restock-form";

export default async function InventoryPage() {
  const supabase = createServiceClient();
  const { data: items } = await supabase.from("inventory_items").select("*").order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Inventory</h1>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">On hand</th>
              <th className="px-4 py-3">Reorder level</th>
              <th className="px-4 py-3">Restock</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((item) => (
              <tr key={item.id} className={`border-b border-slate-100 last:border-0 ${isLowStock(item) ? "bg-amber-50" : ""}`}>
                <td className="px-4 py-3">
                  {item.name}
                  <span className="ml-2 select-all text-xs text-slate-400">{item.id}</span>
                </td>
                <td className="px-4 py-3">
                  {item.quantity_on_hand} {item.unit}
                </td>
                <td className="px-4 py-3">{item.reorder_level}</td>
                <td className="px-4 py-3">
                  <RestockForm itemId={item.id} />
                </td>
              </tr>
            ))}
            {(items ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No inventory items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

Note: the item ID is shown selectable in the table specifically so it can be copy-pasted into the "Log a part used" field on the Job detail drawer (Task 13) — this app has no cross-linking autocomplete yet; that's a reasonable manual-copy workflow for a single-admin tool and can be upgraded to a dropdown later without changing the schema.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/inventory
git commit -m "feat(admin): add inventory tracking with restock and low-stock highlighting"
```

---

## Task 16: Settings page

**Files:**
- Create: `src/app/admin/settings/actions.ts`
- Create: `src/app/admin/settings/page.tsx`

- [ ] **Step 1: Server action**

Create `src/app/admin/settings/actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { settingsSchema } from "@/lib/validation";

export async function updateSettings(formData: FormData) {
  const parsed = settingsSchema.safeParse({
    business_name: formData.get("business_name"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    gstin: formData.get("gstin") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid settings." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("settings").update(parsed.data).eq("id", true);
  if (error) return { error: "Failed to save settings." };

  revalidatePath("/admin/settings");
  return { ok: true };
}
```

- [ ] **Step 2: Page**

Create `src/app/admin/settings/page.tsx`:
```tsx
import { createServiceClient } from "@/lib/supabase/service";
import { updateSettings } from "./actions";

export default async function SettingsPage() {
  const supabase = createServiceClient();
  const { data: settings } = await supabase.from("settings").select("*").eq("id", true).single();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
      <form action={updateSettings} className="max-w-lg space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <label className="block text-sm text-slate-700">Business name</label>
          <input
            name="business_name"
            defaultValue={settings?.business_name ?? "Airam AC Service"}
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-700">Address</label>
          <input name="address" defaultValue={settings?.address ?? ""} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-slate-700">Phone</label>
          <input name="phone" defaultValue={settings?.phone ?? ""} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-slate-700">GSTIN (optional)</label>
          <input name="gstin" defaultValue={settings?.gstin ?? ""} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
        <button type="submit" className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white">
          Save
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/settings
git commit -m "feat(admin): add settings page"
```

---

## Task 17: Connect the public booking form to Supabase

**Files:**
- Modify: `src/app/api/book/route.ts`

- [ ] **Step 1: Replace the file-based write with a Supabase insert**

Modify `src/app/api/book/route.ts` — replace the whole file:
```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

const bookingSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  area: z.string().min(1).max(80),
  service: z.string().min(1).max(80),
  website: z.string().max(0).optional(), // honeypot — bots fill this
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid booking details" },
      { status: 422 },
    );
  }

  // Honeypot tripped: pretend success, drop silently.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { name, phone, area, service } = parsed.data;

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("leads").insert({
      name,
      phone,
      area,
      service,
      source: "website",
      status: "new",
    });
    if (error) throw error;
  } catch (err) {
    console.error("[booking] failed to persist lead", err);
    return NextResponse.json({ ok: false, error: "Failed to save booking" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Manual verification**

With Supabase credentials in `.env.local` (Task 18 must run first for this to actually succeed against the live DB — otherwise `createServiceClient()` throws, which is the expected/correct behavior pre-credentials):

1. `preview_start` the dev server.
2. Navigate to `http://localhost:3081/book`, submit the booking form.
3. Confirm a `200 { ok: true }` response via `read_network_requests`.
4. Once Task 18's migration is live, confirm a row appears in the `leads` table (via Supabase dashboard or the admin `/admin/leads` page).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/book/route.ts
git commit -m "feat: write booking submissions to supabase leads table instead of local file"
```

---

## Task 18: Apply the migration to the live Supabase project & wire credentials

**Files:** none (infra step) — this task requires the user's Supabase project credentials, per the Prerequisites section above.

- [ ] **Step 1: Get credentials from the user**

Confirm with the user that `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are available (from Project Settings → API in their Airam Supabase project).

- [ ] **Step 2: Write `.env.local`**

Create `.env.local` (gitignored — never commit) with the three values filled in from Step 1.

- [ ] **Step 3: Apply the migration**

If the Supabase MCP tools are connected to the Airam project: use the `apply_migration` tool with the contents of `supabase/migrations/0001_init.sql`.

If not connected via MCP: give the user the exact contents of `supabase/migrations/0001_init.sql` to paste into the Supabase Dashboard's SQL Editor and run.

- [ ] **Step 4: Create the admin user**

Instruct the user to create their one login (email + password) via Supabase Dashboard → Authentication → Users → Add user, with "Auto Confirm User" checked. This step must be done by the user — creating auth users on their behalf is account/credential creation, which is out of scope for the agent to perform even via API.

- [ ] **Step 5: Verify auth end-to-end**

1. `preview_start` the dev server (restart it if it was already running, so the new `.env.local` is picked up).
2. Navigate to `/login`, sign in with the admin credentials created in Step 4.
3. Confirm redirect to `/admin` and the dashboard renders (all zeros/empty states, since the DB is fresh).
4. Navigate to `/admin/leads`, `/admin/jobs`, `/admin/customers`, `/admin/technicians`, `/admin/services` (should show the 16 seeded services), `/admin/invoices`, `/admin/inventory`, `/admin/settings` — confirm each renders without error.
5. Submit the public booking form at `/book` and confirm the lead appears in `/admin/leads`.

- [ ] **Step 6: No commit** — this task only involves infra/config outside git (`.env.local` is gitignored by design).

---

## Task 19: Full manual verification pass

**Files:** none — verification only.

- [ ] **Step 1: Exercise every write path once, end-to-end, against the live dev preview**

1. **Leads**: change a lead's status; convert a lead to a job; confirm it appears under `/admin/jobs` as "unassigned".
2. **Customers**: create a customer; add an AC unit to them; confirm both show on their detail page.
3. **Technicians**: create a technician with 2+ areas covered; confirm they appear in the list.
4. **Services**: edit a price inline; toggle a service inactive; confirm both persist after reload.
5. **Jobs**: open a job from the board, assign the technician created above, set a date/status, save; switch to calendar view and confirm it shows on the right day; mark it "completed".
6. **Inventory**: create an item with a reorder level; restock it; then (via a job's "Log a part used") consume more than is on hand and confirm the friendly "Not enough stock" error appears, not a raw 500.
7. **Invoices**: create an invoice for the customer above with 2 line items + a tax amount; confirm subtotal/total match `calcSubtotal`/`calcTotal`; mark it partially paid, then fully paid, and confirm status transitions.
8. **Settings**: update the business name/phone, reload, confirm it persisted.
9. **Dashboard**: reload `/admin` and confirm the KPI cards now reflect the data created above (jobs this month ≥ 1, revenue this month reflects the paid invoice, low-stock section shows the inventory item if its reorder level was set above its stock).
10. **Public site regression**: reload `/`, `/services`, `/services/split-ac-service`, `/locations/adyar`, `/blog` — confirm the existing marketing site is unaffected.

- [ ] **Step 2: Run the automated suite one more time**

Run: `npm test`
Expected: PASS (all unit tests)

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 3: Final commit (if any fixes were needed during verification)**

```bash
git add -A
git commit -m "fix: address issues found in end-to-end admin panel verification"
```

If no fixes were needed, skip this commit — nothing to record.
