import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/db";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  let product;
  let loadError = null;
  try {
    product = await getProductById(params.id);
  } catch (err) {
    console.error("[EditProductPage] getProductById failed:", err);
    loadError = "ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
  }

  if (loadError) {
    return (
      <div>
        <h1 className="text-xl text-ink mb-2">เกิดข้อผิดพลาด</h1>
        <p className="text-sm text-red-600">{loadError}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <h1 className="text-xl text-ink mb-2">ไม่พบสินค้านี้</h1>
        <p className="text-sm text-graytext">สินค้าอาจถูกลบไปแล้ว</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl text-ink mb-1">แก้ไขสินค้า</h1>
      <p className="text-sm text-graytext mb-8">{product.name}</p>
      <ProductForm product={product} categories={CATEGORIES} />
    </div>
  );
}
