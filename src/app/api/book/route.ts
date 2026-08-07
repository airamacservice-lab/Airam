import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";

const LEADS_FILE = path.join(process.cwd(), "data", "leads.jsonl");

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
  const lead = { receivedAt: new Date().toISOString(), name, phone, area, service };

  // Local, file-based lead log — works for `npm run dev` / self-hosted `npm start`.
  // On serverless hosts (e.g. Vercel) the filesystem is ephemeral, so this file
  // won't persist between requests there; swap in a CRM webhook, Google Sheet
  // append, or a database write before deploying to serverless.
  try {
    fs.mkdirSync(path.dirname(LEADS_FILE), { recursive: true });
    fs.appendFileSync(LEADS_FILE, JSON.stringify(lead) + "\n");
  } catch (err) {
    console.error("[booking] failed to persist lead", err);
  }

  console.log(`[booking] ${lead.receivedAt} name=${name} phone=${phone} area=${area} service=${service}`);

  return NextResponse.json({ ok: true });
}
