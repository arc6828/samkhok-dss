// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Map,
  Users,
  AlertTriangle,
  Bell,
  FileBarChart2,
  Droplet,
  ShieldAlert,
  Menu,
  X
} from "lucide-react";
import { getStoredData } from "../data/mockData";

const menus = [
  { name: "แดชบอร์ดภาพรวม", path: "/dashboard", icon: LayoutDashboard },
  { name: "แผนที่วิเคราะห์ความเสี่ยง", path: "/map", icon: Map },
  { name: "ข้อมูลชุมชน & กลุ่มเปราะบาง", path: "/community", icon: Users },
  { name: "จัดลำดับความช่วยเหลือ", path: "/priority", icon: AlertTriangle },
  { name: "ศูนย์แจ้งเตือนภัย", path: "/alert", icon: Bell },
  { name: "รายงานผู้บริหาร", path: "/reports", icon: FileBarChart2 },
];

interface NavbarProps {
  children: React.ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  const pathname = usePathname();
  const [waterLevel, setWaterLevel] = useState<number>(1.8);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ข้ามเมนูข้างหากเป็นหน้าล็อกอิน
  if (pathname === "/login") {
    return <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">{children}</div>;
  }

  // โหลดระดับน้ำแบบเรียลไทม์เพื่อแสดงผลที่ Sidebar
  useEffect(() => {
    const loadWater = () => {
      const data = getStoredData();
      setWaterLevel(data.waterLevel);
    };

    loadWater();

    // ฟังเหตุการณ์อัปเดตระดับน้ำ (Custom Event)
    window.addEventListener("waterLevelUpdate", loadWater);
    // และตรวจเช็คเป็นระยะ
    const interval = setInterval(loadWater, 1000);

    return () => {
      window.removeEventListener("waterLevelUpdate", loadWater);
      clearInterval(interval);
    };
  }, []);

  // คำนวณระดับความรุนแรงของระดับน้ำแม่น้ำเจ้าพระยา (เกณฑ์ 2.5 เมตรเป็นแนวเตือนภัย)
  const getWaterStatus = (level: number) => {
    if (level >= 2.8) return { text: "วิกฤต (น้ำล้นตลิ่ง)", color: "text-rose-400 bg-rose-950/50 border-rose-800" };
    if (level >= 2.3) return { text: "เตือนภัย (เฝ้าระวังใกล้ชิด)", color: "text-amber-400 bg-amber-950/50 border-amber-800" };
    return { text: "ปกติ (เฝ้าระวัง)", color: "text-emerald-400 bg-emerald-950/50 border-emerald-800" };
  };

  const waterStatus = getWaterStatus(waterLevel);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar สำหรับหน้าจอขนาดใหญ่ และป๊อปอัพสำหรับมือถือ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:flex-shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* ส่วนหัว Sidebar */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-500/20">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              </div>
              <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Sam Khok DSS
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ระดับน้ำปัจจุบันจำลองแสดงผลที่ Sidebar */}
          <div className="m-4 p-4 rounded-xl border bg-slate-950/40 backdrop-blur-sm border-slate-850 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">ระดับน้ำเจ้าพระยา</span>
              <Droplet className={`h-4 w-4 text-blue-400 ${waterLevel >= 2.3 ? 'animate-bounce' : ''}`} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{waterLevel.toFixed(2)}</span>
              <span className="text-xs text-slate-400">ม. (รทก.)</span>
            </div>
            <div className={`text-xxs px-2.5 py-1 rounded-md border text-center font-semibold tracking-wide ${waterStatus.color}`}>
              {waterStatus.text}
            </div>
          </div>

          {/* รายการเมนูนำทาง */}
          <nav className="px-4 py-2 space-y-1">
            {menus.map((menu) => {
              const Icon = menu.icon;
              const isActive = pathname === menu.path;
              return (
                <Link
                  key={menu.path}
                  href={menu.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-100"}`} />
                  <span>{menu.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ส่วนท้าย Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-400 border border-slate-700">
              ผอ
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">ผู้อำนวยการ ปภ.</div>
              <div className="text-xxs text-slate-400">เทศบาลตำบลสามโคก</div>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/login"
              className="block text-center text-xs text-slate-500 hover:text-rose-400 transition-colors border border-slate-800 hover:border-rose-900/30 py-2 rounded-lg bg-slate-950/40"
            >
              ออกจากระบบ (จำลอง)
            </Link>
          </div>
        </div>
      </aside>

      {/* พื้นที่เนื้อหาหลัก (Main Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-950">
        {/* แถบหัวขอด้านบน (Topbar) */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-850 hover:text-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-bold text-lg text-slate-100 tracking-tight lg:block hidden">
              ระบบสนับสนุนการตัดสินใจอุทกภัยอัจฉริยะ (Decision Support System - DSS)
            </h1>
            <h1 className="font-bold text-sm text-slate-100 tracking-tight lg:hidden block">
              ระบบ DSS อุทกภัยสามโคก
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xxs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded-full font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Feed
            </span>
            <div className="text-xs text-slate-400 hidden sm:block">
              พิกัด: 14.0543° N, 100.5222° E | ปทุมธานี
            </div>
          </div>
        </header>

        {/* ส่วนเนื้อหาของหน้าเว็บย่อย */}
        <main className="flex-1 p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
