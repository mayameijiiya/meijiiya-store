"use client";

import { usePathname } from "next/navigation";
import LineButton from "./LineButton";

// ปุ่ม LINE ลอย — เฉพาะจอมือถือ (desktop มีปุ่ม LINE อยู่ใน Header แล้ว)
// ไม่แสดงบนหน้า Admin และหน้า Product Detail (มี sticky bottom buy bar ของตัวเองอยู่แล้ว)
export default function FloatingLineButton({ lineLink }) {
  const pathname = usePathname() || "";
  const isAdmin = pathname.startsWith("/admin");
  const isProductDetail = /^\/products\/[^/]+$/.test(pathname);

  if (isAdmin || isProductDetail) return null;

  return (
    <div className="md:hidden fixed z-40 bottom-20 right-4">
      <LineButton lineLink={lineLink} variant="floating" label="สั่งซื้อทาง LINE" />
    </div>
  );
}
