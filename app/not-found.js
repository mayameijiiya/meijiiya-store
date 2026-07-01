import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-brand py-24 text-center">
      <h1 className="text-2xl text-ink mb-3">ไม่พบหน้านี้</h1>
      <p className="text-graytext mb-8">หน้าที่คุณต้องการอาจถูกย้ายหรือไม่มีอยู่</p>
      <Link href="/" className="btn-primary">กลับหน้าแรก</Link>
    </div>
  );
}
