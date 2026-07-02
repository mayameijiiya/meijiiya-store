import { getSettings } from "@/lib/db";
import LineButton from "@/components/LineButton";
import NoticeBox from "@/components/NoticeBox";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "วิธีสั่งซื้อ | Meijiiya",
};

export default async function HowToOrderPage() {
  const settings = await getSettings();

  return (
    <div className="container-brand py-6 md:py-14 max-w-3xl mx-auto">
      <div className="mb-6 md:mb-10 text-center">
        <span className="text-[11px] tracking-wide uppercase text-graytext">Easy Ordering</span>
        <h1 className="text-xl md:text-3xl font-semibold text-ink mt-1">วิธีสั่งซื้อสินค้า</h1>
      </div>

      <ol className="flex flex-col gap-2.5 mb-8">
        {settings.howToOrderSteps.map((step, i) => (
          <li key={i} className="product-card flex gap-4 items-start p-4">
            <span className="text-xl font-semibold text-ink/25 shrink-0 w-7">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-ink/85 text-sm leading-relaxed pt-0.5">{step}</p>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-8 text-center">
        <div className="bg-ink text-white rounded-xl py-4 px-3">
          <p className="text-xs md:text-sm font-medium">ส่งฟรีทุกออเดอร์</p>
        </div>
        <div className="bg-ink text-white rounded-xl py-4 px-3">
          <p className="text-xs md:text-sm font-medium">ไม่มีขั้นต่ำ</p>
        </div>
        <div className="bg-ink text-white rounded-xl py-4 px-3">
          <p className="text-xs md:text-sm font-medium">สอบถามได้ทาง LINE</p>
        </div>
      </div>

      <NoticeBox text={settings.noOnlinePaymentNotice} className="mb-8 rounded-xl" />

      <div className="text-center">
        <LineButton lineLink={settings.lineLink} label="สั่งซื้อทาง LINE" variant="primary" fullWidth className="sm:w-auto sm:px-10" />
      </div>
    </div>
  );
}
