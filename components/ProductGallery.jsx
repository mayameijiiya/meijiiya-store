"use client";

import { useState } from "react";

export default function ProductGallery({ images = [], name }) {
  const list = images.length > 0 ? images : ["/uploads/sample/placeholder.svg"];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[4/5] w-full bg-ivory brand-border overflow-hidden">
        <img src={list[active]} alt={name} className="w-full h-full object-cover" />
      </div>
      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {list.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`aspect-square bg-ivory overflow-hidden border ${
                active === i ? "border-ink" : "border-ink/10"
              }`}
            >
              <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
