// lib/auth.js
// ระบบยืนยันตัวตนแบบง่ายสำหรับหน้า Admin Dashboard
// ใช้รหัสผ่านเดียว (เก็บใน data/settings.json -> adminPassword) + cookie httpOnly
// หมายเหตุ: เหมาะสำหรับร้านขนาดเล็กที่เจ้าของร้านใช้คนเดียว
// ถ้าต้องการความปลอดภัยสูงขึ้น (เช่น หลายผู้ดูแล, การจำกัดสิทธิ์) ควรทำระบบ auth เต็มรูปแบบในอนาคต

import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "meijiiya_admin";

export function isAdminAuthed() {
  const cookieStore = cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === "authenticated";
}
