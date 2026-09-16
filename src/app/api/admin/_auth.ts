import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "zhanisana@gmail.com"
).toLowerCase();

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL manquante.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const accessToken = authorization.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return null;
  }

  const supabase = getAdminSupabase();

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user || !data.user.email) {
    return null;
  }

  if (data.user.email.toLowerCase() !== ADMIN_EMAIL) {
    return null;
  }

  return {
    supabase,
    user: data.user,
  };
}
