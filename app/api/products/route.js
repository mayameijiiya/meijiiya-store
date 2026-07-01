import { NextResponse } from "next/server";
import { getAllProductsDisplay, createProduct } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";

// GET: คืนสินค้าทั้งหมด (รวมที่ปิดการแสดงผล) — ใช้โดยหน้า Admin
// อ่านตรงจากตาราง products ใน Supabase (ไม่มีการเรียก migration ใดๆ)
export async function GET() {
  try {
    const products = await getAllProductsDisplay();
    return NextResponse.json(products);
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ error: err.message || "โหลดรายการสินค้าไม่สำเร็จ" }, { status: 500 });
  }
}

// POST: เพิ่มสินค้าใหม่ (ต้องล็อกอิน Admin ก่อน)
export async function POST(request) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ error: "กรุณากรอกชื่อสินค้าและราคา" }, { status: 400 });
    }
    const product = await createProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("[POST /api/products]", err);
    return NextResponse.json({ error: err.message || "เพิ่มสินค้าไม่สำเร็จ" }, { status: 500 });
  }
}
