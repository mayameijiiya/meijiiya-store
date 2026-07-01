import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LineButton from "@/components/LineButton";
import { getSettings } from "@/lib/db";

// ใช้ฟอนต์ Prompt ผ่าน <link> ของ Google Fonts แทน next/font/google
// เพื่อไม่ให้ขั้นตอน build ต้องพึ่งพาการเชื่อมต่ออินเทอร์เน็ตไปดึงฟอนต์ตอน build
// (ถ้าต้องการเปลี่ยนฟอนต์ แก้ลิงก์ด้านล่างและชื่อฟอนต์ใน tailwind.config.js -> theme.fontFamily.sans)

export const metadata = {
  title: "Meijiiya | เมจิยา — Minimal Fashion, Everyday Look",
  description:
    "Meijiiya ร้านเสื้อผ้าออนไลน์สไตล์มินิมอล คัดสินค้าใส่ง่าย แมตช์ง่าย ส่งฟรีทุกออเดอร์ แคปรูปแล้วสั่งซื้อผ่าน LINE ได้เลย",
};

export default function RootLayout({ children }) {
  const settings = getSettings();

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
      <body className="font-sans antialiased">
        <Header settings={settings} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer settings={settings} />

        {/* Floating LINE button มุมล่างขวา — แสดงทุกหน้า */}
        <div className="fixed bottom-5 right-5 z-50">
          <LineButton
            lineLink={settings.lineLink}
            variant="floating"
            label="สั่งซื้อทาง LINE"
          />
        </div>
      </body>
    </html>
  );
}
