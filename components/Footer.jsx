import Link from "next/link";
import LineButton from "./LineButton";

const SOCIAL_LABELS = {
  tiktok: "TikTok",
  facebook: "Facebook",
  instagram: "Instagram",
  shopee: "Shopee",
  lemon8: "Lemon8",
  youtube: "YouTube",
};

export default function Footer({ settings }) {
  const socials = settings.socials || {};

  return (
    <footer className="bg-ink text-ivory mt-24">
      <div className="container-brand py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2 flex flex-col gap-3">
          <span className="text-xl tracking-wide3 uppercase">{settings.shopNameEn}</span>
          <span className="text-sm text-white/60">{settings.shopNameTh} — {settings.tagline}</span>
          <p className="text-sm text-white/70 max-w-sm mt-2 leading-relaxed">{settings.footerNote}</p>
          <div className="mt-3">
            <LineButton lineLink={settings.lineLink} label="สั่งซื้อทาง LINE" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-wide2 uppercase text-white/50 mb-1">เมนู</span>
          <Link href="/products" className="text-sm text-white/80 hover:text-white">Products</Link>
          <Link href="/how-to-order" className="text-sm text-white/80 hover:text-white">How to Order</Link>
          <Link href="/contact" className="text-sm text-white/80 hover:text-white">Contact</Link>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-wide2 uppercase text-white/50 mb-1">ติดตามร้าน</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {Object.entries(SOCIAL_LABELS).map(([key, label]) => (
              <a
                key={key}
                href={socials[key] || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/80 hover:text-white underline underline-offset-4 decoration-white/30"
              >
                {label}
              </a>
            ))}
          </div>
          {socials.email && (
            <a href={`mailto:${socials.email}`} className="text-sm text-white/60 mt-2">
              {socials.email}
            </a>
          )}
          {socials.phone && <span className="text-sm text-white/60">{socials.phone}</span>}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-brand py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <span>© {new Date().getFullYear()} {settings.shopNameEn} / {settings.shopNameTh}. All rights reserved.</span>
          <span>{settings.shippingText}</span>
        </div>
      </div>
    </footer>
  );
}
