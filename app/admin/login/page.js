"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white brand-border p-8 flex flex-col gap-5">
        <div className="text-center mb-2">
          <h1 className="text-xl tracking-wide3 uppercase text-ink">Meijiiya</h1>
          <p className="text-xs text-graytext mt-1">เข้าสู่ระบบ Admin Dashboard</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-graytext">รหัสผ่านผู้ดูแลร้าน</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            className="brand-border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>

        <p className="text-[11px] text-graytext text-center leading-relaxed">
          รหัสผ่านเริ่มต้นแก้ได้ที่ data/settings.json (adminPassword) หรือหน้าตั้งค่าร้านหลังล็อกอิน
        </p>
      </form>
    </div>
  );
}
