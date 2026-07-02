import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await getSettings();
    if (isAdminAuthed()) {
      return NextResponse.json(settings);
    }
    // ผู้ใช้ทั่วไปไม่ควรเห็นรหัสผ่าน Admin
    const { adminPassword, ...publicSettings } = settings;
    return NextResponse.json(publicSettings);
  } catch (err) {
    console.error("[GET /api/settings]", err);
    return NextResponse.json({ error: err.message || "โหลดการตั้งค่าไม่สำเร็จ" }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const updated = await updateSettings(body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/settings]", err);
    return NextResponse.json({ error: err.message || "บันทึกการตั้งค่าไม่สำเร็จ" }, { status: 500 });
  }
}
