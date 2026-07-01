import { NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const product = await getProductById(params.id);
    if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error("[GET /api/products/[id]]", err);
    return NextResponse.json({ error: err.message || "โหลดข้อมูลสินค้าไม่สำเร็จ" }, { status: 500 });
  }
}

// PUT: แก้ไขสินค้า (ต้องล็อกอิน Admin ก่อน) — เขียนตรงลง Supabase table products
export async function PUT(request, { params }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const updated = await updateProduct(params.id, body);
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/products/[id]]", err);
    return NextResponse.json({ error: err.message || "บันทึกสินค้าไม่สำเร็จ" }, { status: 500 });
  }
}

// DELETE: ลบสินค้า (ต้องล็อกอิน Admin ก่อน)
export async function DELETE(request, { params }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const ok = await deleteProduct(params.id);
    if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/products/[id]]", err);
    return NextResponse.json({ error: err.message || "ลบสินค้าไม่สำเร็จ" }, { status: 500 });
  }
}
