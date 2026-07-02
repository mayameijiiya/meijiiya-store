"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { CATEGORIES, SIZE_OPTIONS, CONDITION_OPTIONS } from "@/lib/constants";

const SORT_OPTIONS = [
  { value: "newest", label: "ใหม่ล่าสุด" },
  { value: "price-asc", label: "ราคาต่ำไปสูง" },
  { value: "price-desc", label: "ราคาสูงไปต่ำ" },
];

// หมายเหตุ: ตรรกะการค้นหา/กรอง/เรียงลำดับทั้งหมดเหมือนเดิมทุกประการ — เปลี่ยนแค่การแสดงผล
// (แถบค้นหา, หมวดหมู่แบบเลื่อนแนวนอน, และตัวกรองขนาด/สภาพสินค้าย้ายไปอยู่ใน bottom sheet บนมือถือ)
export default function ProductsExplorer({ products, lineLink, initialCategory = "", initialSearch = "" }) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [sort, setSort] = useState("newest");
  const [sheetOpen, setSheetOpen] = useState(false);

  // ถ้า URL เปลี่ยน (เช่นมาจาก Header search หรือลิงก์หมวดหมู่) ให้ sync state ตาม
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);
  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category ? p.categories?.includes(category) : true;
      const matchesSize = size ? p.sizes?.includes(size) : true;
      const matchesCondition = condition ? p.condition === condition : true;
      return matchesSearch && matchesCategory && matchesSize && matchesCondition;
    });

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      // newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return list;
  }, [products, search, category, size, condition, sort]);

  const activeFilterCount = (size ? 1 : 0) + (condition ? 1 : 0) + (sort !== "newest" ? 1 : 0);

  return (
    <div>
      {/* แถบค้นหา */}
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาสินค้า..."
          className="w-full bg-lightgray border border-transparent rounded-full pl-10 pr-4 min-h-touch text-sm text-ink placeholder:text-graytext/80 focus:outline-none focus:ring-1 focus:ring-ink focus:bg-white transition-colors"
        />
        <SearchIcon className="w-4 h-4 text-graytext absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* หมวดหมู่ — เลื่อนแนวนอน + ปุ่มตัวกรอง */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex gap-2 overflow-x-auto scroll-hide flex-1 -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => setCategory("")}
            className={`category-pill ${category === "" ? "category-pill-active" : "category-pill-inactive"}`}
          >
            ทุกหมวดหมู่
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`category-pill ${category === cat ? "category-pill-active" : "category-pill-inactive"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="shrink-0 relative min-h-touch min-w-touch flex items-center justify-center gap-1.5 px-4 rounded-full border border-bordergray text-ink text-[13px] font-medium bg-white"
        >
          <FilterIcon className="w-4 h-4" />
          ตัวกรอง
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-salered text-white text-[9px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-graytext">
          <p className="text-base">ยังไม่มีสินค้าในหมวดนี้</p>
          <p className="text-sm mt-1">ลองเปลี่ยนตัวกรอง หรือค้นหาคำอื่นดูนะคะ</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} lineLink={lineLink} />
          ))}
        </div>
      )}

      {/* Bottom sheet ตัวกรอง (ไซซ์ / สภาพสินค้า / เรียงลำดับ) — มือถือแบบ slide-up, desktop แสดงกลางจอ */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-ink/40 animate-fadeIn"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] max-h-[85vh] overflow-y-auto animate-slideUp md:animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-ink font-semibold">ตัวกรองสินค้า</h3>
              <button onClick={() => setSheetOpen(false)} className="min-h-touch min-w-touch flex items-center justify-center text-graytext" aria-label="ปิด">
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs text-graytext mb-2">เรียงตาม</p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSort(s.value)}
                      className={`category-pill ${sort === s.value ? "category-pill-active" : "category-pill-inactive"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-graytext mb-2">ไซซ์</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSize("")}
                    className={`category-pill ${size === "" ? "category-pill-active" : "category-pill-inactive"}`}
                  >
                    ทั้งหมด
                  </button>
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`category-pill ${size === s ? "category-pill-active" : "category-pill-inactive"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-graytext mb-2">สภาพสินค้า</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCondition("")}
                    className={`category-pill ${condition === "" ? "category-pill-active" : "category-pill-inactive"}`}
                  >
                    ทั้งหมด
                  </button>
                  {CONDITION_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCondition(c.value)}
                      className={`category-pill ${condition === c.value ? "category-pill-active" : "category-pill-inactive"}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setSheetOpen(false)} className="btn-primary w-full mt-6">
              ดูผลลัพธ์ ({filtered.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  );
}
