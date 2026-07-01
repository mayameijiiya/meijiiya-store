import { getPublishedProducts, getSettings } from "@/lib/db";
import ProductsExplorer from "@/components/ProductsExplorer";
import SectionHeading from "@/components/SectionHeading";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "สินค้าทั้งหมด | Meijiiya",
};

export default function ProductsPage({ searchParams }) {
  const products = getPublishedProducts();
  const settings = getSettings();

  return (
    <div className="container-brand py-14">
      <div className="text-xs text-graytext mb-6">
        <span>หน้าแรก</span> <span className="mx-1">/</span> <span className="text-ink">สินค้าทั้งหมด</span>
      </div>
      <SectionHeading
        eyebrow="All Products"
        title="สินค้าทั้งหมด"
        subtitle="ชอบตัวไหน แคปไว้แล้วทัก LINE ได้เลยค่ะ"
      />
      <ProductsExplorer
        products={products}
        lineLink={settings.lineLink}
        initialCategory={searchParams?.category || ""}
      />
    </div>
  );
}
