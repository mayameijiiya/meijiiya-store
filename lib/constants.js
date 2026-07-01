// ==== หมวดหมู่สินค้า (Categories) — สินค้า 1 ชิ้นเลือกได้หลายหมวดหมู่ (multi-select) ====
// เพิ่ม/แก้ไขได้ตรงนี้ — หน้า Admin และหน้าเว็บจะดึงจากลิสต์นี้อัตโนมัติ
export const CATEGORIES = [
  "สินค้าใหม่",
  "สินค้าแนะนำ",
  "พร้อมส่ง",
  "มือหนึ่ง",
  "มือสอง",
  "เสื้อ",
  "กางเกง",
  "กระโปรง",
  "เดรส",
  "เสื้อคลุม",
  "กระเป๋า",
  "รองเท้า",
  "Accessories",
  "Sale",
  "เซ็ต",
];

// หมวดหมู่ที่มีความหมายพิเศษ ใช้อ้างอิงใน logic ของหน้า Home/สินค้า (อย่าลบชื่อเหล่านี้ ถ้าจะเปลี่ยนต้องแก้โค้ดที่ใช้งานด้วย)
export const CATEGORY_NEW = "สินค้าใหม่";
export const CATEGORY_RECOMMENDED = "สินค้าแนะนำ";
export const CATEGORY_SALE = "Sale";

// ==== สถานะสินค้า (Product Status) ====
// value = ค่าที่เก็บในระบบ (ภาษาอังกฤษ, ใช้ใน logic), label = ข้อความที่แสดงบนเว็บ
export const STATUS_OPTIONS = [
  { value: "available", label: "พร้อมสั่งซื้อ" },
  { value: "reserved", label: "ติดจอง" },
  { value: "soldout", label: "สินค้าหมด" },
  { value: "comingsoon", label: "เร็วๆ นี้" },
];

export function getStatusLabel(value) {
  return STATUS_OPTIONS.find((s) => s.value === value)?.label || value;
}

// ==== สภาพสินค้า (Condition) — สำหรับสินค้ามือหนึ่ง/มือสอง ====
export const CONDITION_OPTIONS = [
  { value: "New", label: "มือหนึ่ง" },
  { value: "Like New", label: "มือสองสภาพเหมือนใหม่" },
  { value: "Good", label: "มือสองสภาพดี" },
  { value: "Used", label: "ผ่านการใช้งาน" },
];

export function getConditionLabel(value) {
  return CONDITION_OPTIONS.find((c) => c.value === value)?.label || value;
}

// ป้าย/แท็กสินค้าที่แนะนำให้ใช้ (พิมพ์เพิ่มเองได้อิสระในหน้า Admin)
export const SUGGESTED_TAGS = [
  "แบรนด์แท้",
  "ราคาดี",
  "งานสวย",
  "ใส่ได้ทุกวัน",
  "มือสองสภาพดี",
  "มือหนึ่ง",
  "พร้อมส่ง",
  "New",
  "Best Seller",
];

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size"];
