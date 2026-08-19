/**
 * Temporary lead-capture webhook for the Airam AC Service booking form.
 *
 * Stopgap until the Supabase-backed admin panel (Task 17 of
 * docs/superpowers/plans/2026-08-06-admin-panel.md) is live — that will
 * replace this Sheet entirely with the real `leads` table.
 *
 * SETUP:
 * 1. Go to sheets.new to create a fresh Google Sheet. Rename it something
 *    like "Airam Leads (temporary)".
 * 2. Extensions -> Apps Script. Delete the placeholder code and paste this
 *    whole file in.
 * 3. Change NOTIFY_EMAIL below to the email that should get a ping per lead.
 * 4. Deploy -> New deployment -> type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    (This has to be "Anyone" so Vercel's server can POST to it without a
 *    Google login — the URL itself is the only secret; don't share it
 *    publicly. Only this script can write to your Sheet, and it only ever
 *    appends a row — it can't read or expose anything else in the Sheet.)
 * 5. Copy the resulting Web app URL and give it back to Claude — it goes
 *    into a LEADS_WEBHOOK_URL environment variable on Vercel, nowhere else.
 * 6. Every form submission appends a row here AND emails NOTIFY_EMAIL.
 */

const NOTIFY_EMAIL = "centumania@gmail.com"; // CHANGE THIS to your working email

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // First run: add a header row if the sheet is empty.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Received At", "Name", "Phone", "Area", "Service"]);
  }

  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: "Invalid JSON" }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const receivedAt = new Date().toISOString();
  sheet.appendRow([
    receivedAt,
    data.name || "",
    data.phone || "",
    data.area || "",
    data.service || "",
  ]);

  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `New Airam booking: ${data.name || "Unknown"} (${data.area || "?"})`,
      body:
        `New booking request received:\n\n` +
        `Name: ${data.name || "-"}\n` +
        `Phone: ${data.phone || "-"}\n` +
        `Area: ${data.area || "-"}\n` +
        `Service: ${data.service || "-"}\n` +
        `Received: ${receivedAt}\n`,
    });
  } catch (err) {
    // Email failure shouldn't fail the whole request — the row is already
    // saved in the Sheet either way.
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON,
  );
}
