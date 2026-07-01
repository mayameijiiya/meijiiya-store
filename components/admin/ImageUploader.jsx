"use client";

import { useRef, useState } from "react";

export default function ImageUploader({ images = [], onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");

    const newUrls = [];
    let lastError = "";
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.url) {
          newUrls.push(data.url);
        } else {
          lastError = data.error || "อัปโหลดรูปไม่สำเร็จ";
        }
      } catch (err) {
        lastError = "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่ (ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต)";
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }
    if (lastError) setError(lastError);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(idx) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div key={img + i} className="relative aspect-square bg-ivory brand-border overflow-hidden group">
            <img src={img} alt={`รูปสินค้า ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-ink/80 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="ลบรูปนี้"
            >
              ✕
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-ink/80 text-white text-[10px] px-1.5 py-0.5">
                รูปหลัก
              </span>
            )}
          </div>
        ))}

        <label className="aspect-square flex flex-col items-center justify-center gap-1 border border-dashed border-ink/30 cursor-pointer text-graytext hover:border-ink/60 hover:text-ink transition-colors text-xs text-center px-2">
          {uploading ? "กำลังอัปโหลด..." : "+ เพิ่มรูปสินค้า"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-[11px] text-graytext">
        อัปโหลดได้หลายรูป รูปแรกจะใช้เป็นรูปหลักของสินค้า (ลากดูตัวอย่างก่อนบันทึกได้)
      </p>
    </div>
  );
}
