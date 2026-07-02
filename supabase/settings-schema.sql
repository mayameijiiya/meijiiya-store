-- supabase/settings-schema.sql
-- ============================================================================
-- รันไฟล์นี้แบบ manual ใน Supabase Dashboard > SQL Editor เท่านั้น
-- (เหมือนกับ supabase/schema.sql และ supabase/storage.sql — ห้ามรันจากโค้ดแอปหรือตอน build/deploy
-- แอปนี้ไม่เรียก migration ใดๆ ตอน runtime)
--
-- สคริปต์นี้เขียนแบบ "idempotent" — รันซ้ำกี่ครั้งก็ได้โดยไม่เกิด error:
--   - สร้างตารางแบบ if not exists (แค่คอลัมน์ id ก่อน กันพลาดตอนสร้างครั้งแรก)
--   - เพิ่มแต่ละคอลัมน์แบบ add column if not exists ทีละคอลัมน์ (ครอบคลุมกรณีตารางมีอยู่แล้ว
--     บางส่วนจากการรันครั้งก่อนที่อาจไม่สำเร็จ)
--   - ลบ policy เดิมก่อนด้วย drop policy if exists แล้วค่อยสร้างใหม่
-- ============================================================================

-- 1) สร้างตาราง (ถ้ายังไม่มี) — เริ่มจากคอลัมน์ id อย่างเดียวก่อน แล้วค่อยเติมคอลัมน์อื่นด้านล่าง
create table if not exists public.settings (
  id text primary key default 'main'
);

-- 2) เพิ่มคอลัมน์ทีละคอลัมน์แบบปลอดภัย (ข้ามคอลัมน์ที่มีอยู่แล้วโดยอัตโนมัติ)
alter table public.settings add column if not exists shop_name_en text not null default '';
alter table public.settings add column if not exists shop_name_th text not null default '';
alter table public.settings add column if not exists tagline text not null default '';
alter table public.settings add column if not exists short_intro text not null default '';
alter table public.settings add column if not exists about_text text not null default '';
alter table public.settings add column if not exists line_link text not null default '';
alter table public.settings add column if not exists socials jsonb not null default '{}'::jsonb; -- { tiktok, facebook, instagram, shopee, lemon8, youtube, email, phone }
alter table public.settings add column if not exists shipping_text text not null default '';
alter table public.settings add column if not exists footer_note text not null default '';
alter table public.settings add column if not exists how_to_order_steps jsonb not null default '[]'::jsonb;
alter table public.settings add column if not exists no_online_payment_notice text not null default '';
alter table public.settings add column if not exists admin_password text not null default '';
alter table public.settings add column if not exists logo_path text not null default '';
alter table public.settings add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- 3) Row Level Security (RLS)
-- แอปอ่าน/เขียนตารางนี้ผ่าน service role key (bypass RLS) จากฝั่งเซิร์ฟเวอร์เท่านั้น
-- เปิด RLS ไว้เพื่อความปลอดภัย + เพิ่ม policy อ่านอย่างเดียวแบบสาธารณะ เผื่ออนาคตอยากอ่านค่า
-- ตั้งค่าที่ไม่ลับ (เช่น ชื่อร้าน, LINE link) ตรงจาก client ด้วย anon key
-- หมายเหตุ: field admin_password ไม่ควรถูกอ่านจาก client ฝั่งสาธารณะ — โค้ดแอป (app/api/settings/route.js)
-- จะกรอง field นี้ออกก่อนส่งกลับให้ผู้ใช้ทั่วไปที่ไม่ได้ล็อกอิน Admin อยู่แล้วเสมอ ไม่ว่า RLS จะอนุญาตอ่านหรือไม่
-- ---------------------------------------------------------------------------
alter table public.settings enable row level security;

drop policy if exists "Public can read settings" on public.settings;
create policy "Public can read settings"
  on public.settings
  for select
  using (true);

-- ไม่ต้องสร้าง policy สำหรับ insert/update เพราะฝั่งแอปเขียนผ่าน service role key (bypass RLS)
-- จากหน้า Admin > ตั้งค่าร้าน เท่านั้น ไม่มีการเขียนจาก client โดยตรง
