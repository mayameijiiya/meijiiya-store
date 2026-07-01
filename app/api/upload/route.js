import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { supabaseAdmin, PRODUCT_IMAGES_BUCKET, isSupabaseConfigured } from "@/lib/supabase";

// อัปโหลดรูปสินค้า — เก็บบน Supabase Storage (bucket "product-images") เท่านั้น
// ห้าม!! เขียนไฟล์ลง public/uploads หรือ filesystem ของ Vercel เด็ดขาด เพราะ Vercel serverless
// function เป็น read-only filesystem (จะเจอ error EROFS ถ้าพยายามเขียนไฟล์ตอน production)
// รูปที่อัปโหลดสำเร็จจะได้ public URL กลับไปทันที เพื่อเก็บลงฟิลด์ images ของสินค้าในตาราง Supabase
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB ต่อรูป

function extFromFile(file) {
  const fromName = file.name && file.name.includes(".") ? file.name.split(".").pop() : "";
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  };
  return (fromName || map[file.type] || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
}

export async function POST(request) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "ยังไม่ได้ตั้งค่า Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY) จึงอัปโหลดรูปไม่ได้",
      },
      { status: 500 }
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return NextResponse.json({ error: "อ่านไฟล์ที่ส่งมาไม่สำเร็จ" }, { status: 400 });
  }

  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "ไม่พบไฟล์รูปภาพ" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "รองรับเฉพาะไฟล์ JPG, PNG, WEBP, GIF, SVG เท่านั้น" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "ไฟล์รูปใหญ่เกินไป (จำกัดไม่เกิน 8MB ต่อรูป)" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = extFromFile(file);
  const objectPath = `products/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(objectPath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    // เหตุผลที่พบบ่อยที่สุด: ยังไม่ได้สร้าง bucket "product-images" บน Supabase
    // ดูวิธีสร้างที่ supabase/storage.sql
    return NextResponse.json(
      { error: `อัปโหลดรูปไปยัง Supabase Storage ไม่สำเร็จ: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(objectPath);

  if (!publicUrlData?.publicUrl) {
    return NextResponse.json({ error: "อัปโหลดสำเร็จแต่สร้าง public URL ไม่ได้" }, { status: 500 });
  }

  // ส่งกลับทั้ง url (ชื่อหลัก) และ path (เพื่อความเข้ากันได้ย้อนหลังกับโค้ดฝั่ง client เดิม)
  return NextResponse.json({ url: publicUrlData.publicUrl, path: publicUrlData.publicUrl }, { status: 201 });
}
