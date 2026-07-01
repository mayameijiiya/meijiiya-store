import { NextResponse } from "next/server";
import { getAllProductsDisplay, createProduct } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";

// GET: คืนสินค้าทั้งหมด (รวมที่ปิดการแสดงผล) — ใช้โดยหน้า Admin
// ใช้ getAllProductsDisplay ที่เติมค่า default ให้ฟิลด์ใหม่ที่สินค้าเก่าอาจไม่มี (ไม่กระทบไฟล์จริง)
export async function GET() {
  return NextResponse.json(getAllProductsDisplay());
}

// POST: เพิ่มสินค้าใหม่ (ต้องล็อกอิน Admin ก่อน)
export async function POST(request) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.name || !body.price) {
    return NextResponse.json({ error: "กรุณากรอกชื่อสินค้าและราคา" }, { status: 400 });
  }
  const product = createProduct(body);
  return NextResponse.json(product, { status: 201 });
}
