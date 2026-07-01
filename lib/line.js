// lib/line.js
// Helper สำหรับสร้างข้อความสั่งซื้ออัตโนมัติ และเปิดลิงก์ LINE ของร้าน
// แก้ลิงก์ LINE จริงได้ที่ data/settings.json (lineLink) หรือหน้า Admin > ตั้งค่าร้าน

export function buildOrderMessage(product) {
  if (!product) return "สวัสดีค่ะ สนใจสินค้าของร้าน Meijiiya ค่ะ";
  return `สวัสดีค่ะ สนใจสินค้านี้ค่ะ: ${product.name} ราคา ${product.price} บาท`;
}

// คัดลอกข้อความไปยัง clipboard แล้วเปิดลิงก์ LINE ในแท็บใหม่
// (LINE OA ลิงก์แบบ lin.ee ไม่รองรับการฝังข้อความล่วงหน้าโดยตรง
// วิธีนี้จึงเตรียมข้อความไว้ใน clipboard ให้ลูกค้าวางในแชทได้ทันที)
export async function copyMessageAndOpenLine(message, lineLink) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(message);
    }
  } catch (e) {
    // เงียบไว้ถ้าคัดลอกไม่สำเร็จ ยังเปิดลิงก์ LINE ต่อได้ปกติ
  }
  if (typeof window !== "undefined") {
    window.open(lineLink, "_blank", "noopener,noreferrer");
  }
}
