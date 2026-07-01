"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STATUS_OPTIONS } from "@/lib/constants";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function patchProduct(id, updates) {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      load();
    } else {
      setError("อัปเดตไม่สำเร็จ");
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`ลบสินค้า "${name}" ใช่หรือไม่? ทำรายการนี้แล้วไม่สามารถกู้คืนได้`)) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      load();
    } else {
      setError("ลบสินค้าไม่สำเร็จ");
    }
  }

  if (!products) {
    return <p className="text-graytext text-sm">กำลังโหลดสินค้า...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-xl text-ink mb-1">สินค้าทั้งหมด</h1>
          <p className="text-sm text-graytext">{products.length} รายการ</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + เพิ่มสินค้าใหม่
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6">{error}</div>}

      {products.length === 0 ? (
        <p className="text-graytext text-sm">ยังไม่มีสินค้า กด "เพิ่มสินค้าใหม่" เพื่อเริ่มต้น</p>
      ) : (
        <div className="bg-white brand-border overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-ink/10 text-left text-graytext text-xs uppercase tracking-wide">
                <th className="p-4">รูป</th>
                <th className="p-4">ชื่อสินค้า</th>
                <th className="p-4">หมวดหมู่</th>
                <th className="p-4">ราคา</th>
                <th className="p-4">สถานะ</th>
                <th className="p-4">แสดงบนเว็บ</th>
                <th className="p-4">แนะนำ</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-ink/5 last:border-0">
                  <td className="p-4">
                    <div className="w-12 h-14 bg-ivory overflow-hidden">
                      <img
                        src={p.images?.[0] || "/uploads/sample/placeholder.svg"}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4 text-ink">
                    {p.name}
                    {p.brand && <span className="block text-xs text-graytext">{p.brand}</span>}
                  </td>
                  <td className="p-4 text-graytext text-xs max-w-[160px]">
                    {(p.categories?.length ? p.categories : p.category ? [p.category] : []).join(", ")}
                  </td>
                  <td className="p-4 text-ink">
                    {Number(p.price).toLocaleString()}
                    {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                      <span className="block text-xs text-graytext line-through">
                        {Number(p.originalPrice).toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <select
                      value={p.status}
                      onChange={(e) => patchProduct(p.id, { status: e.target.value })}
                      className="text-xs brand-border px-2 py-1.5"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => patchProduct(p.id, { published: !p.published })}
                      className={`text-xs px-3 py-1.5 border ${
                        p.published !== false
                          ? "bg-ink text-white border-ink"
                          : "border-ink/20 text-graytext"
                      }`}
                    >
                      {p.published !== false ? "เปิดอยู่" : "ปิดอยู่"}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => patchProduct(p.id, { featured: !p.featured })}
                      className={`text-xs px-3 py-1.5 border ${
                        p.featured ? "bg-beige border-ink/20 text-ink" : "border-ink/10 text-graytext"
                      }`}
                    >
                      {p.featured ? "★ แนะนำ" : "ปกติ"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-ink underline">
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-xs text-red-600 underline"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
