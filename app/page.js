import Link from "next/link";
import { getPublishedProducts, getSettings } from "@/lib/db";
import { CATEGORY_NEW, CATEGORY_RECOMMENDED, CATEGORY_SALE } from "@/lib/constants";
import ProductCard from "@/components/ProductCard";
import LineButton from "@/components/LineButton";
import SectionHeading from "@/components/SectionHeading";
import NoticeBox from "@/components/NoticeBox";

// ข้อมูลสินค้าถูกอ่านจากไฟล์ทุกครั้งที่มีคนเข้าเว็บ เพื่อให้เห็นการเปลี่ยนแปลงจากหน้า Admin ทันที
export const dynamic = "force-dynamic";

// เมนูหมวดหมู่ด่วนบนหน้าแรก (หมวดหมู่แบบเต็มดูได้ที่หน้า /products)
const HOME_CATEGORY_MENU = ["สินค้าใหม่", "สินค้าแนะนำ", "พร้อมส่ง", "เสื้อ", "เดรส", "กระเป๋า", "Sale"];

const TRUST_ITEMS = [
  { title: "แบรนด์แท้ทุกชิ้น", desc: "คัดเฉพาะสินค้าแบรนด์แท้ ไม่ขายของปลอม" },
  { title: "ไม่ขายของปลอม", desc: "รับประกันความถูกต้องของทุกชิ้นที่วางขาย" },
  { title: "ส่งผ่านขนส่ง Shopee", desc: "ติดตามสถานะพัสดุได้ ส่งฟรีทุกออเดอร์" },
  { title: "ตรวจสอบสินค้าก่อนส่ง", desc: "เช็กสภาพและความสะอาดก่อนแพ็กทุกครั้ง" },
];

export default function HomePage() {
  const products = getPublishedProducts();
  const settings = getSettings();

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
    <div>
      {/* Hero Banner */}
      <section className="relative bg-softblack text-ivory">
        <div className="container-brand py-20 md:py-28 flex flex-col items-center text-center gap-6">
          <span className="eyebrow-gold">{settings.tagline}</span>
          <h1 className="flex flex-col gap-1">
            <span className="text-4xl md:text-6xl tracking-wide3 uppercase">{settings.shopNameEn}</span>
            <span className="text-lg md:text-xl text-white/70">{settings.shopNameTh}</span>
          </h1>
          <p className="text-white/70 max-w-xl text-sm md:text-base leading-relaxed">{settings.shortIntro}</p>
          <p className="text-white/60 text-sm max-w-lg">เลือกชิ้นที่ใช่ แคปรูป แล้วสั่งซื้อผ่าน LINE ได้เลย</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link href="/products" className="btn-outline border-white text-white hover:bg-white hover:text-ink">
              ดูสินค้าทั้งหมด
            </Link>
            <LineButton lineLink={settings.lineLink} label="สั่งซื้อผ่าน LINE" />
          </div>
        </div>
      </section>

      {/* Notice */}
      <section className="container-brand mt-8">
        <NoticeBox text="เว็บไซต์นี้ไม่มีระบบสั่งซื้อและชำระเงินอัตโนมัติ ลูกค้าสามารถแคปรูปสินค้าที่ต้องการ แล้วส่งมาทาง LINE เพื่อให้ร้านเช็กสินค้าและคอนเฟิร์มยอดค่ะ" />
      </section>

      {/* Category Menu */}
      <section className="container-brand py-14">
        <SectionHeading eyebrow="Shop by Category" title="หมวดหมู่สินค้า" />
        <div className="flex flex-wrap justify-center gap-3">
          {HOME_CATEGORY_MENU.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className="px-5 py-2.5 rounded-full border border-hairline text-ink text-sm tracking-wide hover:border-gold hover:text-gold transition-colors bg-card"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <ProductSection
        eyebrow="Just In"
        title="สินค้าใหม่ล่าสุด"
        subtitle="อัปเดตล่าสุดจากร้าน มาไวหมดไว"
        products={newArrivals}
        lineLink={settings.lineLink}
        seeAllHref="/new-arrivals"
      />

      {/* Recommended */}
      <ProductSection
        eyebrow="Curated for You"
        title="สินค้าแนะนำ"
        subtitle="คัดมาแล้วว่าน่าใส่ น่าแมตช์ ใส่ได้ทุกวัน"
        products={recommended}
        lineLink={settings.lineLink}
        seeAllHref="/recommended"
        tint
      />

      {/* Best Deals / Sale */}
      <ProductSection
        eyebrow="Best Deals"
        title="ลดราคาพิเศษ"
        subtitle="ราคาคุ้ม คุณภาพเดิม จำนวนจำกัด"
        products={saleProducts}
        lineLink={settings.lineLink}
        seeAllHref="/sale"
      />

      {/* How to order — 1-2-3 */}
      <section className="bg-beige/30 py-16 mt-8">
        <div className="container-brand">
          <SectionHeading eyebrow="Easy Ordering" title="วิธีสั่งซื้อ" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { n: "1", t: "เลือกสินค้า", d: "ดูสินค้าและรายละเอียดจากหน้าเว็บไซต์" },
              { n: "2", t: "แคปรูปหรือส่งชื่อสินค้า", d: "แคปรูปสินค้าที่ต้องการ หรือแจ้งชื่อสินค้า" },
              { n: "3", t: "สั่งซื้อผ่าน LINE", d: "ทัก LINE แจ้งสี ไซซ์ จำนวน แล้วรอคอนเฟิร์มยอด" },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center gap-3 bg-card brand-border rounded-xl2 p-8">
                <span className="w-11 h-11 flex items-center justify-center rounded-full bg-ink text-white text-sm font-medium">
                  {step.n}
                </span>
                <h3 className="text-ink font-medium">{step.t}</h3>
                <p className="text-sm text-graytext leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Link href="/how-to-order" className="btn-outline">ดูขั้นตอนแบบเต็ม</Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container-brand py-16">
        <SectionHeading eyebrow="Why Meijiiya" title="ทำไมต้อง Meijiiya" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {TRUST_ITEMS.map((f) => (
            <div key={f.title} className="text-center flex flex-col items-center gap-2 px-3">
              <span className="w-8 h-8 rounded-full border border-gold text-gold flex items-center justify-center text-xs mb-1">✓</span>
              <h3 className="text-ink font-medium text-sm md:text-base">{f.title}</h3>
              <p className="text-graytext text-xs md:text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductSection({ eyebrow, title, subtitle, products, lineLink, seeAllHref, tint = false }) {
  return (
    <section className={`container-brand py-10 ${tint ? "bg-beige/20 rounded-xl2" : ""}`}>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      {products.length === 0 ? (
        <p className="text-center text-graytext py-10">ยังไม่มีสินค้าในหมวดนี้</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} lineLink={lineLink} />
          ))}
        </div>
      )}
      <div className="flex justify-center mt-10">
        <Link href={seeAllHref} className="btn-outline">
          ดูทั้งหมด
        </Link>
      </div>
    </section>
  );
}
