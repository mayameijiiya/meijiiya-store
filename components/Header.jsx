"use client";

import { useState } from "react";
import Link from "next/link";
import LineButton from "./LineButton";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/how-to-order", label: "How to Order" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ settings }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-hairline">
      <div className="container-brand flex items-center justify-between h-[76px]">
        {/* โลโก้ / ชื่อร้าน — วางไว้ซ้ายบนของ header ตามที่กำหนด */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          {settings.logoPath ? (
            <img src={settings.logoPath} alt={settings.shopNameEn} className="h-9 w-auto" />
          ) : (
            <div className="flex flex-col leading-none">
              <span className="text-lg tracking-wide3 uppercase text-ink font-medium">
                {settings.shopNameEn}
              </span>
              <span className="text-[10px] tracking-wide2 text-gold mt-1">{settings.shopNameTh}</span>
            </div>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-[13px] tracking-wide2 uppercase text-ink/70 hover:text-ink transition-colors py-2"
            >
              {link.label}
              <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <LineButton lineLink={settings.lineLink} label="สั่งซื้อทาง LINE" className="text-xs py-2.5 px-5" />
        </div>

        {/* ปุ่มเมนูมือถือ */}
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="เปิดเมนู"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="1.5">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-hairline bg-ivory">
          <div className="container-brand flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm tracking-wide text-ink/80 border-b border-hairline last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3">
              <LineButton lineLink={settings.lineLink} label="สั่งซื้อทาง LINE" fullWidth />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
