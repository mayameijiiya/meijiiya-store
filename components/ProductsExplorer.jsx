"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { CATEGORIES, SIZE_OPTIONS, CONDITION_OPTIONS } from "@/lib/constants";

const SORT_OPTIONS = [
  { value: "newest", label: "ใหม่ล่าสุด" },
  { value: "price-asc", label: "ราคาต่ำไปสูง" },
  { value: "price-desc", label: "ราคาสูงไปต่ำ" },
];

export default function ProductsExplorer({ products, lineLink, initialCategory = "" }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

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

  return (
    <div>
      {/* แถบค้นหา + เรียงลำดับ */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาสินค้า..."
          className="w-full md:max-w-xs input-base"
        />

        <div className="flex gap-3">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-base w-auto text-xs">
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                เรียงตาม: {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="md:hidden btn-outline text-xs px-4 py-2.5 whitespace-nowrap"
          >
            {showFilters ? "ซ่อนตัวกรอง" : "ตัวกรอง"}
          </button>
        </div>
      </div>

      <div className={`flex-col gap-4 mb-8 ${showFilters ? "flex" : "hidden md:flex"}`}>
        {/* หมวดหมู่ */}
        <div className="flex flex-wrap gap-2">
          <FilterPill active={category === ""} onClick={() => setCategory("")}>
            ทุกหมวดหมู่
          </FilterPill>
          {CATEGORIES.map((cat) => (
            <FilterPill key={cat} active={category === cat} onClick={() => setCategory(cat)}>
              {cat}
            </FilterPill>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* ไซซ์ */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-graytext mr-1">ไซซ์:</span>
            <FilterPill small active={size === ""} onClick={() => setSize("")}>
              ทั้งหมด
            </FilterPill>
            {SIZE_OPTIONS.map((s) => (
              <FilterPill small key={s} active={size === s} onClick={() => setSize(s)}>
                {s}
              </FilterPill>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* สภาพสินค้า */}
          <span className="text-xs text-graytext mr-1">สภาพสินค้า:</span>
          <FilterPill small active={condition === ""} onClick={() => setCondition("")}>
            ทั้งหมด
          </FilterPill>
          {CONDITION_OPTIONS.map((c) => (
            <FilterPill small key={c.value} active={condition === c.value} onClick={() => setCondition(c.value)}>
              {c.label}
            </FilterPill>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-graytext">
          <p className="text-lg">ยังไม่มีสินค้าในหมวดนี้</p>
          <p className="text-sm mt-1">ลองเปลี่ยนตัวกรอง หรือค้นหาคำอื่นดูนะคะ</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} lineLink={lineLink} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ children, active, onClick, small = false }) {
  return (
    <button
      onClick={onClick}
      className={`${small ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs"} tracking-wide uppercase border rounded-full transition-colors ${
        active ? "bg-ink text-white border-ink" : "border-hairline text-ink/70 hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}
