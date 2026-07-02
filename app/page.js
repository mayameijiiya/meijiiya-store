import Link from "next/link";
import { getPublishedProducts, getSettings } from "@/lib/db";
import { CATEGORY_RECOMMENDED, CATEGORY_SALE } from "@/lib/constants";
import ProductCard from "@/components/ProductCard";
import LineButton from "@/components/LineButton";
import NoticeBox from "@/components/NoticeBox";

// ข้อมูลสินค้าถูกดึงจาก Supabase ตรงๆ ทุกครั้งที่มีคนเข้าเว็บ เพื่อให้เห็นสินค้าที่เพิ่ง
// เพิ่ม/แก้จากหน้า Admin ทันที — ปิดทุกชั้นการ cache ของ Next.js อย่างชัดเจน (ดู lib/supabase.js
// สำหรับการปิด cache ของตัว fetch ที่ supabase-js ใช้ภายในด้วย)
export const dynamic = "force-dynamic";
export const revalidate = 0;

// เมนูหมวดหมู่ด่วนบนหน้าแรก (หมวดหมู่แบบเต็มดูได้ที่หน้า /products) — เลื่อนแนวนอนได้บนมือถือ
const HOME_CATEGORY_MENU = ["สินค้าใหม่", "สินค้าแนะนำ", "พร้อมส่ง", "เสื้อ", "เดรส", "กระเป๋า", "Sale"];

// แถบ tab ด่วนสไตล์หน้าร้าน Shopee — เป็นลิงก์ที่พาไปยังส่วนจริงบนเว็บเท่านั้น
// (ไม่ใส่แท็บ "รีวิว" เพราะระบบยังไม่มีฟีเจอร์รีวิวจริง จะทำให้ลูกค้าเข้าใจผิด)
const SHOP_TABS = [
  { label: "ร้านค้า", href: "#store" },
  { label: "รายการสินค้า", href: "/products" },
  { label: "หมวดหมู่", href: "#categories" },
];

const FEATURE_ROW = [
  { title: "ส่งฟรี", desc: "ทุกออเดอร์ ไม่มีขั้นต่ำ" },
  { title: "ของแท้ 100%", desc: "คัดเฉพาะสินค้าของแท้" },
  { title: "ส่งไว", desc: "แพ็กไว ส่งผ่านขนส่ง Shopee" },
  { title: "คืนสินค้า/ติดต่อร้าน", desc: "ทัก LINE ได้ตลอดเวลา" },
];

export default async function HomePage() {
  const settings = await getSettings();

  let products = [];
  let loadError = null;
  try {
    products = await getPublishedProducts();
  } catch (err) {
    console.error("[HomePage] getPublishedProducts failed:", err);
    loadError = "ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
  }

  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);

  const recommended = products
    .filter((p) => p.featured || p.categories?.includes(CATEGORY_RECOMMENDED))
    .slice(0, 8);

  const saleProducts = products
    .filter((p) => (p.originalPrice && Number(p.originalPrice) > Number(p.price)) || p.categories?.includes(CATEGORY_SALE))
    .slice(0, 8);

  return (
    <div className="pb-4">
      {/* Hero Banner — สไตล์แบนเนอร์หน้าร้าน Shopee ผสมความคลีนแบบ Zara/COS */}
      <section className="container-brand pt-4 md:pt-8">
        <div className="relative bg-ink rounded-2xl md:rounded-3xl overflow-hidden">
          <div className="relative px-6 py-10 md:py-16 flex flex-col items-center text-center gap-4">
            <span className="text-[11px] tracking-wide uppercase text-white/60">{settings.tagline}</span>
            <h1 className="flex flex-col gap-1">
              <span className="text-3xl md:text-5xl font-semibold tracking-tight uppercase text-white">
                {settings.shopNameEn}
              </span>
              <span className="text-sm md:text-base text-white/70">{settings.shopNameTh}</span>
            </h1>
            <p className="text-white/70 max-w-md text-sm leading-relaxed">{settings.shortIntro}</p>
            <div className="flex flex-col sm:flex-row gap-2.5 mt-3 w-full sm:w-auto">
              <Link
                href="/products"
                className="min-h-touch inline-flex items-center justify-center rounded-lg bg-white text-ink px-6 text-sm font-medium active:scale-[0.98] transition-transform"
              >
                ดูสินค้าทั้งหมด
              </Link>
              <LineButton lineLink={settings.lineLink} label="สั่งซื้อทาง LINE" />
            </div>
          </div>
        </div>
      </section>

      {loadError && (
        <div className="container-brand mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{loadError}</div>
        </div>
      )}

      {/* Store info card — สไตล์หน้าร้าน Shopee */}
      <section id="store" className="container-brand mt-4">
        <div className="product-card p-4 md:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {settings.logoPath ? (
              <img
                src={settings.logoPath}
                alt={settings.shopNameEn}
                className="w-14 h-14 rounded-full object-cover border border-bordergray shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-ink text-white flex items-center justify-center text-lg font-semibold shrink-0">
                {settings.shopNameEn?.[0] || "M"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-ink font-semibold truncate">{settings.shopNameEn}</h2>
                <span className="badge-neutral shrink-0">ร้านแนะนำ</span>
              </div>
              <p className="text-graytext text-xs mt-0.5 line-clamp-1">{settings.tagline}</p>
            </div>
            <LineButton lineLink={settings.lineLink} variant="outline" label="แชท" className="!px-4 !py-2 !text-xs shrink-0" />
          </div>

          {/* Tab เมนูด่วน */}
          <div className="flex gap-2 border-t border-bordergray pt-3 -mx-1 px-1 overflow-x-auto scroll-hide">
            {SHOP_TABS.map((tab, i) => (
              <a
                key={tab.href}
                href={tab.href}
                className={`category-pill ${i === 0 ? "category-pill-active" : "category-pill-inactive"}`}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Category horizontal scroll */}
      <section id="categories" className="container-brand mt-8">
        <h2 className="text-sm font-semibold text-ink mb-3">หมวดหมู่สินค้า</h2>
        <div className="flex gap-2.5 overflow-x-auto scroll-hide -mx-4 px-4 md:mx-0 md:px-0">
          {HOME_CATEGORY_MENU.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className="category-pill category-pill-inactive"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <ProductSection
        title="สินค้าแนะนำ"
        subtitle="คัดมาแล้วว่าน่าใส่ น่าแมตช์ ใส่ได้ทุกวัน"
        products={recommended}
        lineLink={settings.lineLink}
        seeAllHref="/recommended"
      />

      {/* New Arrivals */}
      <ProductSection
        title="สินค้าใหม่ล่าสุด"
        subtitle="อัปเดตล่าสุดจากร้าน มาไวหมดไว"
        products={newArrivals}
        lineLink={settings.lineLink}
        seeAllHref="/new-arrivals"
      />

      {/* Sale */}
      <ProductSection
        title="ลดราคาพิเศษ"
        subtitle="ราคาคุ้ม คุณภาพเดิม จำนวนจำกัด"
        products={saleProducts}
        lineLink={settings.lineLink}
        seeAllHref="/sale"
        accent
      />

      {/* Feature row */}
      <section className="container-brand mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURE_ROW.map((f) => (
            <div key={f.title} className="product-card p-4 text-center flex flex-col items-center gap-1">
              <h3 className="text-ink font-semibold text-xs sm:text-sm">{f.title}</h3>
              <p className="text-graytext text-[11px] sm:text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to order — 1-2-3 */}
      <section className="container-brand mt-10">
        <h2 className="text-sm font-semibold text-ink mb-4">วิธีสั่งซื้อ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { n: "1", t: "เลือกสินค้า", d: "ดูสินค้าและรายละเอียดจากหน้าเว็บไซต์" },
            { n: "2", t: "แคปรูปหรือส่งชื่อสินค้า", d: "แคปรูปสินค้าที่ต้องการ หรือแจ้งชื่อสินค้า" },
            { n: "3", t: "สั่งซื้อผ่าน LINE", d: "ทัก LINE แจ้งสี ไซซ์ จำนวน แล้วรอคอนเฟิร์มยอด" },
          ].map((step) => (
            <div key={step.n} className="product-card flex flex-col items-center text-center gap-2 p-6">
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-ink text-white text-sm font-medium">
                {step.n}
              </span>
              <h3 className="text-ink font-medium text-sm">{step.t}</h3>
              <p className="text-xs text-graytext leading-relaxed">{step.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <NoticeBox text="เว็บไซต์นี้ไม่มีระบบสั่งซื้อและชำระเงินอัตโนมัติ ลูกค้าสามารถแคปรูปสินค้าที่ต้องการ แล้วส่งมาทาง LINE เพื่อให้ร้านเช็กสินค้าและคอนเฟิร์มยอดค่ะ" />
        </div>
      </section>
    </div>
  );
}

function ProductSection({ title, subtitle, products, lineLink, seeAllHref, accent = false }) {
  return (
    <section className="container-brand mt-10">
      <div className="flex items-end justify-between mb-3.5">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-ink">{title}</h2>
          <p className="text-graytext text-xs sm:text-sm mt-0.5">{subtitle}</p>
        </div>
        <Link
          href={seeAllHref}
          className={`text-xs font-medium shrink-0 min-h-touch flex items-center ${accent ? "text-salered" : "text-ink/70"} hover:underline`}
        >
          ดูทั้งหมด →
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="text-center text-graytext py-10 text-sm">ยังไม่มีสินค้าในหมวดนี้</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} lineLink={lineLink} />
          ))}
        </div>
      )}
    </section>
  );
}
