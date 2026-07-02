import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import FloatingLineButton from "@/components/FloatingLineButton";
import { getSettings } from "@/lib/db";

// ใช้ฟอนต์ Prompt ผ่าน <link> ของ Google Fonts แทน next/font/google
// เพื่อไม่ให้ขั้นตอน build ต้องพึ่งพาการเชื่อมต่ออินเทอร์เน็ตไปดึงฟอนต์ตอน build
// (ถ้าต้องการเปลี่ยนฟอนต์ แก้ลิงก์ด้านล่างและชื่อฟอนต์ใน tailwind.config.js -> theme.fontFamily.sans)

export const metadata = {
  title: "Meijiiya | เมจิยา — Minimal Fashion, Everyday Look",
  description:
    "Meijiiya ร้านเสื้อผ้าออนไลน์สไตล์มินิมอล คัดสินค้าใส่ง่าย แมตช์ง่าย ส่งฟรีทุกออเดอร์ แคปรูปแล้วสั่งซื้อผ่าน LINE ได้เลย",
};

// ค่าตั้งต้นเผื่อกรณีโหลดการตั้งค่าจาก Supabase ไม่สำเร็จ (เช่น Supabase ล่มชั่วคราว)
// เพื่อไม่ให้ทั้งเว็บพังไปด้วย — Header/Footer จะแสดงค่าง่ายๆ นี้แทนแทนที่จะ error ทั้งหน้า
const SETTINGS_FALLBACK = {
  shopNameEn: "Meijiiya",
  shopNameTh: "เมจิยา",
  tagline: "",
  lineLink: "https://lin.ee/wDd89mZ",
  socials: {},
  footerNote: "",
  shippingText: "",
  logoPath: "",
};

export default async function RootLayout({ children }) {
  let settings;
  try {
    settings = await getSettings();
  } catch (err) {
    console.error("[RootLayout] getSettings failed:", err);
    settings = SETTINGS_FALLBACK;
  }

  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-ivory">
        <Header settings={settings} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer settings={settings} />

        {/* Bottom tab bar + ปุ่ม LINE ลอย — เฉพาะมือถือ, ซ่อนอัตโนมัติในหน้า Admin/Product Detail */}
        <MobileBottomNav />
        <FloatingLineButton lineLink={settings.lineLink} />
      </body>
    </html>
  );
}
