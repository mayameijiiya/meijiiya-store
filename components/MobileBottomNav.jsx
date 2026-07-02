"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

// แท็บล่างสไตล์แอปช้อปปิ้งมือถือ — ไม่แสดงบนหน้า Admin และไม่แสดงบนหน้า Product Detail
// (หน้า Product Detail มี sticky bottom buy bar ของตัวเองอยู่แล้ว การแสดงซ้อนกันจะรกเกินไป)
const TABS = [
  { href: "/", label: "หน้าแรก", icon: HomeIcon },
  { href: "/products", label: "สินค้า", icon: GridIcon },
  { href: "/new-arrivals", label: "มาใหม่", icon: SparkleIcon },
  { href: "/sale", label: "ลดราคา", icon: TagIcon },
  { href: "/contact", label: "ติดต่อ", icon: ChatIcon },
];

export default function MobileBottomNav() {
  const pathname = usePathname() || "";
  const isAdmin = pathname.startsWith("/admin");
  const isProductDetail = /^\/products\/[^/]+$/.test(pathname);

  if (isAdmin || isProductDetail) return null;

  return (
    <>
      {/* ตัวเว้นระยะ กันเนื้อหา/Footer โดนแท็บบาร์บังตอนอยู่ล่างสุดของหน้า */}
      <div className="h-16 md:hidden" aria-hidden="true" />
      <nav className="mobile-tab-bar" role="navigation" aria-label="เมนูหลัก">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`mobile-tab-item ${active ? "mobile-tab-item-active" : ""}`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-salered" : "text-ink/50"}`} />
              <span className={active ? "text-salered" : ""}>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function HomeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
  );
}

function SparkleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TagIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M20 12.5 12.5 20a1.5 1.5 0 0 1-2.1 0l-6.4-6.4a1.5 1.5 0 0 1 0-2.1L11.5 4H18a2 2 0 0 1 2 2v6.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="9" r="1.3" />
    </svg>
  );
}

function ChatIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M4 4.5h16v11H8.5L4 19V4.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
