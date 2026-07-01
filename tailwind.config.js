/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ==== Meijiiya Brand Palette (Minimal Luxury Fashion) — แก้สีแบรนด์ได้ที่นี่ ====
        ivory: "#F7F3EC", // main background
        "soft-white": "#FAFAF7",
        beige: "#EFE8DA", // soft secondary panels
        ink: "#1C1C1C", // ข้อความหลัก / ปุ่มหลัก
        softblack: "#111111", // พื้นหลังทึบ เช่น footer, hero
        card: "#FFFFFF", // การ์ดสินค้า / กล่องเนื้อหา
        hairline: "#E5DED3", // เส้นขอบบาง
        gold: "#B89B5E", // accent สีทอง ใช้แต่น้อยเพื่อความหรู
        graytext: "#7A746B", // ข้อความรอง / muted
        line: "#06C755", // LINE brand green
        salered: "#E5484D", // ป้ายลดราคา / สินค้าหมด
      },
      fontFamily: {
        // ฟอนต์หลักของแบรนด์ Meijiiya — โหลดผ่าน <link> ใน app/layout.js
        sans: ["Prompt", "sans-serif"],
      },
      letterSpacing: {
        wide2: "0.06em",
        wide3: "0.12em",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(17,17,17,0.06)",
        gold: "0 6px 24px rgba(184,155,94,0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
