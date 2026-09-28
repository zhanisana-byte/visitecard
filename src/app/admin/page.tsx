import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";
import AdminDashboard from "./_components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const store = await cookies();
  if (!verifyAdminSession(store.get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
  return <AdminDashboard />;
}
