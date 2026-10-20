import { query } from "./db";
type LeadEmail = { id: string; name: string; service: string };
export async function notifyLead(lead: LeadEmail) {
  if (
    !process.env.RESEND_API_KEY ||
    !process.env.LEAD_NOTIFICATION_EMAIL ||
    !process.env.EMAIL_FROM
  )
    return "not_configured";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `inquiry-${lead.id}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [process.env.LEAD_NOTIFICATION_EMAIL],
        subject: "New property-care inquiry",
        text: `A new ${lead.service} inquiry has been received from ${lead.name}.\n\nSign in to the private dashboard to view and respond: ${process.env.NEXT_PUBLIC_SITE_URL}/admin\n\nReference: ${lead.id}`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    const state = response.ok ? "sent" : "failed";
    await query("UPDATE inquiries SET notification_status=$1 WHERE id=$2", [
      state,
      lead.id,
    ]);
    return state;
  } catch {
    await query("UPDATE inquiries SET notification_status=$1 WHERE id=$2", [
      "failed",
      lead.id,
    ]);
    return "failed";
  }
}
