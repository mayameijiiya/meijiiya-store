import { getSettings } from "@/lib/db";
import LineButton from "@/components/LineButton";
import SectionHeading from "@/components/SectionHeading";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ติดต่อร้าน | Meijiiya",
};

// การ์ดช่องทางติดตามร้าน (ไม่รวม LINE ซึ่งเด่นแยกไว้ด้านบนแล้ว)
// แก้ลิงก์แต่ละแพลตฟอร์มได้ที่ data/settings.json หรือหน้า Admin > ตั้งค่าร้าน
const SOCIAL_CARDS = [
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "shopee", label: "Shopee" },
  { key: "lemon8", label: "Lemon8" },
  { key: "youtube", label: "YouTube" },
];

export default function ContactPage() {
  const settings = getSettings();
  const socials = settings.socials || {};

  return (
    <div className="container-brand py-14 max-w-4xl mx-auto">
      <SectionHeading eyebrow="Get in Touch" title="ติดต่อ Meijiiya" />

      <p className="text-center text-ink/80 max-w-xl mx-auto mb-10 leading-relaxed">
        ชอบสินค้าชิ้นไหน แคปรูปแล้วส่งมาทาง LINE ได้เลยค่ะ ร้านจะช่วยเช็กสินค้า สี ไซซ์ และคอนเฟิร์มยอดให้ในแชท
      </p>

      {/* ช่องทางสั่งซื้อหลัก */}
      <div className="bg-ink text-white p-8 flex flex-col items-center text-center gap-4 mb-4">
        <span className="text-xs tracking-wide3 uppercase text-white/50">ช่องทางสั่งซื้อหลัก</span>
        <h2 className="text-xl">LINE Official Account</h2>
        <p className="text-white/60 text-sm">{settings.lineLink}</p>
        <LineButton lineLink={settings.lineLink} label="สั่งซื้อทาง LINE" />
      </div>

      <p className="text-center text-xs text-graytext mb-12">
        สอบถามสี/ไซซ์เพิ่มเติมได้ทาง LINE — ตอบแชทไว
      </p>

      {/* ช่องทางติดตามอื่นๆ */}
      <h3 className="text-center text-sm tracking-wide2 uppercase text-graytext mb-6">
        ติดตามร้าน Meijiiya ได้ที่
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        {SOCIAL_CARDS.map((s) => (
          <a
            key={s.key}
            href={socials[s.key] || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="brand-border bg-white hover:shadow-soft transition-shadow flex items-center justify-center h-20 text-ink text-sm tracking-wide"
          >
            {s.label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {socials.email && (
          <a href={`mailto:${socials.email}`} className="brand-border bg-white p-5 flex flex-col gap-1">
            <span className="text-xs text-graytext">Email</span>
            <span className="text-ink text-sm">{socials.email}</span>
          </a>
        )}
        {socials.phone && (
          <a href={`tel:${socials.phone}`} className="brand-border bg-white p-5 flex flex-col gap-1">
            <span className="text-xs text-graytext">Call</span>
            <span className="text-ink text-sm">{socials.phone}</span>
          </a>
        )}
      </div>
    </div>
  );
}
