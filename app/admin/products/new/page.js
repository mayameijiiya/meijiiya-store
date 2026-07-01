import ProductForm from "@/components/admin/ProductForm";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-xl text-ink mb-1">เพิ่มสินค้าใหม่</h1>
      <p className="text-sm text-graytext mb-8">กรอกรายละเอียดสินค้า อัปโหลดรูป แล้วกดเผยแพร่</p>
      <ProductForm categories={CATEGORIES} />
    </div>
  );
}
