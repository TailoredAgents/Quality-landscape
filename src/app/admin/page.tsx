import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { previewMode } from "@/lib/config";
import { Dashboard } from "@/components/dashboard";
export const dynamic = "force-dynamic";
export default async function Admin() {
  let authenticated = false;
  try {
    authenticated = await isAuthenticated();
  } catch {}
  if (!authenticated) redirect("/admin/login");
  return (
    <Dashboard
      preview={previewMode}
      sampleAllowed={previewMode || process.env.ALLOW_SAMPLE_DATA === "true"}
    />
  );
}
