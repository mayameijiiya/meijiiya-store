"use client";

import { useState } from "react";

// Gallery รูปสินค้า — รูปหลักอัตราส่วน 1:1 ไม่บีบไม่แตก (object-cover) + แถบ thumbnail เลื่อนได้
export default function ProductGallery({ images = [], name }) {
  const list = images.length > 0 ? images : ["/uploads/sample/placeholder.svg"];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="aspect-square w-full bg-lightgray rounded-2xl overflow-hidden">
        <img src={list[active]} alt={name} className="w-full h-full object-cover" />
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scroll-hide">
          {list.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                active === i ? "border-ink" : "border-transparent"
              }`}
              aria-label={`ดูรูปที่ ${i + 1}`}
            >
              <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
