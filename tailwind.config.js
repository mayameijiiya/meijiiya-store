/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ==== Meijiiya Brand Palette — Shopee (mobile UX) + Zara/COS (minimal) + Apple (premium spacing) ====
        // ปรับจาก luxury-gold เดิมมาเป็นโทน black/white/ivory + red accent เพื่อความคล่องตัวบนมือถือ
        // และความรู้สึกน่าเชื่อถือแบบแฟชั่นอินเตอร์ — คลาสเดิม (ink, hairline, gold ฯลฯ) ยังใช้ได้ทุกที่
        // เหมือนเดิม (รวมหน้า Admin) ไม่มีการลบคีย์ใดออก เปลี่ยนแค่ค่าสี/เพิ่มคีย์ใหม่เท่านั้น
        ivory: "#F8F6F3", // main background
        "soft-white": "#FAFAF7",
        beige: "#EFE8DA", // soft secondary panels (ใช้ในหน้า Admin/legacy)
        lightgray: "#F2F2F2", // พื้นหลังรอง เช่น thumbnail rail, chip พื้นหลัง
        bordergray: "#E5E5E5", // เส้นขอบมาตรฐานแบบใหม่ (Shopee/Zara/COS)
        ink: "#111111", // ดำหลัก — ข้อความ/ปุ่มหลัก (อัปเดตจาก #1C1C1C ให้ดำสนิทขึ้นตาม spec)
        softblack: "#111111", // พื้นหลังทึบ เช่น footer, hero
        card: "#FFFFFF", // การ์ดสินค้า / กล่องเนื้อหา
        hairline: "#E5E5E5", // เส้นขอบบาง (อัปเดตให้เป็นเทากลาง ตรงตาม spec ใหม่)
        gold: "#B89B5E", // accent เดิม — เก็บไว้เผื่อใช้งานจุดอื่น (ไม่ใช้ในดีไซน์ใหม่)
        graytext: "#7A746B", // ข้อความรอง / muted
        line: "#06C755", // LINE brand green
        salered: "#E53935", // Accent Red — ใช้เฉพาะ Sale/Discount badge, CTA, active tab, label สำคัญ
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
        card: "0 1px 3px rgba(17,17,17,0.05), 0 1px 2px rgba(17,17,17,0.04)", // เงาเบามากสำหรับ Product Card
        "card-hover": "0 10px 24px rgba(17,17,17,0.10)", // เงาตอน hover บน desktop เท่านั้น
        sticky: "0 -4px 16px rgba(17,17,17,0.08)", // เงาสำหรับ sticky bottom bar
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)", // รองรับ iPhone safe area สำหรับ sticky bottom bar
      },
      minHeight: {
        touch: "44px", // ขนาด touch target ขั้นต่ำตาม spec มือถือ
      },
      minWidth: {
        touch: "44px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.25s ease-out",
        slideUp: "slideUp 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
