import { getSettings } from "@/lib/db";
import LineButton from "@/components/LineButton";
import SectionHeading from "@/components/SectionHeading";
import NoticeBox from "@/components/NoticeBox";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "วิธีสั่งซื้อ | Meijiiya",
};

export default function HowToOrderPage() {
  const settings = getSettings();

  return (
    <div className="container-brand py-14 max-w-3xl mx-auto">
      <SectionHeading eyebrow="Easy Ordering" title="วิธีสั่งซื้อสินค้า" />

      <ol className="flex flex-col gap-4 mb-10">
        {settings.howToOrderSteps.map((step, i) => (
          <li key={i} className="flex gap-4 items-start bg-white brand-border p-5">
            <span className="text-2xl font-light text-ink/30 shrink-0 w-8">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-ink/85 leading-relaxed pt-1">{step}</p>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-center">
        <div className="bg-ink text-white py-5 px-3">
          <p className="text-sm tracking-wide2 uppercase">ส่งฟรีทุกออเดอร์</p>
        </div>
        <div className="bg-ink text-white py-5 px-3">
          <p className="text-sm tracking-wide2 uppercase">ไม่มีขั้นต่ำ</p>
        </div>
        <div className="bg-ink text-white py-5 px-3">
          <p className="text-sm tracking-wide2 uppercase">สอบถามได้ทาง LINE</p>
        </div>
      </div>

      <NoticeBox
        text={settings.noOnlinePaymentNotice}
        className="mb-10"
      />

      <div className="text-center">
        <LineButton lineLink={settings.lineLink} label="สั่งซื้อทาง LINE" variant="primary" />
      </div>
    </div>
  );
}
