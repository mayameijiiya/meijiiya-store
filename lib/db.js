// lib/db.js
// ชั้นเก็บข้อมูลแบบไฟล์ JSON (data/products.json, data/settings.json)
// เหมาะสำหรับเวอร์ชันทดลอง/ใช้งานจริงขนาดเล็กที่รันบนเซิร์ฟเวอร์ที่มี persistent disk
// (เช่น VPS, Railway, Render) — ถ้าจะ deploy บน Vercel/serverless ระบบไฟล์จะไม่บันทึกถาวร
// ควรย้ายไปใช้ฐานข้อมูลจริง เช่น PostgreSQL/Supabase/MongoDB ในอนาคต (โครงสร้างฟังก์ชันด้านล่าง
// ออกแบบมาให้สลับไปต่อฐานข้อมูลจริงได้ง่าย เพียงเปลี่ยน implementation ภายในไฟล์นี้)

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

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
// normalizeProduct: เติมค่า default ให้สินค้าที่มาจากข้อมูลเก่า (schema ก่อนอัปเดต)
// ใช้เฉพาะตอน "อ่าน" ข้อมูลไปแสดงผล — ไม่แก้ไขหรือเขียนทับไฟล์ data/products.json แต่อย่างใด
// ข้อมูลที่มีอยู่แล้วจะไม่ถูกลบหรือเปลี่ยนแปลง มีแต่เติมฟิลด์ที่ขาดหายไปเท่านั้น
export function normalizeProduct(p) {
  if (!p) return p;

  // categories: ถ้าไม่มี ให้ใช้ category เดี่ยวแบบเก่า ถ้าไม่มีเลยให้เข้ากลุ่ม "สินค้าใหม่" เป็นค่า default
  const categories =
    Array.isArray(p.categories) && p.categories.length > 0
      ? p.categories
      : p.category
      ? [p.category]
      : ["สินค้าใหม่"];

  // status: รองรับค่าภาษาไทยแบบเก่า / ค่าที่ไม่รู้จัก ให้ default เป็น available
  let status = "available";
  if (p.status && VALID_STATUSES.includes(p.status)) {
    status = p.status;
  } else if (p.status && LEGACY_STATUS_MAP[p.status]) {
    status = LEGACY_STATUS_MAP[p.status];
  }

  // measurements: รองรับทั้งข้อความ (แบบใหม่) และ object 4 ช่อง (แบบเก่าสุด)
  const measurements =
    typeof p.measurements === "string"
      ? p.measurements
      : measurementsObjectToText(p.measurements);

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

// ---------- Products ----------
// getAllProducts: อ่านข้อมูล "ดิบ" ตรงจากไฟล์ ไม่ปรับแต่งใดๆ
// ใช้ภายในสำหรับ create/update/delete เพื่อไม่ให้สินค้ารายการอื่นที่ไม่ได้แก้ไขถูกเปลี่ยนรูปแบบข้อมูลโดยไม่ตั้งใจ
export function getAllProducts() {
  return readJSON(PRODUCTS_FILE);
}

// getAllProductsDisplay: เหมือน getAllProducts แต่เติมค่า default ให้ครบ เหมาะสำหรับแสดงผล (เช่น ตารางในหน้า Admin)
export function getAllProductsDisplay() {
  return getAllProducts().map(normalizeProduct);
}

export function getPublishedProducts() {
  return getAllProducts()
    .filter((p) => p.published !== false)
    .map(normalizeProduct);
}

export function getProductById(id) {
  const found = getAllProducts().find((p) => String(p.id) === String(id));
  return found ? normalizeProduct(found) : undefined;
}

export function createProduct(product) {
  const products = getAllProducts();
  const newId = Date.now().toString();
  const newProduct = {
    id: newId,
    createdAt: new Date().toISOString(),
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
  };
  products.unshift(newProduct);
  writeJSON(PRODUCTS_FILE, products);
  return newProduct;
}

export function updateProduct(id, updates) {
  const products = getAllProducts();
  const idx = products.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates, id: products[idx].id };
  writeJSON(PRODUCTS_FILE, products);
  return products[idx];
}

export function deleteProduct(id) {
  const products = getAllProducts();
  const filtered = products.filter((p) => String(p.id) !== String(id));
  writeJSON(PRODUCTS_FILE, filtered);
  return filtered.length !== products.length;
}

// ---------- Settings ----------
export function getSettings() {
  return readJSON(SETTINGS_FILE);
}

export function updateSettings(updates) {
  const settings = getSettings();
  const merged = { ...settings, ...updates };
  writeJSON(SETTINGS_FILE, merged);
  return merged;
}
