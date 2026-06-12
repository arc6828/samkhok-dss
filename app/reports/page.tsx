// app/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getStoredData,
  Community,
  VulnerableCitizen,
  HistoricSite,
  AgriculturalField
} from "../data/mockData";
import {
  Printer,
  FileText,
  TrendingDown,
  Users,
  Building,
  Sprout,
  CheckCircle,
  Clock
} from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState({
    communities: [] as Community[],
    vulnerableCitizens: [] as VulnerableCitizen[],
    historicSites: [] as HistoricSite[],
    agriculturalFields: [] as AgriculturalField[],
    waterLevel: 1.8,
  });

  const [printDate, setPrintDate] = useState("");

  // โหลดข้อมูล
  const loadData = () => {
    setData(getStoredData());
  };

  useEffect(() => {
    loadData();
    window.addEventListener("waterLevelUpdate", loadData);

    // กำหนดเวลาวันที่พิมพ์รายงานภาษาไทย
    const now = new Date();
    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    setPrintDate(
      `ณ วันที่ ${now.getDate()} ${thaiMonths[now.getMonth()]} พ.ศ. ${now.getFullYear() + 543} เวลา ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} น.`
    );

    return () => {
      window.removeEventListener("waterLevelUpdate", loadData);
    };
  }, []);

  const { communities, vulnerableCitizens, historicSites, agriculturalFields, waterLevel } = data;

  // 1. สรุปภาพรวมระดับความเสี่ยงชุมชน
  const commRiskCounts = communities.reduce(
    (acc, comm) => {
      if (waterLevel >= comm.elevation) acc.high += 1;
      else if (waterLevel >= comm.elevation - 0.3) acc.warning += 1;
      else acc.safe += 1;
      return acc;
    },
    { high: 0, warning: 0, safe: 0 }
  );

  // 2. คำนวณผู้เปราะบางตามสถานะช่วยเหลือ
  const vulnStatusCounts = vulnerableCitizens.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    { pending: 0, contacted: 0, evacuated: 0, safe: 0 }
  );

  // 3. คำนวณร้อยละการป้องกันโบราณสถาน
  const protectedHist = historicSites.filter((h) => h.barrierHeight >= waterLevel).length;

  // 4. สรุปพื้นที่นาข้าวที่ปลอดภัย/ท่วม/เก็บเกี่ยวแล้ว
  const agriSummary = agriculturalFields.reduce(
    (acc, a) => {
      const isFlooded = waterLevel >= a.elevation;
      if (a.status === "harvested") {
        acc.harvestedRai += a.areaRai;
        acc.harvestedCount += 1;
      } else if (isFlooded) {
        acc.floodedRai += a.areaRai;
        acc.floodedCount += 1;
      } else {
        acc.growingRai += a.areaRai;
        acc.growingCount += 1;
      }
      return acc;
    },
    { harvestedRai: 0, harvestedCount: 0, floodedRai: 0, floodedCount: 0, growingRai: 0, growingCount: 0 }
  );

  // เปิดคำสั่งพิมพ์ของเบราว์เซอร์
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-xs text-slate-350">
      {/* สไตล์จำเพาะสำหรับหน้าพิมพ์กระดาษ (Print Media CSS) */}
      <style jsx global>{`
        @media print {
          /* ซ่อนเมนู Navbar และส่วนประกอบที่ไม่พิมพ์ */
          aside, header, .no-print {
            display: none !important;
          }
          /* ขยาย Main Content เต็มความกว้างและสีสำหรับพิมพ์ */
          main {
            padding: 0 !important;
            margin: 0 !important;
            background-color: white !important;
            color: black !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .print-card {
            border: 1px solid #cbd5e1 !important;
            background-color: white !important;
            color: black !important;
            box-shadow: none !important;
            border-radius: 6px !important;
          }
          .print-title {
            color: black !important;
            font-size: 16px !important;
          }
          .print-text {
            color: #1e293b !important;
          }
          .print-table th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            border-bottom: 2px solid #cbd5e1 !important;
          }
          .print-table td {
            color: #334155 !important;
            border-bottom: 1px solid #e2e8f0 !important;
          }
          .print-badge-red {
            border: 1px solid #f43f5e !important;
            color: #e11d48 !important;
            background-color: #ffe4e6 !important;
          }
          .print-badge-amber {
            border: 1px solid #d97706 !important;
            color: #b45309 !important;
            background-color: #fef3c7 !important;
          }
          .print-badge-green {
            border: 1px solid #059669 !important;
            color: #047857 !important;
            background-color: #d1fae5 !important;
          }
        }
      `}</style>

      {/* แผงควบคุมพิมพ์รายงาน (ปุ่ม no-print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl glass-panel border border-slate-800 no-print">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" /> รายงานสรุปสถานการณ์สําหรับผู้บริหาร
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            จัดหน้าเอกสารแบบพิเศษสําหรับพิมพ์ใบปะหน้าและเนื้อหารายงานการอพยพ ปภ. เป็น PDF ในคลิกเดียว
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/10 active:scale-95 cursor-pointer"
        >
          <Printer className="h-4.5 w-4.5" /> พิมพ์หรือเซฟรายงานสรุป (PDF)
        </button>
      </div>

      {/* ตัวเนื้อหารายงานหลัก (Print Content Container) */}
      <div className="p-6 md:p-8 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6 print-card">
        {/* หัวกระดาษรายงานแบบเป็นทางการ (แสดงเฉพาะตอนพิมพ์หรือหน้าจอรายงาน) */}
        <div className="text-center space-y-2 pb-6 border-b border-slate-800/80">
          <h1 className="text-base font-black text-white print-title">
            รายงานสถานการณ์วิเคราะห์ผลกระทบอุทกภัยระดับพื้นที่และแผนจัดลำดับช่วยเหลือ
          </h1>
          <h2 className="text-xs font-bold text-slate-350 print-text">
            เทศบาลตำบลสามโคก อำเภอสามโคก จังหวัดปทุมธานี
          </h2>
          <p className="text-[10px] text-slate-400 print-text font-medium flex items-center justify-center gap-1.5 mt-2">
            <Clock className="h-3.5 w-3.5 inline text-slate-500" /> {printDate} | สถานะจำลองระดับน้ำแม่น้ำเจ้าพระยา {waterLevel.toFixed(2)} เมตร
          </p>
        </div>

        {/* สรุปผู้บริหารแบบ 3 มิติ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 print-card">
            <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-400" /> สรุปกลุ่มเปราะบาง (Evacuation Status)
            </h3>
            <div className="grid grid-cols-2 gap-2 font-medium">
              <div className="p-2 bg-slate-950 border border-slate-850 rounded-lg print-card">
                <span className="text-[10px] text-slate-500 block">อพยพปลอดภัยแล้ว</span>
                <span className="text-sm font-bold text-emerald-400 print-badge-green block mt-1 font-mono">{vulnStatusCounts.evacuated + vulnStatusCounts.safe} ราย</span>
              </div>
              <div className="p-2 bg-slate-950 border border-slate-850 rounded-lg print-card">
                <span className="text-[10px] text-slate-500 block">รอการช่วยเหลือ</span>
                <span className="text-sm font-bold text-rose-400 print-badge-red block mt-1 font-mono">{vulnStatusCounts.pending + vulnStatusCounts.contacted} ราย</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 print-card">
            <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-indigo-400" /> การป้องกันโบราณสถาน (Protection Rate)
            </h3>
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between print-card">
              <div>
                <span className="text-[10px] text-slate-500 block">พ้นแนวน้ำ/มีแนวกระสอบทราย</span>
                <span className="text-sm font-bold text-slate-200 mt-0.5 block font-mono">
                  {protectedHist} จากทั้งหมด {historicSites.length} แห่ง
                </span>
              </div>
              <span className="font-mono text-base font-black text-indigo-400">
                {Math.round((protectedHist / (historicSites.length || 1)) * 100)}%
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 print-card">
            <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5 text-emerald-400" /> ความมั่นคงผลผลิตข้าว (Agricultural Crop)
            </h3>
            <div className="grid grid-cols-2 gap-2 font-medium">
              <div className="p-2 bg-slate-950 border border-slate-850 rounded-lg print-card">
                <span className="text-[10px] text-slate-500 block">เกี่ยวพ้นน้ำสำเร็จ</span>
                <span className="text-sm font-bold text-emerald-400 mt-1 block font-mono">{agriSummary.harvestedRai} ไร่</span>
              </div>
              <div className="p-2 bg-slate-950 border border-slate-850 rounded-lg print-card">
                <span className="text-[10px] text-slate-500 block">จมน้ำเสียหายด่วน</span>
                <span className="text-sm font-bold text-rose-400 mt-1 block font-mono">{agriSummary.floodedRai} ไร่</span>
              </div>
            </div>
          </div>
        </div>

        {/* ตารางแสดงข้อมูลกลุ่มเปราะบางแยกตามพื้นที่รายบุคคล */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs text-white flex items-center gap-2 print-title">
            1. รายงานความเปราะบางและผลกระทบรายบุคคล
          </h3>
          <div className="rounded-lg border border-slate-850 bg-slate-950/10 overflow-hidden print-card">
            <table className="w-full text-left border-collapse text-[10px] print-table">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-950/60 font-bold text-slate-400">
                  <th className="p-3">ชื่อ-สกุลกลุ่มเปราะบาง</th>
                  <th className="p-3">ประเภทความเปราะบาง</th>
                  <th className="p-3">หมู่บ้านสังกัด</th>
                  <th className="p-3">ความจำเป็นทางการแพทย์/ยารักษาโรค</th>
                  <th className="p-3">ผู้ประสานงาน / เบอร์ติดต่อ</th>
                  <th className="p-3 text-right">สถานะภัยพิบัติ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-350">
                {vulnerableCitizens.map((c) => {
                  const comm = communities.find((v) => v.id === c.communityId);
                  const isFlooded = comm ? waterLevel >= comm.elevation : false;
                  const isWarning = comm ? !isFlooded && waterLevel >= comm.elevation - 0.3 : false;

                  return (
                    <tr key={c.id}>
                      <td className="p-3 font-bold text-slate-200">{c.name} (อายุ {c.age} ปี)</td>
                      <td className="p-3">{c.typeName}</td>
                      <td className="p-3">{c.communityName}</td>
                      <td className="p-3 text-slate-300 font-medium">{c.medicalNeeds}</td>
                      <td className="p-3">{c.contactName} ({c.phone})</td>
                      <td className="p-3 text-right">
                        {c.status === "evacuated" ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-950 text-blue-400 print-badge-green">อพยพแล้ว</span>
                        ) : isFlooded ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-400 animate-pulse print-badge-red">น้ำล้อม/วิกฤต</span>
                        ) : isWarning ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-400 print-badge-amber">เตือนปริ่มน้ำ</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 print-badge-green">ที่พักปกติ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ตารางแสดงข้อมูลโบราณสถาน */}
        <div className="space-y-2 pt-2">
          <h3 className="font-bold text-xs text-white flex items-center gap-2 print-title">
            2. รายงานสถานะโบราณสถานริมแม่น้ำเจ้าพระยา
          </h3>
          <div className="rounded-lg border border-slate-850 bg-slate-950/10 overflow-hidden print-card">
            <table className="w-full text-left border-collapse text-[10px] print-table">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-950/60 font-bold text-slate-400">
                  <th className="p-3">โบราณสถาน / ท่องเที่ยว</th>
                  <th className="p-3">ความสูงแนวหกจากตลิ่ง</th>
                  <th className="p-3">ความสูงเสริมแนวคันกั้น</th>
                  <th className="p-3">ระยะห่างริมฝั่งแม่น้ำ</th>
                  <th className="p-3">ระดับความสำคัญทางโบราณคดี</th>
                  <th className="p-3 text-right">การจัดสรรแนวกั้นกระสอบทราย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-350">
                {historicSites.map((h) => {
                  const isFlooded = waterLevel >= h.elevation;
                  const isWarning = !isFlooded && waterLevel >= h.elevation - 0.3;

                  return (
                    <tr key={h.id}>
                      <td className="p-3 font-bold text-slate-200">{h.name}</td>
                      <td className="p-3">{h.elevation} เมตร (รทก.)</td>
                      <td className="p-3">{h.barrierHeight.toFixed(2)} เมตร</td>
                      <td className="p-3">{h.distanceToRiver} เมตร</td>
                      <td className="p-3 text-slate-300">แหล่งอนุรักษ์/อายุโบราณวัตถุสูง</td>
                      <td className="p-3 text-right">
                        {isFlooded ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-400 print-badge-red">ตลิ่งพัง/ท่วม</span>
                        ) : isWarning ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-400 print-badge-amber">กระสอบทรายปริ่ม</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 print-badge-green">เสริมกระสอบกั้นน้ำเรียบร้อย</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ลายเซ็นลงนามผู้บันทึกสรุปงาน (แสดงเฉพาะตอนพิมพ์ / ท้ายรายงาน) */}
        <div className="pt-12 mt-8 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-400 print-text">
          <div className="space-y-10">
            <span>ผู้จัดทำและวิเคราะห์รายงานสรุปภัยพิบัติ</span>
            <div className="flex flex-col items-center">
              <span className="w-36 border-b border-dashed border-slate-700/80 mb-1.5"></span>
              <span>(.......................................................)</span>
              <span className="mt-1 text-[9px]">ตำแหน่ง: เจ้าหน้าที่ป้องกันและบรรเทาสาธารณภัย</span>
            </div>
          </div>

          <div className="space-y-10">
            <span>ผู้ตรวจสอบและอนุมัติแผนบรรเทาเหตุ ปภ.</span>
            <div className="flex flex-col items-center">
              <span className="w-36 border-b border-dashed border-slate-700/80 mb-1.5"></span>
              <span>(.......................................................)</span>
              <span className="mt-1 text-[9px]">ตำแหน่ง: ผู้อำนวยการสั่งการ ปภ. เทศบาลตำบลสามโคก</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
