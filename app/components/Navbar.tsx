// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "แผนที่เสี่ยง", path: "/map" },
  { name: "ข้อมูลชุมชน", path: "/community" },
  { name: "จัดลำดับช่วยเหลือ", path: "/priority" },
  { name: "แจ้งเตือน", path: "/alert" },
  { name: "รายงาน", path: "/reports" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white p-4">
        <h2 className="text-lg font-bold mb-6">🌊 DSS Flood</h2>

        <nav className="space-y-2">
          {menus.map((menu) => (
            <Link
              key={menu.path}
              href={menu.path}
              className={`block px-3 py-2 rounded
                ${
                  pathname === menu.path ? "bg-blue-600" : "hover:bg-blue-700"
                }`}
            >
              {menu.name}
            </Link>
          ))}
        </nav>

        <div className="mt-10 text-sm text-blue-200">
          Role: ผู้บริหาร (Mock)
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        {/* Topbar */}
        <header className="bg-white shadow px-6 py-3 flex justify-between">
          <div className="font-semibold">ระบบสนับสนุนการตัดสินใจอุทกภัย</div>

          <Link href="/login" className="text-red-600 hover:underline">
            Logout
          </Link>
        </header>

        {/* Content */}
        <main className="p-6">{/* children จะถูก inject จาก layout */}</main>
      </div>
    </div>
  );
}
