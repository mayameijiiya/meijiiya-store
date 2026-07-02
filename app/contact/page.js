import { getSettings } from "@/lib/db";
import LineButton from "@/components/LineButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

// ตรวจจับค่า placeholder ตัวอย่าง (เช่น yourusername, yourbrand@email.com) ที่ยังไม่ได้แก้เป็นข้อมูลจริง
function isPlaceholder(value) {
  if (!value) return true;
  const v = String(value).trim().toLowerCase();
  if (!v || v === "#") return true;
  return v.includes("your") || v.includes("xxx");
}

export default async function ContactPage() {
  const settings = await getSettings();
  const socials = settings.socials || {};
  const realSocialCards = SOCIAL_CARDS.filter((s) => !isPlaceholder(socials[s.key]));
  const realEmail = !isPlaceholder(socials.email) ? socials.email : null;
  const realPhone = !isPlaceholder(socials.phone) ? socials.phone : null;

  return (
    <div className="container-brand py-6 md:py-14 max-w-4xl mx-auto">
      <div className="mb-6 md:mb-10 text-center">
        <span className="text-[11px] tracking-wide uppercase text-graytext">Get in Touch</span>
        <h1 className="text-xl md:text-3xl font-semibold text-ink mt-1">ติดต่อ Meijiiya</h1>
        <p className="text-ink/70 max-w-xl mx-auto mt-3 text-sm leading-relaxed">
          ชอบสินค้าชิ้นไหน แคปรูปแล้วส่งมาทาง LINE ได้เลยค่ะ ร้านจะช่วยเช็กสินค้า สี ไซซ์ และคอนเฟิร์มยอดให้ในแชท
        </p>
      </div>

      {/* ช่องทางสั่งซื้อหลัก */}
      <div className="product-card bg-ink text-white p-6 md:p-8 flex flex-col items-center text-center gap-3 mb-4">
        <span className="text-[11px] tracking-wide uppercase text-white/50">ช่องทางสั่งซื้อหลัก</span>
        <h2 className="text-lg md:text-xl font-medium">LINE Official Account</h2>
        <LineButton lineLink={settings.lineLink} label="สั่งซื้อทาง LINE" fullWidth className="md:w-auto md:px-10" />
      </div>

      <p className="text-center text-xs text-graytext mb-10">
        สอบถามสี/ไซซ์เพิ่มเติมได้ทาง LINE — ตอบแชทไว
      </p>

      {/* ช่องทางติดตามอื่นๆ — แสดงเฉพาะช่องทางที่มีลิงก์จริงเท่านั้น */}
      {realSocialCards.length > 0 && (
        <>
          <h3 className="text-center text-xs tracking-wide uppercase text-graytext mb-4">
            ติดตามร้าน Meijiiya ได้ที่
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
            {realSocialCards.map((s) => (
              <a
                key={s.key}
                href={socials[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="product-card flex items-center justify-center h-16 text-ink text-sm font-medium"
              >
                {s.label}
              </a>
            ))}
          </div>
        </>
      )}

      {(realEmail || realPhone) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {realEmail && (
            <a href={`mailto:${realEmail}`} className="product-card p-5 flex flex-col gap-1">
              <span className="text-xs text-graytext">Email</span>
              <span className="text-ink text-sm">{realEmail}</span>
            </a>
          )}
          {realPhone && (
            <a href={`tel:${realPhone}`} className="product-card p-5 flex flex-col gap-1">
              <span className="text-xs text-graytext">Call</span>
              <span className="text-ink text-sm">{realPhone}</span>
            </a>
          )}
        </div>
      )}

      {realSocialCards.length === 0 && !realEmail && !realPhone && (
        <p className="text-center text-graytext text-sm">ติดต่อร้านผ่าน LINE ได้เลยค่ะ ตอบแชทไว</p>
      )}
    </div>
  );
}
