/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // อนุญาตให้ใช้รูปจากโฟลเดอร์ public/uploads (อัปโหลดผ่านหน้า Admin)
    unoptimized: true,
  },
};

module.exports = nextConfig;
