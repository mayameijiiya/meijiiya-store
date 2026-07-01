import { getPublishedProducts, getSettings } from "@/lib/db";
import { CATEGORY_RECOMMENDED } from "@/lib/constants";
import SimpleProductGrid from "@/components/SimpleProductGrid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "สินค้าแนะนำ | Meijiiya",
};

export default function RecommendedPage() {
  const settings = getSettings();
  const products = getPublishedProducts().filter(
    (p) => p.featured || p.categories?.includes(CATEGORY_RECOMMENDED)
  );

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
