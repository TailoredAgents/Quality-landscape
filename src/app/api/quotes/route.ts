import { randomUUID } from "node:crypto";
import { previewMode } from "@/lib/config";
import { quoteSchema } from "@/lib/validation";
import { query } from "@/lib/db";
import {
  assertOrigin,
  readJson,
  apiError,
  rateLimit,
  clientKey,
  noStore,
} from "@/lib/security";
import { notifyLead } from "@/lib/mail";
const previewLimits = new Map<string, { count: number; reset: number }>();
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const raw = await readJson(request);
    const result = quoteSchema.safeParse(raw);
    if (!result.success)
      return Response.json(
        {
          error: "Please check the highlighted fields.",
          fields: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    const data = result.data;
    if (previewMode) {
      const key = "preview";
      const entry = previewLimits.get(key);
      if (entry && entry.reset > Date.now() && entry.count > 40)
        return Response.json(
          { error: "Please wait a few minutes before trying again." },
          { status: 429 },
        );
      previewLimits.set(key, {
        count: entry && entry.reset > Date.now() ? entry.count + 1 : 1,
        reset:
          entry && entry.reset > Date.now() ? entry.reset : Date.now() + 600000,
      });
      return noStore({
        success: true,
        preview: true,
        stored: false,
        emailSent: false,
      });
    }
    await rateLimit(`quote:${clientKey(request)}`, 5, 900);
    const id = randomUUID();
    const notification =
      process.env.RESEND_API_KEY &&
      process.env.EMAIL_FROM &&
      process.env.LEAD_NOTIFICATION_EMAIL
        ? "pending"
        : "not_configured";
    await query(
      "INSERT INTO inquiries(id,name,phone,email,service,location,message,notification_status) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
      [
        id,
        data.name,
        data.phone,
        data.email,
        data.service,
        data.location,
        data.message,
        notification,
      ],
    );
    // Record the confirmed conversion without customer contact information or a join to the lead.
    try {
      await query(
        "INSERT INTO analytics_events(kind,path,device) VALUES('conversion','/contact','unknown')",
      );
    } catch {
      console.error("Conversion recording unavailable");
    }
    // The inquiry is already durable. An optional notification failure must not
    // turn a saved inquiry into an apparent failed submission.
    let emailState = "failed";
    try {
      emailState = await notifyLead({
        id,
        name: data.name,
        service: data.service,
      });
    } catch {
      console.error("Lead notification unavailable");
    }
    return noStore({
      success: true,
      preview: false,
      stored: true,
      emailSent: emailState === "sent",
    });
  } catch (error) {
    return apiError(error);
  }
}
