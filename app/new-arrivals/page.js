import { getPublishedProducts, getSettings } from "@/lib/db";
import SimpleProductGrid from "@/components/SimpleProductGrid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "สินค้าใหม่ล่าสุด | Meijiiya",
};

export default function NewArrivalsPage() {
  const settings = getSettings();
  const products = [...getPublishedProducts()]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);

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
