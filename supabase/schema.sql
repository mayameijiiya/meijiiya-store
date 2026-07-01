-- supabase/schema.sql
-- ============================================================================
-- รันไฟล์นี้ "ครั้งเดียว" แบบ manual ใน Supabase Dashboard > SQL Editor เท่านั้น
-- ห้ามรันจากโค้ดแอป/ตอน build/ตอน deploy — แอปนี้ไม่เรียก migration ใดๆ ตอน runtime
-- (แก้ปัญหา error "relation supabase_migrations.schema_migrations does not exist"
-- ที่เกิดจากมีบางอย่างพยายามรัน migration ตอน runtime — วิธีที่ถูกต้องคือสร้างตารางไว้ล่วงหน้า
-- ผ่าน SQL Editor แบบนี้ แล้วให้โค้ด query ตารางที่มีอยู่แล้วโดยตรงเท่านั้น)
-- ============================================================================

create table if not exists public.products (
  id text primary key,
  name text not null default '',
  brand text not null default '',
  category text not null default '',           -- หมวดหมู่เดี่ยว (เก็บไว้เพื่อความเข้ากันได้ย้อนหลัง)
  categories jsonb not null default '[]'::jsonb, -- หมวดหมู่แบบหลายค่า เช่น ["เสื้อ","สินค้าแนะนำ"]
  price numeric not null default 0,
  original_price numeric,                        -- ราคาปกติก่อนลด (null ถ้าไม่ลดราคา)
  status text not null default 'available',      -- available / reserved / soldout / comingsoon
  condition text not null default '',            -- New / Like New / Good / Used
  tags jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  published boolean not null default true,
  short_description text not null default '',
  description text not null default '',
  colors jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  measurements text not null default '',         -- สัดส่วนสินค้า พิมพ์อิสระ (ขึ้นบรรทัดใหม่ได้)
  fabric text not null default '',
  stock text not null default '',
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ดัชนีช่วยให้ query ตามสถานะ/การเผยแพร่/วันที่เร็วขึ้น
create index if not exists products_published_idx on public.products (published);
create index if not exists products_created_at_idx on public.products (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- แอปนี้ query ผ่าน service role key (bypass RLS โดยอัตโนมัติ) จากฝั่งเซิร์ฟเวอร์เท่านั้น
-- จึงเปิด RLS ไว้เพื่อความปลอดภัย แล้วเพิ่ม policy ให้ "อ่านอย่างเดียว" เฉพาะสินค้าที่เผยแพร่แล้ว
-- ในกรณีที่อนาคตอยากเรียกตารางนี้ตรงจาก client ด้วย anon key
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
  on public.products
  for select
  using (published = true);

-- หมายเหตุ: ไม่ต้องสร้าง policy สำหรับ insert/update/delete เพราะฝั่งแอปใช้ service role key
-- (bypass RLS) ในการเขียนข้อมูลทั้งหมดผ่านหน้า Admin เท่านั้น ไม่มีการเขียนจาก client โดยตรง
