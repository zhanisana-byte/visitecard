import { NextResponse } from "next/server";
import { createAdminSession, ADMIN_COOKIE } from "@/lib/admin-session";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const okEmail = String(email || "").trim().toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase();
  const okPassword = String(password || "") === (process.env.ADMIN_PASSWORD || "");
  if (!okEmail || !okPassword) return NextResponse.json({error:"E-mail ou mot de passe incorrect."},{status:401});
  const res = NextResponse.json({ok:true});
  res.cookies.set(ADMIN_COOKIE, createAdminSession(email), {
    httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"strict", path:"/", maxAge:8*60*60
  });
  return res;
}
