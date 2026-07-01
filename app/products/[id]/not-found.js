import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="container-brand py-24 text-center">
      <h1 className="text-2xl text-ink mb-3">ไม่พบสินค้านี้</h1>
      <p className="text-graytext mb-8">สินค้าอาจถูกลบหรือไม่เผยแพร่แล้ว</p>
      <Link href="/products" className="btn-primary">กลับไปดูสินค้าทั้งหมด</Link>
    </div>
  );
}
