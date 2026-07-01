// lib/supabase.js
// ตั้งค่า Supabase client — ไฟล์นี้ต้องใช้เฉพาะฝั่งเซิร์ฟเวอร์เท่านั้น
// (lib/db.js และไฟล์ API route ใน app/api/**) ห้าม import ไฟล์นี้จากไฟล์ที่มี "use client"
// เด็ดขาด เพราะ supabaseAdmin ใช้ SUPABASE_SERVICE_ROLE_KEY ซึ่งมีสิทธิ์ bypass Row Level
// Security ทั้งหมด — ถ้าหลุดไปฝั่ง browser จะเท่ากับเปิดสิทธิ์เต็มให้ใครก็แก้ฐานข้อมูลได้
//
// Environment variables ที่ต้องตั้งค่า (ใน Vercel > Project Settings > Environment Variables
// หรือไฟล์ .env.local สำหรับรันบนเครื่อง — ดูตัวอย่างที่ .env.local.example):
//   NEXT_PUBLIC_SUPABASE_URL       = URL โปรเจกต์ Supabase (Project Settings > API)
//   NEXT_PUBLIC_SUPABASE_ANON_KEY  = anon/public key (ปลอดภัยที่จะ expose ฝั่ง client ได้)
//   SUPABASE_SERVICE_ROLE_KEY      = service_role key (ห้าม expose ฝั่ง client เด็ดขาด)
//
// สำคัญ: ไฟล์นี้ "ไม่" เรียกใช้ migration หรือแตะ schema ใดๆ ตอน runtime — เป็นแค่การสร้าง
// client เชื่อมต่อฐานข้อมูลเพื่อ query ตาราง products โดยตรงเท่านั้น การสร้าง/แก้ตาราง
// (migration) ต้องทำแบบ manual ครั้งเดียวผ่าน Supabase SQL Editor (ดู supabase/schema.sql)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;

// ค่า placeholder ด้านบนมีไว้เพื่อไม่ให้ `npm run build` ล้มตอนไม่มี environment variable จริง
// (เช่น รัน build ในเครื่อง dev ที่ยังไม่ได้ตั้งค่า) — ตอน deploy จริงบน Vercel ต้องตั้งค่า
// environment variables ทั้ง 3 ตัวให้ครบ ไม่งั้นการเชื่อมต่อฐานข้อมูลจะล้มเหลวตอนเรียกใช้งานจริง
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// สำคัญมาก: Next.js App Router (บน Vercel) จะ "แอบ cache" ผลลัพธ์ของ fetch() ทุกตัวโดยอัตโนมัติ
// (Data Cache) รวมถึง fetch ที่ supabase-js เรียกใช้ภายในตอน query ตาราง products ด้วย — เป็นสาเหตุ
// ที่พบบ่อยที่สุดของอาการ "บันทึกสินค้าใหม่เข้า Supabase สำเร็จ แต่หน้าเว็บจริงไม่แสดงสินค้าใหม่"
// ถึงแม้หน้านั้นจะมี `export const dynamic = "force-dynamic"` แล้วก็ตาม (บาง runtime ของ Next ยังแอบ
// cache fetch เดิมซ้ำอยู่ดี) จึงบังคับ cache: "no-store" ที่ตัว fetch ของ Supabase client ตรงๆ ทั้งคู่
// เพื่อการันตีว่าทุก query จะยิงไปอ่านข้อมูลสดจาก Supabase ทุกครั้ง ไม่มีการอ่านจากแคชเก่าเด็ดขาด
function noStoreFetch(url, options = {}) {
  return fetch(url, { ...options, cache: "no-store" });
}

// ใช้สำหรับอ่านข้อมูลสาธารณะแบบผ่าน Row Level Security (เผื่ออนาคตอยากเรียกจาก client โดยตรง)
export const supabasePublic = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
  global: { fetch: noStoreFetch },
});

// ใช้เฉพาะฝั่งเซิร์ฟเวอร์ (API routes / Server Components) เท่านั้น — bypass RLS
// เพื่อให้หน้า Admin เพิ่ม/แก้/ลบ/อ่านสินค้าทั้งหมด (รวมที่ปิดการแสดงผล) ได้แน่นอน
// ไม่ต้องพึ่ง policy ของ RLS ที่อาจตั้งค่าไว้ไม่ครบ
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: noStoreFetch },
});

export const PRODUCTS_TABLE = "products";

// ชื่อ Supabase Storage bucket ที่ใช้เก็บรูปสินค้า — ต้องสร้าง bucket นี้ไว้ล่วงหน้าแบบ manual
// ผ่าน Supabase Dashboard หรือรัน SQL ใน supabase/storage.sql ครั้งเดียว (ดูไฟล์นั้นประกอบ)
export const PRODUCT_IMAGES_BUCKET = "product-images";
