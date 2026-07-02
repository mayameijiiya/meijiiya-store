import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(request) {
  const { password } = await request.json();
  const settings = await getSettings();

  if (password && password === settings.adminPassword) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE_NAME, "authenticated", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // จำการล็อกอิน 7 วัน
    });
    return res;
  }

  return NextResponse.json({ ok: false, error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
}
