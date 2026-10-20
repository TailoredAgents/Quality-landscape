import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { apiError, HttpError } from "@/lib/security";
import { inquiryCsv, type Inquiry } from "@/lib/dashboard-data";
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const days = Number(new URL(request.url).searchParams.get("days") || 30);
    if (![7, 30, 90].includes(days))
      throw new HttpError(400, "Invalid date range.");
    const rows = await query<Inquiry>(
      "SELECT id,name,phone,email,service,location,message,status,notification_status,created_at FROM inquiries WHERE created_at >= (((now() AT TIME ZONE 'America/New_York')::date - ($1::integer - 1)) AT TIME ZONE 'America/New_York') ORDER BY created_at DESC",
      [days],
    );
    return new Response(inquiryCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="quality-inquiries.csv"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
