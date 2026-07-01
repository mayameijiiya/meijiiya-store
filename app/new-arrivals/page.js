import { getPublishedProducts, getSettings } from "@/lib/db";
import SimpleProductGrid from "@/components/SimpleProductGrid";

// ดึงข้อมูลสินค้าจาก Supabase ตรงๆ ทุกครั้ง ไม่ cache เด็ดขาด (ดู lib/supabase.js)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "สินค้าใหม่ล่าสุด | Meijiiya",
};

export default async function NewArrivalsPage() {
  const settings = getSettings();

  let products = [];
  try {
    const all = await getPublishedProducts();
    products = [...all].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 8);
  } catch (err) {
    console.error("[NewArrivalsPage] getPublishedProducts failed:", err);
  }

  return (
    <SimpleProductGrid
      eyebrow="Just In"
      title="สินค้าใหม่ล่าสุด"
      subtitle="อัปเดตล่าสุดจากร้าน มาไวหมดไว"
      breadcrumbLabel="สินค้าใหม่ล่าสุด"
      products={products}
      lineLink={settings.lineLink}
    />
  );
}
