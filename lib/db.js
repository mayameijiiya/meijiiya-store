// lib/db.js
// ชั้นเก็บข้อมูล:
// - สินค้า (products) → เก็บใน Supabase Postgres table "products" เป็นหลักเสมอ
//   ไฟล์ data/products.json ใช้เป็น "fallback ข้อมูลตัวอย่างสำหรับตอนพัฒนาในเครื่อง" เท่านั้น
//   (กรณียังไม่ได้ตั้งค่า Supabase) — ไฟล์นี้ "จะไม่ถูกเขียน" บน production/Vercel เด็ดขาด
//   ไม่ว่าจะลืมตั้งค่า Supabase env vars หรือไม่ก็ตาม เพราะระบบไฟล์บน Vercel serverless
//   เป็น read-only (เขียนไฟล์จะเจอ error "EROFS: read-only file system")
// - การตั้งค่าร้าน (settings) → ยังเก็บเป็นไฟล์ data/settings.json เหมือนเดิม (ไม่ได้อยู่ในสโคป
//   ของการแก้ไขนี้ — ถ้ารันบน Vercel การแก้ตั้งค่าร้านผ่านหน้า Admin จะไม่ persist ถาวรเช่นกัน
//   ควรย้ายไป Supabase ในโอกาสถัดไปถ้าต้องการให้ตั้งค่าร้านบันทึกถาวรบน Vercel ด้วย)
//
// ไฟล์นี้ "ไม่" เรียกใช้ migration หรืออ้างอิง schema/migrations table ใดๆ ตอน runtime
// การสร้างตาราง products ต้องทำครั้งเดียวแบบ manual ผ่าน Supabase SQL Editor
// (ดูไฟล์ supabase/schema.sql) ไฟล์นี้ทำหน้าที่ query ข้อมูลไปมาเท่านั้น

import fs from "fs";
import path from "path";
import { supabaseAdmin, PRODUCTS_TABLE, isSupabaseConfigured } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const PRODUCTS_FALLBACK_FILE = path.join(DATA_DIR, "products.json");

// ---------- Dev-only local fallback gate ----------
// true เฉพาะตอนรันในเครื่อง (npm run dev/start) ที่ยังไม่ได้ตั้งค่า Supabase เท่านั้น
// บน Vercel (ตรวจจากตัวแปร VERCEL ที่ Vercel ตั้งให้อัตโนมัติทุก environment) หรือเมื่อ
// NODE_ENV === "production" จะเป็น false เสมอ — การันตีว่า production จะไม่แตะไฟล์นี้
// ไม่ว่ากรณีใดๆ (แม้ลืมตั้งค่า Supabase env vars บน Vercel ก็จะได้ error จาก Supabase
// ตรงๆ แทนที่จะไปพยายามเขียนไฟล์แล้วเจอ EROFS)
const isVercel = Boolean(process.env.VERCEL);
const isProduction = process.env.NODE_ENV === "production";
export const useLocalProductsFallback = !isSupabaseConfigured && !isVercel && !isProduction;

if (useLocalProductsFallback) {
  // เตือนใน log ฝั่งเซิร์ฟเวอร์เฉยๆ ไม่กระทบการทำงาน — เผื่อ dev ลืมตั้งค่า Supabase
  console.warn(
    "[lib/db.js] ยังไม่ได้ตั้งค่า Supabase — ใช้ data/products.json เป็นข้อมูลตัวอย่างชั่วคราวสำหรับพัฒนาในเครื่องเท่านั้น (โหมดนี้จะไม่ทำงานบน production/Vercel)"
  );
}

function readJSON(file) {
  const raw = fs.readFileSync(file, "utf-8");
  return JSON.parse(raw);
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

// สถานะแบบเก่า (ก่อนอัปเดตระบบสินค้า) เก็บเป็นภาษาไทย — แปลงเป็น enum ใหม่ให้อัตโนมัติตอนแสดงผล
const LEGACY_STATUS_MAP = {
  "พร้อมส่ง": "available",
  "พรีออเดอร์": "comingsoon",
  "หมด": "soldout",
};
const VALID_STATUSES = ["available", "reserved", "soldout", "comingsoon"];

// แปลง measurements แบบ object เก่า (chest/waist/hip/length) เป็นข้อความช่องเดียวแบบใหม่
function measurementsObjectToText(m) {
  if (!m || typeof m !== "object") return "";
  const lines = [];
  if (m.chest && m.chest !== "-") lines.push(`อก ${m.chest}`);
  if (m.waist && m.waist !== "-") lines.push(`เอว ${m.waist}`);
  if (m.hip && m.hip !== "-") lines.push(`สะโพก ${m.hip}`);
  if (m.length && m.length !== "-") lines.push(`ยาว ${m.length}`);
  return lines.join("\n");
}

// ---------- Backward compatibility ----------
// normalizeProduct: เติมค่า default ให้สินค้าที่มาจากข้อมูลเก่า/แถวที่ยังไม่ครบทุกคอลัมน์
// ใช้เฉพาะตอน "อ่าน" ข้อมูลไปแสดงผล — ไม่แก้ไขหรือเขียนทับข้อมูลจริงใน Supabase แต่อย่างใด
export function normalizeProduct(p) {
  if (!p) return p;

  const categories =
    Array.isArray(p.categories) && p.categories.length > 0
      ? p.categories
      : p.category
      ? [p.category]
      : ["สินค้าใหม่"];

  let status = "available";
  if (p.status && VALID_STATUSES.includes(p.status)) {
    status = p.status;
  } else if (p.status && LEGACY_STATUS_MAP[p.status]) {
    status = LEGACY_STATUS_MAP[p.status];
  }

  const measurements =
    typeof p.measurements === "string" ? p.measurements : measurementsObjectToText(p.measurements);

  return {
    ...p,
    name: p.name || "",
    price: Number.isFinite(Number(p.price)) ? p.price : 0,
    brand: p.brand || "",
    category: p.category || categories[0] || "",
    categories,
    originalPrice: p.originalPrice === undefined || p.originalPrice === "" ? null : p.originalPrice,
    status,
    condition: p.condition || "",
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
    colors: Array.isArray(p.colors) ? p.colors : [],
    images: Array.isArray(p.images) ? p.images : [],
    measurements,
    fabric: p.fabric || "",
    stock: p.stock ?? "",
    shortDescription: p.shortDescription || "",
    description: p.description || "",
    featured: Boolean(p.featured),
    published: p.published !== false,
    createdAt: p.createdAt || null,
  };
}

// ---------- Supabase <-> app object mapping ----------
// ตาราง Supabase ใช้ชื่อคอลัมน์แบบ snake_case (มาตรฐาน Postgres) ส่วนโค้ดฝั่งเว็บทั้งหมด
// (ProductCard, ProductForm, ฯลฯ) ใช้ camelCase — ฟังก์ชันด้านล่างแปลงกลับไปมาให้ ทำให้ไม่ต้อง
// แก้โค้ดหน้าเว็บ/ฟอร์มที่มีอยู่แล้วเลยสักไฟล์เดียว
function rowToProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    categories: row.categories,
    price: row.price,
    originalPrice: row.original_price,
    status: row.status,
    condition: row.condition,
    tags: row.tags,
    featured: row.featured,
    published: row.published,
    shortDescription: row.short_description,
    description: row.description,
    colors: row.colors,
    sizes: row.sizes,
    measurements: row.measurements,
    fabric: row.fabric,
    stock: row.stock,
    images: row.images,
    createdAt: row.created_at,
  };
}

// แปลง product (camelCase, อาจเป็นแค่บางฟิลด์ตอน update) เป็น row สำหรับเขียนลง Supabase
//
// สำคัญ: ฟิลด์ตัวเลข (price, original_price, stock) ต้อง "ห้าม" ส่งค่าเป็น empty string ""
// เข้า Supabase เด็ดขาด เพราะคอลัมน์เหล่านี้เป็นชนิดตัวเลข (integer/numeric) — ถ้าผู้ใช้เว้นช่องว่างไว้
// (ฟอร์ม Admin ส่ง "" มาตอน input ว่าง) ต้องแปลงเป็น null (ฟิลด์ที่เป็นค่า optional เช่น original_price)
// หรือ 0 (ฟิลด์ที่เป็น NOT NULL/มีความหมายเป็นจำนวน เช่น price, stock) ก่อนส่งเข้า Supabase เสมอ
// ไม่เช่นนั้นจะเจอ error "invalid input syntax for type integer: \"\"" ตอนเพิ่ม/แก้สินค้า
// price/original_price: เป็นตัวเลขล้วนเสมอ (ไม่มีข้อมูลเก่าแบบข้อความอิสระ) จึง sanitize เต็มรูปแบบได้
// (แปลงเป็นตัวเลขเสมอ ถ้าแปลงไม่ได้จริงๆ ให้ fallback เป็นค่า emptyValue)
const STRICT_NUMERIC_EMPTY_VALUE = {
  price: 0, // ราคาขาย — NOT NULL, default 0, ไม่มีความหมายเป็น "ค่าว่าง" ที่ถูกต้อง
  original_price: null, // ราคาปกติก่อนลด — nullable, "ไม่มีการลดราคา" คือ null (ไม่ใช่ 0)
};

// stock: ข้อมูลเก่าบางรายการอาจเคยเก็บเป็นข้อความอิสระ (ไม่ใช่ตัวเลขล้วน) จึง "ไม่บังคับแปลง"
// ค่าที่มีอยู่แล้วให้เป็นตัวเลข (กันข้อมูลเก่าเพี้ยน) — จะแทนที่ด้วยค่านี้เฉพาะตอนเป็นค่าว่างเท่านั้น
const STOCK_EMPTY_VALUE = 0;

function sanitizeNumericValue(value, emptyValue) {
  if (value === "" || value === null || value === undefined) return emptyValue;
  const num = Number(value);
  return Number.isFinite(num) ? num : emptyValue;
}

function productToRow(product, { partial = false } = {}) {
  const map = {
    name: "name",
    brand: "brand",
    category: "category",
    categories: "categories",
    price: "price",
    originalPrice: "original_price",
    status: "status",
    condition: "condition",
    tags: "tags",
    featured: "featured",
    published: "published",
    shortDescription: "short_description",
    description: "description",
    colors: "colors",
    sizes: "sizes",
    measurements: "measurements",
    fabric: "fabric",
    stock: "stock",
    images: "images",
  };

  const row = {};
  for (const [key, column] of Object.entries(map)) {
    if (partial && !(key in product)) continue; // ตอน update ให้ส่งเฉพาะฟิลด์ที่มีการแก้ไขจริง
    let value = product[key];

    if (column in STRICT_NUMERIC_EMPTY_VALUE) {
      value = sanitizeNumericValue(value, STRICT_NUMERIC_EMPTY_VALUE[column]);
    } else if (column === "stock") {
      // ห้ามส่ง "" เข้า Supabase เด็ดขาด (ถ้าคอลัมน์เป็นตัวเลขจะพัง) แต่ไม่บังคับแปลงค่าที่มีอยู่แล้ว
      // ให้เป็นตัวเลข เผื่อเป็นข้อมูลเก่าที่เคยเก็บเป็นข้อความอิสระ
      if (value === "" || value === null || value === undefined) value = STOCK_EMPTY_VALUE;
    }

    if (["categories", "tags", "colors", "sizes", "images"].includes(column) && value === undefined) {
      value = partial ? undefined : [];
    }
    if (value !== undefined) row[column] = value;
  }
  return row;
}

function throwIfError(error, action) {
  if (error) {
    // โยน error ที่มีข้อความชัดเจน ให้ API route จับไปตอบกลับเป็น 500 พร้อมข้อความที่อ่านรู้เรื่อง
    // แทนที่จะปล่อยให้ process ล้มแบบไม่ทราบสาเหตุ
    throw new Error(`Supabase ${action} ล้มเหลว: ${error.message}`);
  }
}

// ---------- Local fallback helpers (dev only — ดูเงื่อนไข useLocalProductsFallback ด้านบน) ----------
function readLocalProducts() {
  if (!fs.existsSync(PRODUCTS_FALLBACK_FILE)) return [];
  return readJSON(PRODUCTS_FALLBACK_FILE);
}

function writeLocalProducts(products) {
  // เผื่อ guard ซ้ำอีกชั้น: ฟังก์ชันนี้จะไม่ถูกเรียกเลยถ้า useLocalProductsFallback เป็น false
  // แต่ใส่เช็กไว้ตรงนี้ด้วยเพื่อความชัวร์ ป้องกันการเขียนไฟล์บน production/Vercel โดยไม่ตั้งใจ
  if (!useLocalProductsFallback) {
    throw new Error("ปฏิเสธการเขียน data/products.json: ฟังก์ชันนี้ใช้ได้เฉพาะตอนพัฒนาในเครื่องเท่านั้น");
  }
  writeJSON(PRODUCTS_FALLBACK_FILE, products);
}

// ---------- Products ----------

// getAllProducts: ดึงสินค้าทั้งหมด (รวมที่ปิดการแสดงผล) เรียงจากใหม่ไปเก่า
export async function getAllProducts() {
  if (useLocalProductsFallback) {
    const products = readLocalProducts();
    return [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  const { data, error } = await supabaseAdmin
    .from(PRODUCTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  throwIfError(error, "อ่านรายการสินค้า");
  return (data || []).map(rowToProduct);
}

// getAllProductsDisplay: เหมือน getAllProducts แต่เติมค่า default ให้ครบ เหมาะกับตาราง Admin
export async function getAllProductsDisplay() {
  const products = await getAllProducts();
  return products.map(normalizeProduct);
}

// getPublishedProducts: สินค้าที่แสดงบนหน้าเว็บจริงทั้งหมด (Home/Products/Product Detail/
// New Arrivals/Recommended/Sale ใช้ฟังก์ชันนี้ร่วมกันทั้งหมด) — กติกา: แสดงทุกตัวที่ published
// "ไม่ใช่ false" อย่างเคร่งครัด กล่าวคือ published === true, null, หรือ undefined ก็ต้องแสดงด้วย
// ซ่อนเฉพาะตัวที่ published === false เท่านั้น (เจ้าของร้านกดปิดแสดงผลชัดเจน)
export async function getPublishedProducts() {
  const products = await getAllProducts();
  return products.filter((p) => p.published === true || p.published === null || p.published === undefined)
    .map(normalizeProduct);
}

export async function getProductById(id) {
  if (useLocalProductsFallback) {
    const products = readLocalProducts();
    const found = products.find((p) => String(p.id) === String(id));
    return found ? normalizeProduct(found) : undefined;
  }

  const { data, error } = await supabaseAdmin
    .from(PRODUCTS_TABLE)
    .select("*")
    .eq("id", String(id))
    .maybeSingle();
  throwIfError(error, "อ่านข้อมูลสินค้า");
  if (!data) return undefined;
  return normalizeProduct(rowToProduct(data));
}

export async function createProduct(product) {
  const id = product.id || Date.now().toString();
  const base = {
    published: true,
    featured: false,
    brand: "",
    images: [],
    colors: [],
    sizes: [],
    tags: [],
    categories: [],
    measurements: "",
    fabric: "",
    stock: "",
    condition: "New",
    status: "available",
    originalPrice: "",
    ...product,
    id,
  };

  if (useLocalProductsFallback) {
    const products = readLocalProducts();
    const newProduct = { ...base, createdAt: new Date().toISOString() };
    products.unshift(newProduct);
    writeLocalProducts(products);
    return normalizeProduct(newProduct);
  }

  const row = { id, created_at: new Date().toISOString(), ...productToRow(base) };
  const { data, error } = await supabaseAdmin.from(PRODUCTS_TABLE).insert(row).select().single();
  throwIfError(error, "เพิ่มสินค้า");
  return normalizeProduct(rowToProduct(data));
}

export async function updateProduct(id, updates) {
  if (useLocalProductsFallback) {
    const products = readLocalProducts();
    const idx = products.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updates, id: products[idx].id };
    writeLocalProducts(products);
    return normalizeProduct(products[idx]);
  }

  const row = productToRow(updates, { partial: true });
  const { data, error } = await supabaseAdmin
    .from(PRODUCTS_TABLE)
    .update(row)
    .eq("id", String(id))
    .select()
    .maybeSingle();
  throwIfError(error, "แก้ไขสินค้า");
  if (!data) return null;
  return normalizeProduct(rowToProduct(data));
}

export async function deleteProduct(id) {
  if (useLocalProductsFallback) {
    const products = readLocalProducts();
    const filtered = products.filter((p) => String(p.id) !== String(id));
    const changed = filtered.length !== products.length;
    if (changed) writeLocalProducts(filtered);
    return changed;
  }

  const { data, error } = await supabaseAdmin
    .from(PRODUCTS_TABLE)
    .delete()
    .eq("id", String(id))
    .select();
  throwIfError(error, "ลบสินค้า");
  return Array.isArray(data) && data.length > 0;
}

// ---------- Settings (ยังเป็นไฟล์ JSON เหมือนเดิม — ไม่ได้อยู่ในสโคปของการแก้ไขนี้) ----------
export function getSettings() {
  return readJSON(SETTINGS_FILE);
}

export function updateSettings(updates) {
  const settings = getSettings();
  const merged = { ...settings, ...updates };
  writeJSON(SETTINGS_FILE, merged);
  return merged;
}
