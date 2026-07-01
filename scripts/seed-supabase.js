// scripts/seed-supabase.js
// ============================================================================
// สคริปต์นำเข้าข้อมูลสินค้าจาก data/products.json ไปยังตาราง products บน Supabase
// รันแบบ "manual" ครั้งเดียวจากเครื่องของคุณเท่านั้น (ไม่ได้ถูกเรียกโดยแอปตอน runtime
// หรือตอน build/deploy บน Vercel แต่อย่างใด) — ใช้สำหรับย้ายข้อมูลตัวอย่าง/ข้อมูลเดิม
// เข้า Supabase หลังจากสร้างตารางด้วย supabase/schema.sql แล้วเท่านั้น
//
// วิธีใช้:
//   1) รัน supabase/schema.sql ใน Supabase SQL Editor ให้เรียบร้อยก่อน
//   2) สร้างไฟล์ .env.local (ดู .env.local.example) แล้วใส่ค่า
//      NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ให้ครบ
//   3) รันคำสั่ง: npm run seed:supabase
//
// สคริปต์นี้ใช้ "upsert" (เขียนทับเฉพาะแถวที่ id ตรงกัน, เพิ่มแถวใหม่ถ้ายังไม่มี) จึงรันซ้ำได้
// โดยไม่ทำให้ข้อมูลซ้ำซ้อน แต่จะไม่ลบสินค้าที่มีอยู่ใน Supabase แล้วแต่ไม่อยู่ในไฟล์ JSON
// ============================================================================

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// โหลดค่าจาก .env.local แบบง่ายๆ (ไม่ต้องพึ่ง dependency เพิ่ม) ถ้ามีไฟล์นี้อยู่
function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "ขาด environment variable: ต้องตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ก่อน (ใน .env.local หรือ export ใน shell)"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

function measurementsObjectToText(m) {
  if (!m || typeof m !== "object") return "";
  const lines = [];
  if (m.chest && m.chest !== "-") lines.push(`อก ${m.chest}`);
  if (m.waist && m.waist !== "-") lines.push(`เอว ${m.waist}`);
  if (m.hip && m.hip !== "-") lines.push(`สะโพก ${m.hip}`);
  if (m.length && m.length !== "-") lines.push(`ยาว ${m.length}`);
  return lines.join("\n");
}

function productToRow(p) {
  const categories = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories : p.category ? [p.category] : [];
  return {
    id: String(p.id),
    name: p.name || "",
    brand: p.brand || "",
    category: p.category || categories[0] || "",
    categories,
    price: Number(p.price) || 0,
    original_price: p.originalPrice === "" || p.originalPrice === undefined ? null : Number(p.originalPrice),
    status: p.status || "available",
    condition: p.condition || "",
    tags: Array.isArray(p.tags) ? p.tags : [],
    featured: Boolean(p.featured),
    published: p.published !== false,
    short_description: p.shortDescription || "",
    description: p.description || "",
    colors: Array.isArray(p.colors) ? p.colors : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    measurements: typeof p.measurements === "string" ? p.measurements : measurementsObjectToText(p.measurements),
    fabric: p.fabric || "",
    stock: p.stock === undefined || p.stock === null ? "" : String(p.stock),
    images: Array.isArray(p.images) ? p.images : [],
    created_at: p.createdAt || new Date().toISOString(),
  };
}

async function main() {
  const jsonPath = path.join(process.cwd(), "data", "products.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("ไม่พบไฟล์ data/products.json");
    process.exit(1);
  }
  const products = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const rows = products.map(productToRow);

  console.log(`กำลังนำเข้าสินค้า ${rows.length} รายการไปยัง Supabase...`);
  const { data, error } = await supabase.from("products").upsert(rows, { onConflict: "id" }).select();

  if (error) {
    console.error("นำเข้าข้อมูลไม่สำเร็จ:", error.message);
    process.exit(1);
  }

  console.log(`นำเข้าสำเร็จ ${data.length} รายการ`);
}

main();
