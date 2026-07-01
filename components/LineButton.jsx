"use client";

import { useState } from "react";
import { copyMessageAndOpenLine } from "@/lib/line";

/**
 * ปุ่ม LINE ของร้าน Meijiiya
 * ใช้ได้ทั้งแบบลิงก์ตรงๆ (message ไม่ระบุ) หรือแบบคัดลอกข้อความสั่งซื้อก่อนเปิด LINE (ระบุ message)
 *
 * props:
 * - lineLink: ลิงก์ LINE OA ของร้าน (ค่าเริ่มต้นมาจาก settings)
 * - label: ข้อความบนปุ่ม เช่น "สั่งซื้อทาง LINE"
 * - message: ถ้าระบุ จะคัดลอกข้อความนี้ไปไว้ใน clipboard ก่อนเปิด LINE ให้ลูกค้าวางในแชทได้เลย
 * - variant: "primary" | "outline" | "line" | "floating"
 * - fullWidth: boolean
 * - disabled: ถ้า true จะแสดงเป็นปุ่มปิดใช้งาน (เช่น สินค้าหมด) กดไม่ได้ ไม่เปิดลิงก์ LINE
 */
export default function LineButton({
  lineLink = "https://lin.ee/wDd89mZ",
  label = "สั่งซื้อทาง LINE",
  message = "",
  variant = "line",
  fullWidth = false,
  disabled = false,
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = async (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (!message) return; // ปล่อยให้ <a> เปิดลิงก์ปกติ
    e.preventDefault();
    await copyMessageAndOpenLine(message, lineLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const base =
    variant === "primary"
      ? "btn-primary"
      : variant === "outline"
      ? "btn-outline"
      : variant === "floating"
      ? "flex items-center justify-center w-14 h-14 rounded-full bg-line text-white shadow-lg hover:brightness-105 transition-all"
      : "btn-line";

  if (disabled) {
    return (
      <span
        className={`${base} ${fullWidth ? "w-full" : ""} ${className} !bg-graytext/30 !text-graytext !border-graytext/30 cursor-not-allowed pointer-events-none select-none`}
        aria-disabled="true"
      >
        {variant !== "floating" && <LineIcon className="w-4 h-4 shrink-0" />}
        สินค้าหมดแล้ว
      </span>
    );
  }

  return (
    <a
      href={lineLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${base} ${fullWidth ? "w-full" : ""} ${className}`}
      aria-label={label}
    >
      {variant !== "floating" && (
        <LineIcon className="w-4 h-4 shrink-0" />
      )}
      {variant === "floating" ? <LineIcon className="w-7 h-7" /> : (copied ? "คัดลอกข้อความแล้ว ✓" : label)}
    </a>
  );
}

export function LineIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 5.71 2 10.28c0 4.08 3.55 7.5 8.34 8.15.32.07.77.22.88.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1 .87.55 1.08-.46 5.8-3.42 7.92-5.85C21.4 13.9 22 12.16 22 10.28 22 5.71 17.52 2 12 2zm-3.6 10.9H6.9a.4.4 0 0 1-.4-.4V8.4c0-.22.18-.4.4-.4h.5c.22 0 .4.18.4.4v3.4h1.6c.22 0 .4.18.4.4v.3a.4.4 0 0 1-.4.4zm2.1 0h-.5a.4.4 0 0 1-.4-.4V8.4c0-.22.18-.4.4-.4h.5c.22 0 .4.18.4.4v4.1a.4.4 0 0 1-.4.4zm5.1 0h-.5a.4.4 0 0 1-.33-.17l-1.87-2.53v2.3c0 .22-.18.4-.4.4h-.5a.4.4 0 0 1-.4-.4V8.4c0-.22.18-.4.4-.4h.5c.13 0 .25.06.33.17l1.87 2.53V8.4c0-.22.18-.4.4-.4h.5c.22 0 .4.18.4.4v4.1a.4.4 0 0 1-.4.4zm3.9-3.4h-1.6v.6h1.6c.22 0 .4.18.4.4v.3c0 .22-.18.4-.4.4h-1.6v.6h1.6c.22 0 .4.18.4.4v.3a.4.4 0 0 1-.4.4h-2.5a.4.4 0 0 1-.4-.4V8.4c0-.22.18-.4.4-.4h2.5c.22 0 .4.18.4.4v.3a.4.4 0 0 1-.4.4z" />
    </svg>
  );
}
