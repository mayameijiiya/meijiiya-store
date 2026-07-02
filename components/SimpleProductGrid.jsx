import Link from "next/link";
import ProductCard from "./ProductCard";

// กริดสินค้าแบบเรียบง่าย ไม่มีแถบค้นหา/ตัวกรอง — ใช้กับหน้า /new-arrivals, /recommended, /sale
export default function SimpleProductGrid({ eyebrow, title, subtitle, breadcrumbLabel, products, lineLink }) {
  return (
    <div className="container-brand py-5 md:py-10">
      <div className="text-xs text-graytext mb-3 gap-2 hidden md:flex">
        <Link href="/" className="hover:text-ink">หน้าแรก</Link>
        <span>/</span>
        <span className="text-ink">{breadcrumbLabel}</span>
      </div>

      <div className="mb-4">
        {eyebrow && <span className="text-[11px] tracking-wide uppercase text-graytext">{eyebrow}</span>}
        <h1 className="text-lg md:text-2xl font-semibold text-ink mt-0.5">{title}</h1>
        {subtitle && <p className="text-graytext text-xs md:text-sm mt-1">{subtitle}</p>}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 text-graytext">
          <p className="text-base">ยังไม่มีสินค้าในหมวดนี้</p>
          <p className="text-sm mt-1">แวะกลับมาดูใหม่อีกครั้งนะคะ</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} lineLink={lineLink} />
          ))}
        </div>
      )}
    </div>
  );
}
