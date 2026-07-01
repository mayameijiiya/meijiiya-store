import { getPublishedProducts, getSettings } from "@/lib/db";
import { CATEGORY_SALE } from "@/lib/constants";
import SimpleProductGrid from "@/components/SimpleProductGrid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ลดราคาพิเศษ | Meijiiya",
};

export default async function SalePage() {
  const settings = getSettings();

  let products = [];
  try {
    const all = await getPublishedProducts();
    products = all.filter(
      (p) => (p.originalPrice && Number(p.originalPrice) > Number(p.price)) || p.categories?.includes(CATEGORY_SALE)
    );
  } catch (err) {
    console.error("[SalePage] getPublishedProducts failed:", err);
  }

  return (
    <SimpleProductGrid
      eyebrow="Best Deals"
      title="ลดราคาพิเศษ"
      subtitle="ราคาคุ้ม คุณภาพเดิม จำนวนจำกัด"
      breadcrumbLabel="ลดราคาพิเศษ"
      products={products}
      lineLink={settings.lineLink}
    />
  );
}
