import { requireAdmin } from "@/lib/auth";
import {
  assertOrigin,
  readJson,
  apiError,
  noStore,
  HttpError,
} from "@/lib/security";
import { query } from "@/lib/db";
import { z } from "zod";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertOrigin(request);
    await requireAdmin();
    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success)
      throw new HttpError(400, "Invalid inquiry identifier.");
    const result = z
      .object({ status: z.enum(["new", "contacted", "scheduled", "closed"]) })
      .safeParse(await readJson(request, 500));
    if (!result.success) throw new HttpError(400, "Choose a valid status.");
    const rows = await query(
      "UPDATE inquiries SET status=$1,updated_at=now() WHERE id=$2 RETURNING id",
      [result.data.status, id],
    );
    if (!rows.length) throw new HttpError(404, "Inquiry not found.");
    return noStore({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
