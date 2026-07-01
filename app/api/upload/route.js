import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAdminAuthed } from "@/lib/auth";

// อัปโหลดรูปสินค้า — บันทึกไฟล์ไว้ที่ public/uploads/products
// หมายเหตุ: ถ้า deploy บนแพลตฟอร์ม serverless (เช่น Vercel) ไฟล์ระบบจะไม่ถาวร
// แนะนำให้รันบนเซิร์ฟเวอร์ที่มี persistent disk (VPS/Railway/Render) หรือย้ายไปใช้บริการเก็บไฟล์ เช่น S3/Cloudinary ในอนาคต
export async function POST(request) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "ไม่พบไฟล์รูปภาพ" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "รองรับเฉพาะไฟล์ JPG, PNG, WEBP, GIF" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  fs.mkdirSync(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
  fs.writeFileSync(path.join(uploadDir, safeName), buffer);

  return NextResponse.json({ path: `/uploads/products/${safeName}` }, { status: 201 });
}
