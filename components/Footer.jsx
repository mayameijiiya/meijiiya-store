"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import LineButton from "./LineButton";
import Accordion from "./Accordion";

const SOCIAL_LABELS = {
  tiktok: "TikTok",
  facebook: "Facebook",
  instagram: "Instagram",
  shopee: "Shopee",
  lemon8: "Lemon8",
  youtube: "YouTube",
};

// ตรวจจับค่า placeholder ตัวอย่าง (เช่น yourusername, yourbrand@email.com, 08X-XXX-XXXX, "#")
// ที่ยังไม่ได้แก้เป็นข้อมูลจริง — ไม่แสดงผลค่าเหล่านี้เด็ดขาด เพื่อไม่ให้ลูกค้าเห็นข้อมูลปลอม
function isPlaceholder(value) {
  if (!value) return true;
  const v = String(value).trim().toLowerCase();
  if (!v || v === "#") return true;
  return v.includes("your") || v.includes("xxx");
}

export default function Footer({ settings }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const socials = settings.socials || {};
  const realSocials = Object.entries(SOCIAL_LABELS).filter(([key]) => !isPlaceholder(socials[key]));
  const realEmail = !isPlaceholder(socials.email) ? socials.email : null;
  const realPhone = !isPlaceholder(socials.phone) ? socials.phone : null;
  const hasAnyContactInfo = realSocials.length > 0 || realEmail || realPhone;

  const menuSection = (
    <div className="flex flex-col gap-2.5">
      <Link href="/products" className="text-sm text-white/80 hover:text-white min-h-touch flex items-center">Products</Link>
      <Link href="/how-to-order" className="text-sm text-white/80 hover:text-white min-h-touch flex items-center">How to Order</Link>
      <Link href="/contact" className="text-sm text-white/80 hover:text-white min-h-touch flex items-center">Contact</Link>
    </div>
  );

  const followSection = (
    <div className="flex flex-col gap-3">
      {hasAnyContactInfo ? (
        <>
          {realSocials.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {realSocials.map(([key, label]) => (
                <a
                  key={key}
                  href={socials[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/80 hover:text-white underline underline-offset-4 decoration-white/30"
                >
                  {label}
                </a>
              ))}
            </div>
          )}
          {realEmail && (
            <a href={`mailto:${realEmail}`} className="text-sm text-white/60">
              {realEmail}
            </a>
          )}
          {realPhone && <span className="text-sm text-white/60">{realPhone}</span>}
        </>
      ) : (
        <p className="text-sm text-white/60">ติดต่อร้านผ่าน LINE ได้เลยค่ะ ตอบแชทไว</p>
      )}
    </div>
  );

  return (
    <footer className="bg-ink text-ivory mt-14 md:mt-24">
      {/* Desktop: stack แบบ grid ปกติ */}
      <div className="container-brand py-10 md:py-14 hidden md:grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2 flex flex-col gap-3">
          <span className="text-xl font-semibold tracking-tight uppercase">{settings.shopNameEn}</span>
          <span className="text-sm text-white/60">{settings.shopNameTh} — {settings.tagline}</span>
          <p className="text-sm text-white/70 max-w-sm mt-2 leading-relaxed">{settings.footerNote}</p>
          <div className="mt-3">
            <LineButton lineLink={settings.lineLink} label="สั่งซื้อทาง LINE" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-wide uppercase text-white/50 mb-1">เมนู</span>
          {menuSection}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-wide uppercase text-white/50 mb-1">ติดตามร้าน</span>
          {followSection}
        </div>
      </div>

      {/* Mobile: accordion เรียบง่าย ไม่รก */}
      <div className="container-brand py-6 md:hidden flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold tracking-tight uppercase">{settings.shopNameEn}</span>
          <span className="text-xs text-white/60">{settings.shopNameTh} — {settings.tagline}</span>
          <LineButton lineLink={settings.lineLink} label="สั่งซื้อทาง LINE" fullWidth className="mt-2" />
        </div>

        <div className="border-t border-white/10">
          <MobileFooterAccordion title="เมนู">{menuSection}</MobileFooterAccordion>
          <MobileFooterAccordion title="ติดตามร้าน">{followSection}</MobileFooterAccordion>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-brand py-4 md:py-5 flex flex-col md:flex-row items-center justify-between gap-1.5 text-[11px] md:text-xs text-white/50 text-center md:text-left">
          <span>© {new Date().getFullYear()} {settings.shopNameEn} / {settings.shopNameTh}</span>
          <span>{settings.shippingText}</span>
        </div>
      </div>
    </footer>
  );
}

// ครอบ Accordion เดิม (ที่ออกแบบไว้เป็นโทนพื้นหลังขาว/ข้อความสีดำ) ให้ใช้บนพื้นหลังสีดำของ Footer ได้
function MobileFooterAccordion({ title, children }) {
  return (
    <div className="[&_.accordion-trigger]:text-white [&_.border-bordergray]:border-white/10 border-b border-white/10 last:border-b-0">
      <Accordion title={title}>
        <div className="text-white/80">{children}</div>
      </Accordion>
    </div>
  );
}
