import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/db";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default function EditProductPage({ params }) {
  const product = getProductById(params.id);

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
