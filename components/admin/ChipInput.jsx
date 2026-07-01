"use client";

import { useState } from "react";

// ช่องกรอกแบบ chip เช่น สี, ไซซ์เพิ่มเติม — พิมพ์แล้วกด Enter หรือ "เพิ่ม" เพื่อเพิ่มค่า
export default function ChipInput({ values = [], onChange, placeholder = "พิมพ์แล้วกด Enter" }) {
  const [text, setText] = useState("");

  function addChip() {
    const v = text.trim();
    if (v && !values.includes(v)) {
      onChange([...values, v]);
    }
    setText("");
  }

  function removeChip(v) {
    onChange(values.filter((x) => x !== v));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1.5 bg-beige/50 border border-ink/10 px-3 py-1.5 text-xs text-ink">
            {v}
            <button type="button" onClick={() => removeChip(v)} className="text-ink/50 hover:text-ink">
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addChip();
            }
          }}
          placeholder={placeholder}
          className="flex-1 brand-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
        />
        <button type="button" onClick={addChip} className="btn-outline text-xs px-4">
          เพิ่ม
        </button>
      </div>
    </div>
  );
}
