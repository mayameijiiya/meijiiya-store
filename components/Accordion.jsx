"use client";

import { useState } from "react";

// Accordion ทั่วไป ใช้ได้ทั้งหน้า Product Detail (คำอธิบายสินค้า) และ Footer บนมือถือ
export default function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-bordergray last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="accordion-trigger"
        aria-expanded={open}
      >
        {title}
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 text-graytext shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="pb-4 text-sm text-ink/80 leading-relaxed">{children}</div>}
    </div>
  );
}
