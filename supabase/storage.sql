-- supabase/storage.sql
-- ============================================================================
-- รันไฟล์นี้ "ครั้งเดียว" แบบ manual ใน Supabase Dashboard > SQL Editor เท่านั้น
-- (เหมือนกับ supabase/schema.sql — ห้ามรันจากโค้ดแอปหรือตอน build/deploy)
--
-- ไฟล์นี้สร้าง Storage bucket ชื่อ "product-images" สำหรับเก็บรูปสินค้าที่อัปโหลดผ่านหน้า
-- Admin (แทนการเขียนไฟล์ลง public/uploads ซึ่งใช้ไม่ได้บน Vercel เพราะ filesystem read-only)
--
-- ทางเลือกอื่น: สร้าง bucket ผ่านหน้า Dashboard ก็ได้เช่นกัน โดยไม่ต้องรัน SQL นี้เลย:
--   Supabase Dashboard > Storage > New bucket
--   - Name: product-images
--   - Public bucket: เปิด (ON)
--   แล้วข้ามไปส่วน policy ด้านล่างได้เลย (การเปิด Public bucket ผ่าน Dashboard จะตั้งค่า
--   เทียบเท่ากับ SQL บรรทัดแรกด้านล่างให้อัตโนมัติ)
-- ============================================================================

-- 1) สร้าง bucket "product-images" แบบ public (อ่านรูปได้โดยไม่ต้องล็อกอิน ผ่าน public URL โดยตรง)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- ---------------------------------------------------------------------------
-- 2) Row Level Security policies สำหรับ storage.objects
-- หมายเหตุ: API /api/upload ของแอปนี้อัปโหลดรูปโดยใช้ SUPABASE_SERVICE_ROLE_KEY ซึ่ง bypass
-- RLS โดยอัตโนมัติอยู่แล้ว จึง "ไม่จำเป็น" ต้องมี policy สำหรับ insert/update/delete เลย
-- แต่ยังต้องมี policy "select" (อ่าน) ให้ฝั่ง public/anon เผื่อกรณีมีการเรียกผ่าน anon key
-- โดยตรงในอนาคต ถึงแม้ bucket จะเป็น public แล้วก็ตาม (การตั้ง policy ไว้ชัดเจนปลอดภัยกว่า)
-- ---------------------------------------------------------------------------
drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects
  for select
  using (bucket_id = 'product-images');

-- ไม่ต้องสร้าง policy insert/update/delete เพิ่มเติม เพราะฝั่งแอปเขียนผ่าน service role key
-- (bypass RLS) จากฝั่งเซิร์ฟเวอร์ (app/api/upload/route.js) เท่านั้น ไม่มีการอัปโหลดจาก client ตรงๆ
