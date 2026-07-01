import Link from "next/link";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";

// กริดสินค้าแบบเรียบง่าย ไม่มีแถบค้นหา/ตัวกรอง — ใช้กับหน้า /new-arrivals, /recommended, /sale
export default function SimpleProductGrid({ eyebrow, title, subtitle, breadcrumbLabel, products, lineLink }) {
  return (
    <div className="container-brand py-14">
      <div className="text-xs text-graytext mb-6 flex gap-2">
        <Link href="/" className="hover:text-ink">หน้าแรก</Link>
        <span>/</span>
        <span className="text-ink">{breadcrumbLabel}</span>
      </div>

      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

      {products.length === 0 ? (
        <div className="text-center py-24 text-graytext">
          <p className="text-lg">ยังไม่มีสินค้าในหมวดนี้</p>
          <p className="text-sm mt-1">แวะกลับมาดูใหม่อีกครั้งนะคะ</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} lineLink={lineLink} />
          ))}
        </div>
      )}
    </div>
  );
}
