import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";

export async function GET() {
  const settings = getSettings();
  if (isAdminAuthed()) {
    return NextResponse.json(settings);
  }
  // ผู้ใช้ทั่วไปไม่ควรเห็นรหัสผ่าน Admin
  const { adminPassword, ...publicSettings } = settings;
  return NextResponse.json(publicSettings);
}

export async function PUT(request) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json();
  const updated = updateSettings(body);
  return NextResponse.json(updated);
}
