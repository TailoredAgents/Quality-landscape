import { previewMode, siteUrl } from "@/lib/config";
import {
  analyticsSchema,
  referralSource,
  safeCampaign,
} from "@/lib/validation";
import {
  assertOrigin,
  readJson,
  rateLimit,
  clientKey,
  digest,
} from "@/lib/security";
import { query } from "@/lib/db";
export async function POST(request: Request) {
  if (
    previewMode ||
    request.headers.get("dnt") === "1" ||
    request.headers.get("sec-gpc") === "1"
  )
    return new Response(null, { status: 204 });
  try {
    assertOrigin(request);
    const data = analyticsSchema.safeParse(await readJson(request, 6000));
    if (!data.success) return new Response(null, { status: 400 });
    await rateLimit(`event:${clientKey(request)}`, 180, 60);
    const e = data.data;
    await query(
      "INSERT INTO analytics_events(kind,path,visitor_hash,session_hash,source,utm_source,utm_medium,utm_campaign,device,duration) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
      [
        e.kind,
        e.path,
        digest(`visitor:${e.visitor}`),
        digest(`session:${e.session}`),
        referralSource(e.referrer, new URL(siteUrl).origin),
        safeCampaign(e.utmSource),
        safeCampaign(e.utmMedium),
        safeCampaign(e.utmCampaign),
        e.device,
        e.duration || null,
      ],
    );
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}
