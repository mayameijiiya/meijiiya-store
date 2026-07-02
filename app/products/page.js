import { getPublishedProducts, getSettings } from "@/lib/db";
import ProductsExplorer from "@/components/ProductsExplorer";

// ดึงข้อมูลสินค้าจาก Supabase ตรงๆ ทุกครั้ง ไม่ cache เด็ดขาด (ดู lib/supabase.js)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "สินค้าทั้งหมด | Meijiiya",
};

export default async function ProductsPage({ searchParams }) {
  const settings = await getSettings();

  let products = [];
  let loadError = null;
  try {
    products = await getPublishedProducts();
  } catch (err) {
    console.error("[ProductsPage] getPublishedProducts failed:", err);
    loadError = "ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
  }

  return (
    <div className="container-brand py-5 md:py-10">
      <div className="text-xs text-graytext mb-3 hidden md:block">
        <span>หน้าแรก</span> <span className="mx-1">/</span> <span className="text-ink">สินค้าทั้งหมด</span>
      </div>
      <div className="mb-4">
        <h1 className="text-lg md:text-2xl font-semibold text-ink">สินค้าทั้งหมด</h1>
        <p className="text-graytext text-xs md:text-sm mt-1">ชอบตัวไหน แคปไว้แล้วทัก LINE ได้เลยค่ะ</p>
      </div>
      {loadError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{loadError}</div>
      ) : (
        <ProductsExplorer
          products={products}
          lineLink={settings.lineLink}
          initialCategory={searchParams?.category || ""}
          initialSearch={searchParams?.search || ""}
        />
      )}
    </div>
  );
}
