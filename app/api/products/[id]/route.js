import { NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";

export async function GET(request, { params }) {
  const product = getProductById(params.id);
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(product);
}

// PUT: แก้ไขสินค้า (ต้องล็อกอิน Admin ก่อน)
export async function PUT(request, { params }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json();
  const updated = updateProduct(params.id, body);
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}

// DELETE: ลบสินค้า (ต้องล็อกอิน Admin ก่อน)
export async function DELETE(request, { params }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ok = deleteProduct(params.id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
