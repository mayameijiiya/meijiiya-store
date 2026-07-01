"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: "/admin", label: "สินค้าทั้งหมด", icon: "grid" },
  { href: "/admin/products/new", label: "เพิ่มสินค้าใหม่", icon: "plus" },
  { href: "/admin/settings", label: "ตั้งค่าร้าน", icon: "settings" },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState("checking"); // checking | ok | denied

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
    let cancelled = false;
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.authenticated) {
          setStatus("ok");
        } else {
          setStatus("denied");
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("denied");
          router.replace("/admin/login");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-ivory">{children}</div>;
  }

  if (status !== "ok") {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-graytext text-sm">กำลังตรวจสอบสิทธิ์เข้าใช้งาน...</p>
      </div>
    );
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 bg-ink text-ivory flex md:flex-col md:min-h-screen">
        <div className="p-6 hidden md:block">
          <span className="text-lg tracking-wide3 uppercase">Meijiiya</span>
          <p className="text-xs text-white/50 mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex md:flex-col flex-1 overflow-x-auto md:overflow-visible">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-6 py-4 text-sm whitespace-nowrap border-b md:border-b-0 md:border-l-2 ${
                  active
                    ? "bg-white/10 border-white text-white"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto hidden md:block">
          <Link href="/" className="text-xs text-white/50 hover:text-white block mb-3">
            ← กลับไปดูหน้าเว็บไซต์
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs text-white/70 hover:text-white border border-white/20 px-4 py-2 w-full"
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-10 max-w-6xl">{children}</main>
    </div>
  );
}
