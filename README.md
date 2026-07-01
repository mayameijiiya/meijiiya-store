# Meijiiya / เมจิยา — เว็บไซต์โชว์และขายเสื้อผ้าออนไลน์

เว็บไซต์แสดงสินค้าแฟชั่นสไตล์มินิมอล ลูกค้าดูสินค้า แคปรูป แล้วสั่งซื้อผ่าน LINE (ไม่มีตะกร้าสินค้า ไม่มีระบบชำระเงินในเว็บ)
เจ้าของร้านเพิ่ม/แก้ไข/ลบสินค้าและอัปโหลดรูปเองได้จากหน้า Admin Dashboard

สร้างด้วย Next.js 14 (App Router) + Tailwind CSS **ข้อมูลสินค้าเก็บใน Supabase Postgres** (ตาราง `products`) ส่วนการตั้งค่าร้านยังเก็บเป็นไฟล์ `data/settings.json` เหมือนเดิม

---

## 0.4) แก้ไขล่าสุด: หน้าเว็บจริงไม่แสดงสินค้าใหม่ (ทั้งที่บันทึกเข้า Supabase สำเร็จแล้ว)

**สาเหตุ:** Next.js App Router มี "Data Cache" ที่แอบ cache ผลลัพธ์ของ `fetch()` ทุกตัวโดยอัตโนมัติ รวมถึง fetch ที่ `@supabase/supabase-js` เรียกใช้ภายในตอน query ตาราง `products` ด้วย แม้แต่ละหน้าจะมี `export const dynamic = "force-dynamic"` อยู่แล้วก็ตาม ทำให้บางครั้งหน้าเว็บยังแสดงข้อมูลชุดเก่าอยู่หลังเพิ่ม/แก้สินค้าใหม่

**สิ่งที่แก้:**

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `lib/supabase.js` | เพิ่ม custom fetch (`noStoreFetch`) ที่บังคับ `cache: "no-store"` ให้กับทั้ง `supabaseAdmin` และ `supabasePublic` ผ่าน option `global.fetch` — การันตีว่าทุก query จาก Supabase จะไม่ถูก cache โดย Next.js Data Cache เด็ดขาด |
| `app/page.js`, `app/products/page.js`, `app/products/[id]/page.js`, `app/new-arrivals/page.js`, `app/recommended/page.js`, `app/sale/page.js` | เพิ่ม `export const revalidate = 0` เสริมจาก `dynamic = "force-dynamic"` เดิม เพื่อยืนยันชัดเจนว่าไม่มีการ cache หน้าเหล่านี้เลย |
| `lib/db.js` | ปรับ `getPublishedProducts()` ให้เงื่อนไขชัดเจนขึ้น: แสดงสินค้าทุกตัวที่ `published === true`, `null`, หรือ `undefined` — ซ่อนเฉพาะตัวที่ `published === false` เท่านั้น (ตรรกะเดิมถูกต้องอยู่แล้ว แต่เขียนให้ชัดเจนไม่กำกวม) |

Product CRUD และหน้าเว็บทั้ง 6 หน้า (Home, Products, Product Detail, New Arrivals, Recommended, Sale) อ่านข้อมูลจากตาราง Supabase `products` โดยตรงทั้งหมด — ไม่มีการ fallback ไป `data/products.json` บน production/Vercel (ดู `useLocalProductsFallback` ใน `lib/db.js`)

---

## 0.3) ย้ายระบบอัปโหลดรูปสินค้าไปใช้ Supabase Storage

**สาเหตุเดิม:** `app/api/upload/route.js` ยังเขียนไฟล์รูปลง `public/uploads/products` ด้วย `fs.writeFileSync` ซึ่งใช้ไม่ได้บน Vercel (read-only filesystem) ทำให้อัปโหลดรูปจริงไม่สำเร็จตอน production

**สิ่งที่แก้:** เปลี่ยน `/api/upload` ให้อัปโหลดไฟล์ไป Supabase Storage bucket ชื่อ `product-images` โดยตรง (ผ่าน `supabaseAdmin.storage`, service role key) แล้วคืน public URL กลับมาให้หน้า Admin เก็บลงฟิลด์ `images` ของสินค้า — ไม่มีการเขียนไฟล์ลง filesystem ของ Vercel อีกต่อไป

### ไฟล์ที่แก้/เพิ่มรอบนี้

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/api/upload/route.js` | เขียนใหม่ทั้งไฟล์ — ลบโค้ด `fs`/`path`/`writeFileSync` ทั้งหมด เปลี่ยนเป็นอัปโหลดผ่าน `supabaseAdmin.storage.from("product-images").upload(...)` แล้ว `getPublicUrl(...)` คืนค่า `{ url, path }` (ทั้งสอง field เป็น public URL เดียวกัน) |
| `lib/supabase.js` | เพิ่ม export `PRODUCT_IMAGES_BUCKET = "product-images"` |
| `components/admin/ImageUploader.jsx` | อ่าน `data.url` จาก response แทน `data.path` เดิม, ปรับให้อัปโหลดหลายรูปแล้วรูปที่สำเร็จจะถูกเพิ่มเข้า form แม้บางรูปจะอัปโหลดไม่สำเร็จ (ไม่เสียรูปที่อัปโหลดสำเร็จไปด้วย) |
| `supabase/storage.sql` (ใหม่) | SQL สร้าง bucket `product-images` แบบ public + policy อ่านสาธารณะ — **รัน manual ครั้งเดียวใน Supabase SQL Editor** (หรือสร้างผ่าน Dashboard > Storage ก็ได้ ดูคอมเมนต์ในไฟล์) |

Product CRUD (`app/api/products/route.js`, `app/api/products/[id]/route.js`, `lib/db.js`) ตรวจสอบแล้วว่าใช้ตาราง Supabase `products` โดยตรงทั้งหมดอยู่แล้วตั้งแต่รอบที่แล้ว ไม่ต้องแก้เพิ่ม

---

## 0.2) ย้ายระบบสินค้าไปใช้ Supabase (แก้ 500 error ตอนบันทึกสินค้าบน Vercel)

**สาเหตุเดิม:** ระบบสินค้าฉบับก่อนหน้าเก็บข้อมูลเป็นไฟล์ `data/products.json` บนดิสก์ ซึ่งใช้ไม่ได้บน Vercel (serverless filesystem เป็น read-only/ephemeral) ทำให้กดบันทึกสินค้าแล้วขึ้น 500

**สิ่งที่แก้:** ย้าย CRUD สินค้าทั้งหมด (อ่าน/เพิ่ม/แก้/ลบ) ไปคุยกับตาราง `products` บน Supabase โดยตรง ผ่าน `@supabase/supabase-js` — ไม่มีการเรียก migration หรืออ้างอิง `supabase_migrations.schema_migrations` ใดๆ ในโค้ดแอปเลย

### ไฟล์ที่แก้/เพิ่มรอบนี้

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `lib/supabase.js` (ใหม่) | สร้าง Supabase client 2 ตัว: `supabaseAdmin` (service role key, ใช้ query ตาราง products ทั้งหมดฝั่งเซิร์ฟเวอร์) และ `supabasePublic` (anon key, เผื่อใช้งานฝั่ง client ในอนาคต) |
| `lib/db.js` | เขียนฟังก์ชันสินค้าใหม่ทั้งหมดให้เป็น `async` และ query Supabase แทนไฟล์ JSON (`getAllProducts`, `getPublishedProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`) มี mapping ระหว่างคอลัมน์ `snake_case` ของ Supabase กับ field `camelCase` ที่โค้ดหน้าเว็บใช้อยู่เดิม (ไม่ต้องแก้ ProductCard/ProductForm ฯลฯ เลย) ฟังก์ชันตั้งค่าร้าน (`getSettings`/`updateSettings`) **ไม่ได้แก้** ยังเป็นไฟล์ JSON เหมือนเดิม |
| `app/api/products/route.js`, `app/api/products/[id]/route.js` | เพิ่ม `await` และ `try/catch` ครอบการเรียก Supabase คืน error เป็น JSON 500 พร้อมข้อความที่อ่านรู้เรื่อง แทนที่จะปล่อยให้ process ล้ม |
| `app/page.js`, `app/products/page.js`, `app/products/[id]/page.js`, `app/new-arrivals/page.js`, `app/recommended/page.js`, `app/sale/page.js`, `app/admin/products/[id]/edit/page.js` | แปลงเป็น async Server Component + `await` การดึงข้อมูลสินค้า พร้อมข้อความ error ที่เป็นมิตรถ้าดึงข้อมูลไม่สำเร็จ (หน้าเว็บไม่ล่มทั้งหน้า) |
| `supabase/schema.sql` (ใหม่) | คำสั่ง SQL สร้างตาราง `products` — **รัน manual ครั้งเดียวใน Supabase SQL Editor เท่านั้น** ไม่ถูกเรียกจากแอป |
| `scripts/seed-supabase.js` (ใหม่) | สคริปต์นำเข้าข้อมูลจาก `data/products.json` เดิมไปยัง Supabase — รัน manual ครั้งเดียวด้วย `npm run seed:supabase` |
| `.env.local.example` (ใหม่) | ตัวอย่างไฟล์ env สำหรับรันบนเครื่อง |
| `package.json` | เพิ่ม dependency `@supabase/supabase-js` และ script `seed:supabase` |

### ต้องทำก่อนใช้งานจริง (ทำครั้งเดียว)

1. เปิด Supabase Dashboard > SQL Editor แล้วรันคำสั่งทั้งหมดในไฟล์ `supabase/schema.sql`
2. ตั้งค่า Environment Variables ทั้งบน Vercel (Project Settings > Environment Variables) และในเครื่อง (`.env.local` จากตัวอย่าง `.env.local.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (**ห้าม** ตั้งด้วย prefix `NEXT_PUBLIC_` และห้ามใส่ในโค้ดฝั่ง client เด็ดขาด)
3. (ถ้ามีสินค้าเดิมอยากย้ายเข้า Supabase) รัน `npm run seed:supabase` จากเครื่องตัวเอง — สคริปต์นี้จะอ่าน `data/products.json` แล้ว upsert เข้าตาราง `products` ให้ครบ
4. Deploy ใหม่บน Vercel (redeploy) ให้ environment variables มีผล

### ความปลอดภัยของ Service Role Key

`SUPABASE_SERVICE_ROLE_KEY` ถูกใช้เฉพาะใน `lib/supabase.js` ซึ่งถูก import จาก `lib/db.js` และไฟล์ API route ภายใต้ `app/api/**` เท่านั้น (โค้ดฝั่งเซิร์ฟเวอร์ล้วน ไม่มี `"use client"` ไฟล์ไหน import ไฟล์นี้) Next.js จะไม่ bundle environment variable ที่ไม่มี prefix `NEXT_PUBLIC_` ลงไปในโค้ดฝั่ง browser อยู่แล้ว จึงมั่นใจได้ว่า key นี้ไม่หลุดไปฝั่ง client

### สิ่งที่ยังไม่ได้แก้ในรอบนี้ (นอกสโคปคำขอ แต่ควรทราบไว้)

- **การตั้งค่าร้าน** (`data/settings.json` — ลิงก์ LINE/โซเชียล/ข้อความหน้าเว็บ) ยังเป็นไฟล์ JSON เหมือนเดิม การแก้ผ่านหน้า Admin > ตั้งค่าร้าน จะ**ไม่ persist ถาวรบน Vercel** เช่นกัน (เหตุผลเดียวกับที่สินค้าเคยมีปัญหา) ถ้าต้องการให้บันทึกถาวรบน Vercel ด้วย แจ้งได้ จะย้ายไป Supabase ให้ในลักษณะเดียวกัน
- **การอัปโหลดรูปสินค้า** (`app/api/upload/route.js`) ยังเขียนไฟล์ลง `public/uploads/` ซึ่งใช้ไม่ได้บน Vercel เช่นกัน (serverless filesystem ไม่ถาวร) ควรย้ายไปใช้ Supabase Storage หรือบริการเก็บไฟล์อื่น เช่น Cloudinary — ยังไม่ได้แก้ในรอบนี้เพราะโจทย์ระบุเฉพาะ API สินค้า (CRUD) เท่านั้น

---

## 0.1) แก้ไขล่าสุด: รองรับสินค้าข้อมูลเก่า (Backward Compatibility)

`lib/db.js` เพิ่มฟังก์ชัน `normalizeProduct()` ที่เติมค่า default ให้สินค้าที่ยังเป็น schema เก่า (เช่น มี `category` เดี่ยวแทน `categories`, สถานะภาษาไทยแทน enum ใหม่, `measurements` เป็น object แทนข้อความ หรือไม่มี `sizes`/`tags`/`condition`/`brand`/`originalPrice` เลย) ทำงานเฉพาะตอน**อ่านข้อมูลไปแสดงผล** เท่านั้น — ไม่แก้ไขหรือเขียนทับไฟล์ `data/products.json` จนกว่าจะมีการบันทึกสินค้าชิ้นนั้นซ้ำผ่านหน้า Admin จริงๆ (และเมื่อบันทึก จะกระทบเฉพาะสินค้าชิ้นที่แก้เท่านั้น สินค้าอื่นในไฟล์ไม่ถูกแตะต้อง) ทดสอบแล้วว่าสินค้าที่ไม่มีฟิลด์ใหม่เลยยังแสดงผลได้ถูกต้องในหน้า Home, Products, New Arrivals, Recommended, Sale, Product Detail และหน้า Admin

## 0) อัปเดตล่าสุด: อัปเกรดเป็นเว็บขายของแบบ Shopee-lite (มือหนึ่ง/มือสอง, ไซซ์, ลดราคา, Sale)

### ฟิลด์ใหม่ที่เพิ่มในสินค้า (`data/products.json`)

| ฟิลด์ | ความหมาย |
|---|---|
| `brand` | ชื่อแบรนด์สินค้า (เว้นว่างได้ถ้าไม่มี จะไม่แสดงบนเว็บ) |
| `categories` | หมวดหมู่ **แบบหลายค่า** (array) เช่น `["เสื้อ", "สินค้าแนะนำ", "Sale"]` — แทนที่ `category` เดิม (ยังเก็บ `category` ตัวแรกไว้เผื่อโค้ดเก่าอ้างอิง) |
| `originalPrice` | ราคาปกติ ถ้าใส่และมากกว่า `price` จะแสดงราคาขีดฆ่า + ป้าย Sale อัตโนมัติ |
| `condition` | สภาพสินค้า: `New` (มือหนึ่ง) / `Like New` / `Good` / `Used` |
| `status` | สถานะสินค้าแบบ enum ใหม่: `available` (พร้อมสั่งซื้อ) / `reserved` (ติดจอง) / `soldout` (สินค้าหมด — ปุ่ม LINE จะถูกปิดใช้งาน) / `comingsoon` (เร็วๆ นี้) |
| `measurements` | สัดส่วนสินค้า เป็น **ข้อความช่องเดียว** พิมพ์อิสระ (แทนที่ฟิลด์ chest/waist/hip/length แบบเดิม) |
| `createdAt` | วันที่เพิ่มสินค้า ใช้เรียง "สินค้าใหม่ล่าสุด" |

ฟิลด์เดิม (`colors`, `sizes`, `tags`, `fabric`, `stock`, `shortDescription`, `description`, `images`, `featured`, `published`) ยังอยู่ครบ ไม่มีอะไรหาย

### หน้าเว็บใหม่

- `/new-arrivals` — สินค้าใหม่ล่าสุด 8 ชิ้น (เรียงตาม `createdAt`)
- `/recommended` — สินค้าแนะนำ (ติ๊ก "สินค้าแนะนำ" ในแอดมิน หรือเลือกหมวดหมู่ "สินค้าแนะนำ")
- `/sale` — สินค้าลดราคา (มี `originalPrice` มากกว่าราคาขาย หรือเลือกหมวดหมู่ "Sale")
- หน้า `/products` มี ช่องค้นหา + กรองหมวดหมู่ + กรองไซซ์ + กรองสภาพสินค้า + เรียงราคา/วันที่ใหม่ล่าสุด

### วิธีเพิ่มสินค้าใหม่ในหน้า Admin (อัปเดต)

ไปที่ **Admin > เพิ่มสินค้าใหม่** แล้วกรอก: ชื่อสินค้า, แบรนด์ (ถ้ามี), ราคาขาย, ราคาปกติ (ถ้ามีลดราคา), สภาพสินค้า, สถานะสินค้า, จำนวนคงเหลือ, เนื้อผ้า, คำอธิบายสั้น/เต็ม, สีที่มี, ไซซ์ (เลือกได้หลายไซซ์), สัดส่วนสินค้า (พิมพ์อิสระในช่องเดียว), หมวดหมู่ (เลือกได้หลายหมวดหมู่ เช่นติ๊กทั้ง "เสื้อ" และ "สินค้าแนะนำ"), แท็ก (พิมพ์แล้ว Enter หรือกดปุ่มแนะนำ), ตั้งเป็นสินค้าแนะนำ, เปิด/ปิดการแสดงผล แล้วกด "เผยแพร่สินค้า"

### Migration ข้อมูลเก่า

ข้อมูลสินค้าตัวอย่างเดิม 10 ชิ้นถูกแปลงเป็นโครงสร้างใหม่ให้อัตโนมัติแล้ว (ไม่ต้องทำอะไรเพิ่ม): `category` เดี่ยว → `categories` array, สถานะไทย (`พร้อมส่ง`/`พรีออเดอร์`/`หมด`) → enum ใหม่ (`available`/`comingsoon`/`soldout`), สัดส่วนแบบ object 4 ช่อง → ข้อความช่องเดียว พร้อมเพิ่มตัวอย่าง `brand`+`condition` (สินค้ามือสอง 2 ชิ้น) และ `originalPrice`+หมวดหมู่ "Sale" (สินค้าลดราคา 2 ชิ้น) เพื่อสาธิตฟีเจอร์ใหม่ให้ครบ

หากมีข้อมูลสินค้าอื่นที่เพิ่มเองไปแล้วก่อนอัปเดตนี้ (ผ่านหน้า Admin เดิม) ระบบจะยังอ่านได้ปกติ เพราะฟอร์มและหน้าเว็บมี fallback รองรับข้อมูลรูปแบบเก่า (เช่น `category` เดี่ยว, `measurements` แบบ object) โดยอัตโนมัติ แต่แนะนำให้เข้าไปแก้ไข/บันทึกสินค้านั้นซ้ำในหน้า Admin เพื่ออัปเดตให้เป็นรูปแบบใหม่เต็มรูปแบบ

### ตรวจสอบแล้วว่าใช้งานได้จริง

`npm run dev` และ `npm run build` ผ่านทั้งคู่ ทดสอบ API จริง (login, เพิ่มสินค้าด้วยฟิลด์ใหม่ครบ, ลบสินค้า, สินค้าหมดสถานะ `soldout` ปุ่ม LINE ถูกปิดใช้งานถูกต้อง, หน้า `/sale` `/recommended` `/new-arrivals` แสดงผลถูกต้อง) — ระบบ Admin เดิม (เพิ่ม/แก้ไข/ลบสินค้า, อัปโหลดรูป, ตั้งค่าร้าน) ยังทำงานปกติทุกจุด

---

## 1) วิธีติดตั้งและรันเว็บไซต์

ต้องมี [Node.js](https://nodejs.org) เวอร์ชัน 18 ขึ้นไปในเครื่อง และโปรเจกต์ Supabase ที่รันไฟล์ `supabase/schema.sql` แล้ว (ดูหัวข้อ 0.2 ด้านบน)

```bash
cd meijiiya-store
cp .env.local.example .env.local   # แล้วใส่ค่า Supabase จริงในไฟล์นี้
npm install
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000` จะเห็นหน้าเว็บไซต์
หน้า Admin Dashboard อยู่ที่ `http://localhost:3000/admin`
รหัสผ่านเริ่มต้น: `meijiiya2026` (แก้ได้ที่หน้า Admin > ตั้งค่าร้าน หลังล็อกอินครั้งแรก หรือแก้ไฟล์ `data/settings.json`)

เมื่อพร้อมใช้งานจริง ให้รัน `npm run build` แล้ว `npm start`

---

## 2) จุดที่ต้องแก้ไขก่อนใช้งานจริง

ทุกจุดนี้แก้ได้ 2 ทาง: (1) เข้าหน้า **Admin > ตั้งค่าร้าน** หลังล็อกอิน หรือ (2) แก้ไฟล์ `data/settings.json` ตรงๆ

| รายการ | ไฟล์/หน้าที่แก้ | หมายเหตุ |
|---|---|---|
| ชื่อร้าน / Tagline | Admin > ตั้งค่าร้าน หรือ `data/settings.json` | `shopNameEn`, `shopNameTh`, `tagline` |
| ลิงก์ LINE OA | Admin > ตั้งค่าร้าน หรือ `data/settings.json` | ใส่ลิงก์จริงแล้ว: `https://lin.ee/wDd89mZ` |
| TikTok / Facebook / Instagram / Shopee / Lemon8 / YouTube / Email / เบอร์โทร | Admin > ตั้งค่าร้าน หรือ `data/settings.json` (`socials`) | ตอนนี้เป็น placeholder ทั้งหมด ต้องแก้เป็นลิงก์จริง |
| โลโก้ร้าน | วางไฟล์ภาพไว้ที่โฟลเดอร์ `public/` (เช่น `public/logo.png`) แล้วใส่ path `/logo.png` ที่ช่อง "โลโก้" ใน Admin > ตั้งค่าร้าน | ถ้าไม่ใส่ เว็บจะแสดงชื่อร้านเป็นตัวอักษรแทนโลโก้ (ตอนนี้ยังไม่ได้แนบไฟล์โลโก้มาด้วย จึงยังไม่ได้ใส่ค่านี้ให้) |
| รหัสผ่าน Admin | Admin > ตั้งค่าร้าน (ช่องเปลี่ยนรหัสผ่าน) | แนะนำให้เปลี่ยนก่อนใช้งานจริง |
| รูปสินค้าตัวอย่าง | หน้า Admin > แก้ไขสินค้าแต่ละชิ้น | ตอนนี้เป็นภาพ placeholder สีไอวอรี่ ระบุชื่อสินค้า ใช้แทนตำแหน่งรูปจริงชั่วคราว |
| ภาพ Hero หน้าแรก | `public/uploads/hero.svg` | แทนที่ด้วยรูปหน้าร้าน/นางแบบใส่สินค้าจริงได้ |

---

## 3) โครงสร้างเว็บไซต์

```
app/
  page.js                    → หน้า Home
  products/page.js           → หน้า All Products (filter + search)
  products/[id]/page.js      → หน้า Product Detail
  how-to-order/page.js       → หน้าวิธีสั่งซื้อ
  contact/page.js            → หน้าติดต่อร้าน
  admin/                     → Admin Dashboard (ต้องล็อกอิน)
    page.js                  → รายการสินค้า + จัดการสถานะ/แสดงผล/ลบ
    products/new/page.js     → ฟอร์มเพิ่มสินค้า
    products/[id]/edit/page.js → ฟอร์มแก้ไขสินค้า
    settings/page.js         → ตั้งค่าร้าน (LINE, โซเชียล, ข้อความต่างๆ)
    login/page.js            → หน้าล็อกอิน Admin
  api/                       → API routes (products, upload, settings, admin auth)
components/                  → UI components ที่ใช้ร่วมกัน (Header, Footer, ProductCard, LineButton ฯลฯ)
data/
  products.json               → ฐานข้อมูลสินค้า (ไฟล์ JSON)
  settings.json                → ข้อมูลร้าน/ลิงก์ต่างๆ (ไฟล์ JSON)
public/uploads/                → รูปสินค้าที่อัปโหลดจากหน้า Admin จะถูกเก็บที่นี่
lib/
  db.js                        → ฟังก์ชันอ่าน/เขียนข้อมูลสินค้าและตั้งค่า
  auth.js                      → ระบบล็อกอิน Admin แบบง่าย (รหัสผ่านเดียว + cookie)
  line.js                      → ฟังก์ชันสร้างข้อความสั่งซื้อและเปิดลิงก์ LINE
```

มีสินค้าตัวอย่างให้ 10 ชิ้นครอบคลุมทุกหมวดหมู่ (เสื้อ, กางเกง, เดรส, กระโปรง, กระเป๋า, เซ็ต) พร้อมสถานะครบทั้ง 3 แบบ (พร้อมส่ง / พรีออเดอร์ / หมด) ให้ทดลองระบบได้ทันที ลบออกและเพิ่มสินค้าจริงได้เลยจากหน้า Admin

---

## 4) ฟีเจอร์ที่มีให้แล้ว

- **หน้าเว็บลูกค้า**: Home, All Products (filter หมวดหมู่ + ค้นหา + filter สถานะ), Product Detail (gallery หลายรูป, สี/ไซซ์/เนื้อผ้า/ขนาด), How to Order, Contact
- **ปุ่ม LINE ทุกจุดสำคัญ**: Header, Product Card, Product Detail, Footer, หน้า How to Order, Floating button มุมล่างขวาทุกหน้า — ทุกปุ่มลิงก์ไปที่ `https://lin.ee/wDd89mZ`
- **ข้อความสั่งซื้ออัตโนมัติ**: ปุ่ม LINE ในหน้าสินค้าจะคัดลอกข้อความ "สนใจสินค้านี้ค่ะ: [ชื่อ] ราคา [ราคา]" ไปไว้ใน clipboard ก่อนเปิด LINE ให้ลูกค้าวางในแชทได้ทันที (ลิงก์ lin.ee ไม่รองรับการฝังข้อความในตัวลิงก์โดยตรง)
- **Admin Dashboard**: เพิ่ม/แก้ไข/ลบสินค้า, อัปโหลดรูปหลายรูป, เปลี่ยนสถานะ/หมวดหมู่/ราคา/สี/ไซซ์, ตั้งสินค้าแนะนำ, เปิด-ปิดการแสดงผล, ตั้งค่าร้าน (LINE, โซเชียล, ข้อความหน้าเว็บ)
- **Responsive**: ใช้งานได้ดีทั้งมือถือ แท็บเล็ต คอมพิวเตอร์
- **ไม่มีตะกร้าสินค้า ไม่มีระบบชำระเงินออนไลน์** ตามที่กำหนด — มีกล่องข้อความแจ้งลูกค้าให้แคปรูปแล้วทัก LINE ทุกหน้าที่เกี่ยวข้อง

---

## 5) ข้อควรทราบก่อน Deploy ขึ้นเซิร์ฟเวอร์จริง

ระบบนี้เก็บข้อมูลสินค้า/รูปภาพเป็นไฟล์บนดิสก์ (`data/*.json`, `public/uploads/`) จึง **ต้อง deploy บนเซิร์ฟเวอร์ที่มี persistent disk** เช่น VPS ทั่วไป, Railway, Render หรือ DigitalOcean

**ห้าม deploy บน Vercel หรือแพลตฟอร์ม serverless อื่นๆ** เพราะระบบไฟล์ในแพลตฟอร์มเหล่านี้ไม่ถาวร ข้อมูลที่แอดมินเพิ่ม/แก้ไข หรือรูปที่อัปโหลดจะหายไปเมื่อเซิร์ฟเวอร์รีสตาร์ท

หากต้องการขยายระบบในอนาคต แนะนำให้:
- ย้ายข้อมูลสินค้า/ตั้งค่าจาก JSON ไปเป็นฐานข้อมูลจริง (PostgreSQL, MongoDB, Supabase ฯลฯ) — ฟังก์ชันใน `lib/db.js` ออกแบบให้สลับ implementation ได้โดยไม่กระทบหน้าเว็บอื่น
- ย้ายการเก็บรูปภาพไปใช้บริการเก็บไฟล์ เช่น AWS S3, Cloudinary, Supabase Storage
- เพิ่มระบบยืนยันตัวตนที่รัดกุมขึ้นถ้ามีผู้ดูแลหลายคน

---

## 6) ความปลอดภัยของหน้า Admin

หน้า Admin ป้องกันด้วยรหัสผ่านเดียว + cookie (เหมาะกับร้านที่มีเจ้าของร้านดูแลคนเดียว) ให้เปลี่ยนรหัสผ่านเริ่มต้น (`meijiiya2026`) ทันทีที่เริ่มใช้งานจริงที่หน้า **Admin > ตั้งค่าร้าน**
