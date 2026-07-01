import { getStatusLabel, getConditionLabel } from "@/lib/constants";

// สถานะสินค้า: available / reserved / soldout / comingsoon
export function StatusBadge({ status }) {
  const styles = {
    available: "bg-ink text-white",
    reserved: "bg-gold text-white",
    soldout: "bg-salered text-white",
    comingsoon: "bg-beige text-ink border border-hairline",
  };
  return (
    <span className={`text-[11px] tracking-wide2 uppercase px-2.5 py-1 rounded-sm ${styles[status] || "bg-beige text-ink"}`}>
      {getStatusLabel(status)}
    </span>
  );
}

// ป้าย SOLD OUT เด่นๆ สำหรับวางทับรูปสินค้า
export function SoldOutBadge({ className = "" }) {
  return (
    <span className={`text-xs tracking-wide2 uppercase px-3 py-1.5 bg-salered text-white font-medium rounded-sm ${className}`}>
      Sold Out
    </span>
  );
}

// ป้ายลดราคา
export function SaleBadge({ className = "" }) {
  return (
    <span className={`text-[11px] tracking-wide2 uppercase px-2.5 py-1 bg-salered text-white rounded-sm ${className}`}>
      Sale
    </span>
  );
}

// สภาพสินค้า: New / Like New / Good / Used
export function ConditionBadge({ condition }) {
  if (!condition) return null;
  return (
    <span className="text-[11px] tracking-wide uppercase px-2.5 py-1 bg-white border border-hairline text-ink/70 rounded-sm">
      {getConditionLabel(condition)}
    </span>
  );
}

export function TagBadge({ tag }) {
  return (
    <span className="text-[11px] tracking-wide2 uppercase px-2.5 py-1 border border-ink/20 text-ink bg-white/70 rounded-sm">
      {tag}
    </span>
  );
}

export function SizeBadge({ size }) {
  return (
    <span className="text-[11px] tracking-wide px-2 py-0.5 border border-hairline text-ink/80 bg-ivory rounded-sm">
      {size}
    </span>
  );
}

export function FreeShipBadge({ className = "" }) {
  return (
    <span className={`text-[11px] tracking-wide2 uppercase px-2.5 py-1 bg-ivory border border-ink/15 text-ink rounded-sm ${className}`}>
      ส่งฟรี
    </span>
  );
}
