import { getPublishedProducts, getSettings } from "@/lib/db";
import { CATEGORY_RECOMMENDED } from "@/lib/constants";
import SimpleProductGrid from "@/components/SimpleProductGrid";

// ดึงข้อมูลสินค้าจาก Supabase ตรงๆ ทุกครั้ง ไม่ cache เด็ดขาด (ดู lib/supabase.js)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "สินค้าแนะนำ | Meijiiya",
};

export default async function RecommendedPage() {
  const settings = getSettings();

  let products = [];
  try {
    const all = await getPublishedProducts();
    products = all.filter((p) => p.featured || p.categories?.includes(CATEGORY_RECOMMENDED));
  } catch (err) {
    console.error("[RecommendedPage] getPublishedProducts failed:", err);
  }

  return (
    <SimpleProductGrid
      eyebrow="Curated for You"
      title="สินค้าแนะนำ"
      subtitle="คัดมาแล้วว่าน่าใส่ น่าแมตช์ ใส่ได้ทุกวัน"
      breadcrumbLabel="สินค้าแนะนำ"
      products={products}
      lineLink={settings.lineLink}
    />
  );
}
