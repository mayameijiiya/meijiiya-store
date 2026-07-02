"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import LineButton from "./LineButton";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/how-to-order", label: "How to Order" },
  { href: "/contact", label: "Contact" },
];

// Header ของหน้าเว็บฝั่งลูกค้าเท่านั้น — ไม่แสดงบนหน้า Admin (Admin มี AdminShell เป็น chrome ของตัวเองอยู่แล้ว
// การซ่อน Header ตรงนี้เป็นแค่การไม่แสดงผล ไม่ได้แตะ logic หรือ route ของ Admin แต่อย่างใด)
export default function Header({ settings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  if (pathname?.startsWith("/admin")) return null;

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-bordergray">
      <div className="container-brand flex items-center justify-between h-16 md:h-20 gap-3 md:gap-6">
        {/* โลโก้ / ชื่อร้าน */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {settings.logoPath ? (
            <img src={settings.logoPath} alt={settings.shopNameEn} className="h-8 md:h-9 w-auto" />
          ) : (
            <div className="flex flex-col leading-none">
              <span className="text-base md:text-lg tracking-wide uppercase text-ink font-semibold">
                {settings.shopNameEn}
              </span>
              <span className="text-[9px] md:text-[10px] tracking-wide text-graytext mt-0.5">
                {settings.shopNameTh}
              </span>
            </div>
          )}
        </Link>

        {/* Search — เด่นและกดง่าย, แสดงตรงกลาง header บน desktop */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full bg-lightgray border border-transparent rounded-full pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-graytext/80 focus:outline-none focus:ring-1 focus:ring-ink focus:bg-white transition-colors"
            />
            <SearchIcon className="w-4 h-4 text-graytext absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </form>

        <nav className="hidden lg:flex items-center gap-7 shrink-0">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-ink/70 hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block shrink-0">
          <LineButton lineLink={settings.lineLink} label="สั่งซื้อทาง LINE" className="text-xs py-2.5 px-5" />
        </div>

        {/* ปุ่มเมนูมือถือ (สำหรับลิงก์ที่ไม่ได้อยู่ใน bottom navigation เช่น How to Order) */}
        <button
          className="md:hidden min-h-touch min-w-touch flex items-center justify-center -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="เปิดเมนู"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Search มือถือ — แถวเด่นแยกต่างหาก แตะง่าย ติดใต้ header เสมอ */}
      <form onSubmit={handleSearchSubmit} className="md:hidden container-brand pb-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้าที่ต้องการ..."
            className="w-full bg-lightgray border border-transparent rounded-full pl-10 pr-4 min-h-touch text-sm text-ink placeholder:text-graytext/80 focus:outline-none focus:ring-1 focus:ring-ink focus:bg-white transition-colors"
          />
          <SearchIcon className="w-4 h-4 text-graytext absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </form>

      {open && (
        <div className="md:hidden border-t border-bordergray bg-white animate-fadeIn">
          <div className="container-brand flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 min-h-touch flex items-center text-sm text-ink/80 border-b border-bordergray last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function SearchIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}
