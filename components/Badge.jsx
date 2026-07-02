import { getStatusLabel, getConditionLabel } from "@/lib/constants";

// สถานะสินค้า: available / reserved / soldout / comingsoon
export function StatusBadge({ status }) {
  const styles = {
    available: "bg-ink text-white",
    reserved: "bg-white text-ink border border-bordergray",
    soldout: "bg-salered text-white",
    comingsoon: "bg-white text-ink border border-bordergray",
  };
  return (
    <span className={`text-[10px] sm:text-[11px] font-medium tracking-wide px-2 py-1 rounded-md ${styles[status] || "bg-white text-ink border border-bordergray"}`}>
      {getStatusLabel(status)}
    </span>
  );
}

// ป้าย SOLD OUT เด่นๆ สำหรับวางทับรูปสินค้า
export function SoldOutBadge({ className = "" }) {
  return (
    <span className={`text-xs font-semibold tracking-wide px-3 py-1.5 bg-ink/85 text-white rounded-md ${className}`}>
      สินค้าหมด
    </span>
  );
}

// ป้ายลดราคา (Sale) — สีแดงตาม spec (ใช้เฉพาะจุดสำคัญ: sale/discount/CTA/active tab)
export function SaleBadge({ className = "" }) {
  return (
    <span className={`badge-accent ${className}`}>
      Sale
    </span>
  );
}

// ป้ายส่วนลด % คำนวณจาก price/originalPrice ที่มีอยู่แล้ว — ไม่มีการเพิ่ม field ใหม่ในฐานข้อมูล
export function DiscountBadge({ price, originalPrice, className = "" }) {
  const p = Number(price);
  const op = Number(originalPrice);
  if (!op || !(op > p)) return null;
  const percent = Math.round(((op - p) / op) * 100);
  if (percent <= 0) return null;
  return <span className={`badge-accent ${className}`}>-{percent}%</span>;
}

// ป้ายร้านแนะนำ/สินค้าแนะนำ — มาจากฟิลด์ featured เดิมที่มีอยู่แล้ว
export function FeaturedBadge({ className = "" }) {
  return (
    <span className={`badge-neutral ${className}`}>
      แนะนำ
    </span>
  );
}

// สภาพสินค้า: New / Like New / Good / Used
export function ConditionBadge({ condition }) {
  if (!condition) return null;
  return (
    <span className="text-[10px] sm:text-[11px] font-medium tracking-wide px-2 py-1 bg-white border border-bordergray text-ink/70 rounded-md">
      {getConditionLabel(condition)}
    </span>
  );
}

export function TagBadge({ tag }) {
  return (
    <span className="text-[10px] sm:text-[11px] font-medium tracking-wide px-2 py-1 border border-bordergray text-ink/80 bg-lightgray rounded-md">
      {tag}
    </span>
  );
}

export function SizeBadge({ size }) {
  return (
    <span className="text-[10px] sm:text-[11px] font-medium px-2 py-1 border border-bordergray text-ink/80 bg-white rounded-md">
      {size}
    </span>
  );
}

export function FreeShipBadge({ className = "" }) {
  return (
    <span className={`badge-neutral ${className}`}>
      ส่งฟรี
    </span>
  );
}
