import { getPublishedProducts, getSettings } from "@/lib/db";
import { CATEGORY_SALE } from "@/lib/constants";
import SimpleProductGrid from "@/components/SimpleProductGrid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ลดราคาพิเศษ | Meijiiya",
};

export default function SalePage() {
  const settings = getSettings();
  const products = getPublishedProducts().filter(
    (p) => (p.originalPrice && Number(p.originalPrice) > Number(p.price)) || p.categories?.includes(CATEGORY_SALE)
  );

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
