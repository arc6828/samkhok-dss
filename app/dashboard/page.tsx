// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Droplet,
  Users,
  Building,
  Sprout,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Clock,
  Compass,
  AlertCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { getStoredData, saveStoredData, Community, VulnerableCitizen, HistoricSite, AgriculturalField } from "../data/mockData";

export default function DashboardPage() {
  const [data, setData] = useState({
    communities: [] as Community[],
    vulnerableCitizens: [] as VulnerableCitizen[],
    historicSites: [] as HistoricSite[],
    agriculturalFields: [] as AgriculturalField[],
    waterLevel: 1.8,
  });

  // โหลดข้อมูลจาก LocalStorage
  const loadData = () => {
    setData(getStoredData());
  };

  useEffect(() => {
    loadData();
    window.addEventListener("waterLevelUpdate", loadData);
    return () => {
      window.removeEventListener("waterLevelUpdate", loadData);
    };
  }, []);

  // เมื่อผู้ใช้ปรับระดับน้ำ
  const handleWaterLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const updated = { ...data, waterLevel: val };
    setData(updated);
    saveStoredData(updated);
    // ส่ง Custom Event แจ้งเตือนเมนูด้านข้างและหน้าอื่นๆ
    window.dispatchEvent(new Event("waterLevelUpdate"));
  };

  const { communities, vulnerableCitizens, historicSites, agriculturalFields, waterLevel } = data;

  // 1. คำนวณหาจำนวนกลุ่มเปราะบางที่กำลังเผชิญภัยคุกคาม
  // สมมติว่าชุมชนของกลุ่มเปราะบาง มีระดับคันกั้นน้ำที่ถ้าน้ำสูงกว่าระดับดิน (elevation) + คันกั้นน้ำ จะมีความเสี่ยง
  const threatenedVulnList = vulnerableCitizens.filter((c) => {
    const comm = communities.find((v) => v.id === c.communityId);
    if (!comm) return false;
    // ถ้าสถานะอพยพแล้วหรือปลอดภัยแล้ว ไม่นับเป็นเผชิญภัยคุกคาม
    if (c.status === "evacuated" || c.status === "safe") return false;
    return waterLevel >= comm.elevation; // ถ้าระดับน้ำแม่น้ำท่วมถึงความสูงพื้นดินของชุมชน
  });

  // 2. โบราณสถานที่เสี่ยง (น้ำท่วมถึงความสูงพื้นดิน)
  const threatenedHistoricList = historicSites.filter((h) => {
    return waterLevel >= h.elevation;
  });

  // 3. พื้นที่เกษตรกรรมที่น้ำเริ่มท่วมถึงดิน
  const threatenedAgriList = agriculturalFields.filter((a) => {
    return waterLevel >= a.elevation && a.status !== "harvested";
  });

  // 4. คำนวณเกษตรกรที่จำเป็นต้องรีบเกี่ยวข้าว (พร้อมเก็บเกี่ยวเกิน 80% และน้ำใกล้ถึงระดับพื้นที่)
  const urgentHarvestList = agriculturalFields.filter((a) => {
    const isCloseToFlood = waterLevel >= a.elevation - 0.3; // ระดับน้ำสูงกว่าความสูงดินแปลงนาลบออก 0.3 เมตร (เริ่มซึมเข้าแปลง)
    return isCloseToFlood && a.harvestReadiness >= 80 && a.status !== "harvested" && a.status !== "flooded";
  });

  // สถิติสำหรับแสดงในหน้าแดชบอร์ด
  const stats = [
    {
      title: "ระดับน้ำแม่น้ำเจ้าพระยา",
      value: `${waterLevel.toFixed(2)} ม.`,
      desc: waterLevel >= 2.8 ? "วิกฤต (น้ำล้นตลิ่ง)" : waterLevel >= 2.3 ? "เฝ้าระวังสูงสุด" : "ปกติ",
      icon: Droplet,
      color: waterLevel >= 2.8 ? "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400" : waterLevel >= 2.3 ? "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400" : "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400",
    },
    {
      title: "กลุ่มเปราะบางเสี่ยงภัย",
      value: `${threatenedVulnList.length} ราย`,
      desc: `จากทั้งหมด ${vulnerableCitizens.filter(c => c.status !== "safe" && c.status !== "evacuated").length} รายในพื้นที่เสี่ยง`,
      icon: Users,
      color: threatenedVulnList.length > 5 ? "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400" : threatenedVulnList.length > 0 ? "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400" : "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    },
    {
      title: "โบราณสถานที่กำลังจมน้ำ",
      value: `${threatenedHistoricList.length} แห่ง`,
      desc: `เสริมกระสอบทรายแล้ว ${historicSites.filter(h => h.barrierHeight >= waterLevel).length}/${historicSites.length} แห่ง`,
      icon: Building,
      color: threatenedHistoricList.length > 2 ? "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400" : threatenedHistoricList.length > 0 ? "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400" : "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    },
    {
      title: "พื้นที่การเกษตรวิกฤต",
      value: `${urgentHarvestList.length} โซน`,
      desc: `ต้องการรถเกี่ยวข้าวด่วนรวม ${urgentHarvestList.reduce((acc, curr) => acc + curr.areaRai, 0)} ไร่`,
      icon: Sprout,
      color: urgentHarvestList.length > 2 ? "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400" : urgentHarvestList.length > 0 ? "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400" : "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    },
  ];

  // ข้อมูลกราฟระดับน้ำย้อนหลัง 7 วัน + วันปัจจุบันจำลอง
  const waterHistoryData = [
    { day: "06 มิ.ย.", level: 1.25 },
    { day: "07 มิ.ย.", level: 1.30 },
    { day: "08 มิ.ย.", level: 1.45 },
    { day: "09 มิ.ย.", level: 1.62 },
    { day: "10 มิ.ย.", level: 1.85 },
    { day: "11 มิ.ย.", level: 1.95 },
    { day: "12 มิ.ย.", level: 1.90 },
    { day: "ปัจจุบัน (จำลอง)", level: waterLevel },
  ];

  // ข้อมูลสัดส่วนความพร้อมการเก็บเกี่ยวข้าว
  const agriChartData = agriculturalFields.map((field) => ({
    name: field.farmerName.split(" ")[0], // เอาแค่ชื่อต้น
    "ความพร้อมเก็บเกี่ยว (%)": field.harvestReadiness,
    "ความสูงของแปลง (ม.)": field.elevation,
    status: field.status,
  }));

  return (
    <div className="space-y-6">
      {/* ส่วนต้อนรับและปุ่มควบคุมจำลองภัยพิบัติ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            ศูนย์ควบคุมสั่งการจัดการสาธารณภัย เทศบาลตำบลสามโคก
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            สถานะจำลองภัยพิบัติน้ำหลากจากตอนเหนือและน้ำทะเลหนุนริมแม่น้ำเจ้าพระยา
          </p>
        </div>
        <div className="flex items-center gap-4 min-w-[280px] md:min-w-[340px] bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">แบบจำลองระดับน้ำแม่น้ำเจ้าพระยา:</span>
              <span className={`font-mono font-bold ${waterLevel >= 2.5 ? 'text-rose-400' : 'text-blue-400'}`}>
                {waterLevel.toFixed(2)} เมตร
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.1"
              value={waterLevel}
              onChange={handleWaterLevelChange}
              className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1.0ม. (แล้ง/ปกติ)</span>
              <span>2.5ม. (ระดับตลิ่งวิกฤต)</span>
              <span>3.5ม. (อุทกภัยรุนแรง)</span>
            </div>
          </div>
        </div>
      </div>

      {/* บอร์ดการ์ดสถิติ (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl border bg-gradient-to-br glass-card-hover ${stat.color}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-medium text-slate-400 block">{stat.title}</span>
                  <span className="text-2xl font-black text-white mt-1.5 block tracking-tight">
                    {stat.value}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="text-xs text-slate-300 mt-4 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                <span>{stat.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* กราฟและการวิเคราะห์เชิงลึก */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* กราฟเทรนด์ระดับน้ำ */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" /> แนวโน้มระดับน้ำแม่น้ำเจ้าพระยา (เมตร)
              </h3>
              <p className="text-xxs text-slate-400">เปรียบเทียบ 7 วันที่ผ่านมากับค่าจำลองปัจจุบัน</p>
            </div>
            <div className="flex gap-4 text-xxs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span> ระดับน้ำ
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="h-0.5 w-3 bg-rose-500"></span> แนวขอบตลิ่งเฉลี่ย (2.50 ม.)
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={waterHistoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                <YAxis domain={[0, 4]} stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc" }}
                  itemStyle={{ color: "#60a5fa" }}
                />
                <ReferenceLine y={2.5} stroke="#f43f5e" strokeDasharray="5 5" label={{ value: 'เตือนภัยล้นตลิ่ง', fill: '#f43f5e', fontSize: 10, position: 'top' }} />
                <Area type="monotone" dataKey="level" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLevel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* บอร์ดวิเคราะห์ความก้าวหน้าการเกษตร/เก็บเกี่ยวข้าว */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              🌾 สถานะความพร้อมการเก็บเกี่ยวข้าว
            </h3>
            <p className="text-xxs text-slate-400 mb-4">จำลองการประเมินข้าวปทุมธานี 1 และพันธุ์เด่นในแปลงสองฝั่งแม่น้ำ</p>
          </div>

          <div className="h-56 w-full mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agriChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc" }}
                />
                <Bar dataKey="ความพร้อมเก็บเกี่ยว (%)" radius={[4, 4, 0, 0]}>
                  {agriChartData.map((entry, index) => {
                    let color = "#3b82f6"; // น้ำเงินปกติ
                    if (entry.status === "harvested") color = "#10b981"; // เขียวเก็บเกี่ยวแล้ว
                    else if (entry.status === "warning") color = "#f59e0b"; // ส้มเสี่ยงภัย
                    else if (entry.status === "flooded") color = "#ef4444"; // แดงจมแล้ว
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9px] font-semibold text-slate-400">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-blue-500"></span> กำลังเติบโต</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-500"></span> เฝ้าระวัง/ไกล้เกี่ยว</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500"></span> เก็บเกี่ยวสำเร็จ</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-red-500"></span> จมน้ำ/เสียหาย</span>
          </div>
        </div>
      </div>

      {/* แถบการเตือนภัยและการตัดสินใจเร่งด่วนสำหรับผู้บริหาร */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* รายการแจ้งเตือนภัยที่กำลังเกิดขึ้นและแผนรับมือจำลอง */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <ShieldAlert className="h-4 w-4 text-rose-400 animate-pulse" /> การแจ้งเตือนและข้อสั่งการวิกฤต (จำลอง)
          </h3>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {/* 1. น้ำหนุนสูง */}
            {waterLevel >= 2.5 ? (
              <div className="p-3.5 rounded-xl border border-rose-900/40 bg-rose-950/20 text-rose-300 text-xs flex gap-3">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">ระดับน้ำวิกฤตล้นตลิ่ง: เจ้าพระยาสามโคกสูง {waterLevel.toFixed(2)} เมตร</h4>
                  <p className="mt-1 text-slate-300 text-xxs">
                    ระดับน้ำเข้าขัดเกณฑ์และสูงกว่าระดับแนวคันตลิ่งเฉลี่ยของ ชุมชนวัดศาลาแดงเหนือ และชุมชนวัดสิงห์
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link href="/priority" className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-1 px-3 rounded-lg text-xxs transition-colors">
                      ตรวจสอบลำดับอพยพด่วน
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 2. เตือนข้าวของเกษตรกร */}
            {urgentHarvestList.length > 0 ? (
              <div className="p-3.5 rounded-xl border border-amber-900/40 bg-amber-950/20 text-amber-300 text-xs flex gap-3">
                <Sprout className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">นาข้าวใกล้เกี่ยวมีความเสี่ยงอุทกภัย ({urgentHarvestList.length} โซน)</h4>
                  <p className="mt-1 text-slate-300 text-xxs">
                    พบแปลงนาของเกษตรกร เช่น {urgentHarvestList.map((a) => a.farmerName).join(", ")} ข้าวพร้อมเกี่ยวมากกว่า 80% แต่น้ำจะเริ่มท่วมดินในอีกไม่ช้า
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link href="/alert" className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-1 px-3 rounded-lg text-xxs transition-colors">
                      ส่งข้อความแจ้งเตือนเกี่ยวข้าว
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 3. ชุมชนกลุ่มเปราะบางที่ต้องอพยพ */}
            {threatenedVulnList.length > 0 ? (
              <div className="p-3.5 rounded-xl border border-indigo-900/40 bg-indigo-950/20 text-indigo-300 text-xs flex gap-3">
                <Users className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">มีประชาชนกลุ่มเปราะบางอยู่ในโซนน้ำท่วมถึง ({threatenedVulnList.length} ราย)</h4>
                  <p className="mt-1 text-slate-300 text-xxs">
                    ผู้สูงอายุและผู้ป่วยติดเตียงใน {Array.from(new Set(threatenedVulnList.map(v => v.communityName))).join(", ")} จำเป็นต้องได้รับทีมงานขนย้าย
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link href="/community" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1 px-3 rounded-lg text-xxs transition-colors">
                      จัดการรายชื่อและการอพยพ
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {/* กรณีไม่มีวิกฤตเลย */}
            {waterLevel < 2.3 && urgentHarvestList.length === 0 && threatenedVulnList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl">
                <span className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-emerald-400 mb-2 font-bold">✓</span>
                <p className="font-semibold text-slate-200">ยังไม่มีเหตุการณ์วิกฤตที่ต้องจัดการด่วน</p>
                <p className="text-xxs text-slate-500 mt-1">ทดลองเลื่อนสไลเดอร์ระดับน้ำขึ้นด้านบนเพื่อกระตุ้นให้ระเบิดการจำลองการวิเคราะห์และข้อแนะนำตัดสินใจ</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* แผงควบคุมด่วน Quick Actions */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Compass className="h-4 w-4 text-blue-400" /> ทางลัดระบบสนับสนุนการตัดสินใจ
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/map" className="p-4 rounded-xl border border-slate-850 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900 text-left transition-all duration-200 group">
                <span className="text-[10px] text-slate-400 block font-semibold">แผนที่ภาพถ่ายดาวเทียม</span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 mt-1.5 flex items-center gap-1">
                  ดูแผนที่เสี่ยงภัย <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </Link>

              <Link href="/priority" className="p-4 rounded-xl border border-slate-850 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900 text-left transition-all duration-200 group">
                <span className="text-[10px] text-slate-400 block font-semibold">การจัดลำดับช่วยเหลือ</span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 mt-1.5 flex items-center gap-1">
                  วิเคราะห์ลำดับสำคัญ <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </Link>

              <Link href="/community" className="p-4 rounded-xl border border-slate-850 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900 text-left transition-all duration-200 group">
                <span className="text-[10px] text-slate-400 block font-semibold">กลุ่มเปราะบางในพื้นที่</span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 mt-1.5 flex items-center gap-1">
                  แก้ไขข้อมูลผู้ประสบภัย <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </Link>

              <Link href="/reports" className="p-4 rounded-xl border border-slate-850 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900 text-left transition-all duration-200 group">
                <span className="text-[10px] text-slate-400 block font-semibold">รายงานผู้บริหาร</span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 mt-1.5 flex items-center gap-1">
                  พิมพ์เอกสารการประชุม <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xxs text-slate-500 flex justify-between items-center">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ข้อมูลล่าสุดอัปเดตเมื่อ: วันนี้ 23:59 น.</span>
            <span>เวอร์ชันจำลอง 1.0 (POC)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
