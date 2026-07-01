"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import ChipInput from "./ChipInput";
import { CATEGORIES, STATUS_OPTIONS, CONDITION_OPTIONS, SUGGESTED_TAGS, SIZE_OPTIONS } from "@/lib/constants";

const EMPTY_PRODUCT = {
  name: "",
  brand: "",
  categories: [],
  price: "",
  originalPrice: "",
  status: "available",
  condition: "New",
  shortDescription: "",
  description: "",
  images: [],
  colors: [],
  sizes: [],
  measurements: "",
  fabric: "",
  stock: "",
  tags: [],
  featured: false,
  published: true,
};

export default function ProductForm({ product = null, categories = CATEGORIES }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  // รองรับข้อมูลเก่าที่อาจยังมี category (เดี่ยว) แทน categories (หลายหมวดหมู่)
  const initialCategories =
    product?.categories?.length > 0 ? product.categories : product?.category ? [product.category] : [];

  const [form, setForm] = useState({
    ...EMPTY_PRODUCT,
    ...product,
    categories: initialCategories,
    measurements: typeof product?.measurements === "string" ? product.measurements : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleFromArray(field, value) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      price: Number(form.price) || 0,
      originalPrice: form.originalPrice === "" ? "" : Number(form.originalPrice),
      stock: form.stock === "" ? "" : Number(form.stock),
      // เก็บ category (เดี่ยว) ไว้ด้วยเพื่อความเข้ากันได้ย้อนหลัง ใช้ตัวแรกของ categories
      category: form.categories[0] || "",
    };

    const url = isEdit ? `/api/products/${product.id}` : "/api/products";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "บันทึกไม่สำเร็จ");
        setSaving(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-3xl">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      {/* รูปสินค้า */}
      <Field label="รูปสินค้า (อัปโหลดได้หลายรูป)">
        <ImageUploader images={form.images} onChange={(imgs) => update("images", imgs)} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="ชื่อสินค้า *">
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="input-base"
            placeholder="เช่น Everyday Muse Top"
          />
        </Field>

        <Field label="แบรนด์ (ถ้ามี)">
          <input
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
            className="input-base"
            placeholder="เช่น Zara, Uniqlo, Pomelo — เว้นว่างได้ถ้าไม่มี"
          />
        </Field>

        <Field label="ราคาขาย (บาท) *">
          <input
            required
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="input-base"
          />
        </Field>

        <Field label="ราคาปกติ (ถ้ามีการลดราคา)">
          <input
            type="number"
            min="0"
            value={form.originalPrice}
            onChange={(e) => update("originalPrice", e.target.value)}
            className="input-base"
            placeholder="เว้นว่างถ้าไม่ลดราคา"
          />
        </Field>

        <Field label="สภาพสินค้า">
          <select value={form.condition} onChange={(e) => update("condition", e.target.value)} className="input-base">
            {CONDITION_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label} ({c.value})
              </option>
            ))}
          </select>
        </Field>

        <Field label="สถานะสินค้า">
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className="input-base">
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="จำนวนคงเหลือ">
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            className="input-base"
          />
        </Field>

        <Field label="เนื้อผ้า">
          <input
            value={form.fabric}
            onChange={(e) => update("fabric", e.target.value)}
            className="input-base"
            placeholder="เช่น ผ้าคอตตอนผสม"
          />
        </Field>
      </div>

      <Field label="คำอธิบายสั้น (แสดงบนหน้า Product Card)">
        <input
          value={form.shortDescription}
          onChange={(e) => update("shortDescription", e.target.value)}
          className="input-base"
          maxLength={100}
        />
      </Field>

      <Field label="รายละเอียดสินค้า (แสดงบนหน้า Product Detail)">
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={5}
          className="input-base"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="สีที่มี">
          <ChipInput values={form.colors} onChange={(v) => update("colors", v)} placeholder="เช่น ขาวงาช้าง" />
        </Field>

        <Field label="ไซซ์ที่มี (เลือกได้หลายไซซ์)">
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleFromArray("sizes", s)}
                className={`px-3 py-1.5 text-xs border ${
                  form.sizes.includes(s) ? "bg-ink text-white border-ink" : "border-ink/20 text-ink/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="สัดส่วนสินค้า / Measurements (พิมพ์อิสระ เช่น อก 36 นิ้ว ขึ้นบรรทัดใหม่ได้)">
        <textarea
          value={form.measurements}
          onChange={(e) => update("measurements", e.target.value)}
          rows={4}
          className="input-base"
          placeholder={"อก 36 นิ้ว\nเอว 28-30 นิ้ว\nยาว 24 นิ้ว\nสะโพก 38 นิ้ว"}
        />
      </Field>

      <Field label="หมวดหมู่ (เลือกได้หลายหมวดหมู่)">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => toggleFromArray("categories", c)}
              className={`px-3 py-1.5 text-xs border ${
                form.categories.includes(c) ? "bg-ink text-white border-ink" : "border-ink/20 text-ink/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Field>

      <Field label="แท็กสินค้า (พิมพ์แล้วกด Enter เพื่อเพิ่ม)">
        <ChipInput values={form.tags} onChange={(v) => update("tags", v)} placeholder="เช่น แบรนด์แท้, ราคาดี" />
        <div className="flex flex-wrap gap-2 mt-1">
          {SUGGESTED_TAGS.filter((t) => !form.tags.includes(t)).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => update("tags", [...form.tags, t])}
              className="px-2.5 py-1 text-[11px] border border-dashed border-ink/20 text-graytext hover:border-ink/50 hover:text-ink"
            >
              + {t}
            </button>
          ))}
        </div>
      </Field>

      <div className="flex flex-col sm:flex-row gap-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
          ตั้งเป็นสินค้าแนะนำ (แสดงหน้า Home)
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} />
          เปิดแสดงสินค้าบนหน้าเว็บ
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "เผยแพร่สินค้า"}
        </button>
        <button type="button" onClick={() => router.push("/admin")} className="btn-outline">
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-graytext">{label}</label>
      {children}
    </div>
  );
}
