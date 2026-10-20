import { requireAdmin } from "@/lib/auth";
import { apiError, noStore, HttpError } from "@/lib/security";
import { previewMode } from "@/lib/config";
import { sampleDashboard } from "@/lib/dashboard-data";
import { realDashboard } from "@/lib/dashboard";
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const params = new URL(request.url).searchParams;
    const days = Number(params.get("days") || 30);
    if (![7, 30, 90].includes(days))
      throw new HttpError(400, "Choose a 7, 30, or 90 day range.");
    if (params.get("mode") === "sample") {
      if (!previewMode && process.env.ALLOW_SAMPLE_DATA !== "true")
        throw new HttpError(403, "Sample mode is disabled.");
      return noStore(sampleDashboard(days));
    }
    return noStore(await realDashboard(days));
  } catch (error) {
    return apiError(error);
  }
}
