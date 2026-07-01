import { getPublishedProducts, getSettings } from "@/lib/db";
import ProductsExplorer from "@/components/ProductsExplorer";
import SectionHeading from "@/components/SectionHeading";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "สินค้าทั้งหมด | Meijiiya",
};

export default async function ProductsPage({ searchParams }) {
  const settings = getSettings();

  let products = [];
  let loadError = null;
  try {
    products = await getPublishedProducts();
  } catch (err) {
    console.error("[ProductsPage] getPublishedProducts failed:", err);
    loadError = "ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
  }

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
      {loadError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl2">{loadError}</div>
      ) : (
        <ProductsExplorer
          products={products}
          lineLink={settings.lineLink}
          initialCategory={searchParams?.category || ""}
        />
      )}
    </div>
  );
}
