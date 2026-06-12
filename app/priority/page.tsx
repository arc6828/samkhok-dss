// app/priority/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getStoredData,
  saveStoredData,
  calculatePriorityScore,
  Community,
  VulnerableCitizen,
  HistoricSite,
  AgriculturalField
} from "../data/mockData";
import {
  AlertTriangle,
  Sliders,
  Users,
  Building,
  Sprout,
  Shield,
  Send,
  HelpCircle,
  CheckCircle,
  RefreshCw,
  Droplet
} from "lucide-react";

export default function PriorityPage() {
  const [data, setData] = useState({
    communities: [] as Community[],
    vulnerableCitizens: [] as VulnerableCitizen[],
    historicSites: [] as HistoricSite[],
    agriculturalFields: [] as AgriculturalField[],
    waterLevel: 1.8,
  });

  // ค่าน้ำหนักในการประเมินลำดับความสำคัญ (Weights)
  const [weights, setWeights] = useState({
    waterThreat: 40, // ความสำคัญของภัยคุกคามน้ำท่วม
    vulnerable: 30,  // ความสำคัญของกลุ่มเปราะบาง
    heritage: 20,    // ความสำคัญของโบราณสถาน
    economic: 10,    // ความสำคัญของนาข้าวเกษตรกร
  });

  // บันทึก Log การสั่งการจำลอง
  const [logs, setLogs] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // โหลดข้อมูล
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

  const { communities, vulnerableCitizens, historicSites, agriculturalFields, waterLevel } = data;

  // ฟังก์ชันรีเซ็ตน้ำหนักเริ่มต้น
  const resetWeights = () => {
    setWeights({
      waterThreat: 40,
      vulnerable: 30,
      heritage: 20,
      economic: 10,
    });
  };

  // จัดการปรับน้ำหนัก
  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  // รวมน้ำหนักทั้งหมดเพื่อเตรียมทำการแจกแจงแบบร้อยละ (Normalize)
  const totalWeight = weights.waterThreat + weights.vulnerable + weights.heritage + weights.economic;
  const normalizedWeights = {
    waterThreat: weights.waterThreat / (totalWeight || 1),
    vulnerable: weights.vulnerable / (totalWeight || 1),
    heritage: weights.heritage / (totalWeight || 1),
    economic: weights.economic / (totalWeight || 1),
  };

  // 1. คำนวณความเสี่ยงและลำดับความสำคัญสำหรับทุกประเภทที่ต้องการความช่วยเหลือ
  const getRankedItems = () => {
    const items: Array<{
      id: string;
      name: string;
      type: "community" | "historic" | "agri";
      typeName: string;
      locationName: string;
      score: number;
      riskLevel: "high" | "warning" | "safe";
      metrics: string;
      rawStatus: string;
    }> = [];

    // ชุมชน
    communities.forEach((comm) => {
      const vulnInComm = vulnerableCitizens.filter((c) => c.communityId === comm.id && c.status !== "evacuated" && c.status !== "safe").length;
      const score = calculatePriorityScore(
        { elevation: comm.elevation, barrierHeight: comm.barrierHeight, id: comm.id },
        "community",
        waterLevel,
        normalizedWeights as any,
        { vulnerableCount: vulnInComm }
      );

      const isFlooded = waterLevel >= comm.elevation;
      const isWarning = !isFlooded && waterLevel >= comm.elevation - 0.3;

      items.push({
        id: comm.id,
        name: comm.name,
        type: "community",
        typeName: "ชุมชน",
        locationName: `หมู่ ${comm.moo} ต.สามโคก`,
        score,
        riskLevel: isFlooded ? "high" : isWarning ? "warning" : "safe",
        metrics: `กลุ่มเปราะบางค้างอพยพ ${vulnInComm} ราย | สูงตลิ่ง ${comm.barrierHeight} ม.`,
        rawStatus: comm.sandbagStatus,
      });
    });

    // โบราณสถาน
    historicSites.forEach((hist) => {
      const score = calculatePriorityScore(
        { elevation: hist.elevation, barrierHeight: hist.barrierHeight, id: hist.id },
        "historic",
        waterLevel,
        normalizedWeights as any,
        { distanceToRiver: hist.distanceToRiver }
      );

      const isFlooded = waterLevel >= hist.elevation;
      const isWarning = !isFlooded && waterLevel >= hist.elevation - 0.3;

      items.push({
        id: hist.id,
        name: hist.name,
        type: "historic",
        typeName: "โบราณสถาน",
        locationName: `ริมฝั่งเจ้าพระยา`,
        score,
        riskLevel: isFlooded ? "high" : isWarning ? "warning" : "safe",
        metrics: `ตลิ่งห่างแม่น้ำ ${hist.distanceToRiver} ม. | แนวเสริมกระสอบทราย ${hist.barrierHeight.toFixed(2)} ม.`,
        rawStatus: hist.sandbagStatus,
      });
    });

    // แปลงเกษตรกรรม (ข้ามแปลงที่เกี่ยวแล้ว)
    agriculturalFields.forEach((agri) => {
      if (agri.status === "harvested") return;

      const score = calculatePriorityScore(
        { elevation: agri.elevation, barrierHeight: agri.elevation, id: agri.id }, // เกษตรกรไม่มีแนวเสริมกั้นนอกจากแนวพื้นที่ตนเอง
        "agriculture",
        waterLevel,
        normalizedWeights as any,
        { harvestReadiness: agri.harvestReadiness }
      );

      const isFlooded = waterLevel >= agri.elevation;
      const isWarning = !isFlooded && waterLevel >= agri.elevation - 0.3;

      items.push({
        id: agri.id,
        name: `แปลงนา ${agri.farmerName}`,
        type: "agri",
        typeName: "พื้นที่การเกษตร",
        locationName: `ข้าว ${agri.cropType} (${agri.areaRai} ไร่)`,
        score,
        riskLevel: isFlooded ? "high" : isWarning ? "warning" : "safe",
        metrics: `ความพร้อมเกี่ยว ${agri.harvestReadiness}% | ปลูก ${agri.ageDays} วัน | ระดับพื้นที่ ${agri.elevation} ม.`,
        rawStatus: agri.status,
      });
    });

    // เรียงลำดับจากคะแนนสูงสุดลงมา
    return items.sort((a, b) => b.score - a.score);
  };

  const rankedItems = getRankedItems();

  // จัดการสั่งการ (Dispatch Action)
  const handleDispatch = (item: any) => {
    let actionText = "";

    if (item.type === "community") {
      // 1. สั่งระดมพลอพยพกลุ่มเปราะบางทั้งหมดในชุมชนนี้
      const updatedVuln = vulnerableCitizens.map((c) =>
        c.communityId === item.id && c.status !== "safe" ? { ...c, status: "evacuated" as const } : c
      );
      // เสริมคันกระสอบทรายชุมชนให้แข็งแรงขึ้น
      const updatedComm = communities.map((comm) =>
        comm.id === item.id ? { ...comm, sandbagStatus: "sufficient" as const, barrierHeight: comm.barrierHeight + 0.3 } : comm
      );

      const updated = { ...data, vulnerableCitizens: updatedVuln, communities: updatedComm };
      setData(updated);
      saveStoredData(updated);
      actionText = `🚨 อนุมัติแผนบรรเทาสาธารณภัย: สั่งทีมเคลื่อนย้ายและรถกู้ภัยท้องถิ่น เข้าอพยพประชาชนกลุ่มเปราะบางทั้งหมดใน ${item.name} พร้อมส่งเรือขนส่งกระสอบทรายเข้าค้ำจุดตลิ่งทรุดตัว!`;
    } else if (item.type === "historic") {
      // เสริมความแข็งแรงโบราณสถาน
      const updatedHistoric = historicSites.map((h) =>
        h.id === item.id ? { ...h, sandbagStatus: "sufficient" as const, barrierHeight: h.barrierHeight + 0.5 } : h
      );

      const updated = { ...data, historicSites: updatedHistoric };
      setData(updated);
      saveStoredData(updated);
      actionText = `🏛️ อนุมัติแผนรักษาโบราณสถาน: จัดสรรกำลังพล ปภ. ร่วมกับชุมชนและกรมศิลปากร นำถุงบิ๊กแบ็ก (Big Bags) เสริมแนวดินรอบกำแพงโบราณสถาน ${item.name} กั้นตลิ่งสำเร็จ! (+50 ซม.)`;
    } else if (item.type === "agri") {
      // สั่งดึงรถเกี่ยวข้าวมาเกี่ยวทันที
      const updatedAgri = agriculturalFields.map((a) =>
        a.id === item.id ? { ...a, status: "harvested" as const, harvestReadiness: 100 } : a
      );

      const updated = { ...data, agriculturalFields: updatedAgri };
      setData(updated);
      saveStoredData(updated);
      actionText = `🌾 อนุมัติแผนประสานช่วยเหลือเกษตรกร: ประสานงานสมาคมรถเก็บเกี่ยวข้าวปทุมธานี จัดส่งรถเกี่ยวข้าวและเครื่องจักรกลทางการเกษตรด่วนที่สุดเข้าพื้นที่ ${item.name} เพื่อเร่งเก็บเกี่ยวข้าวก่อนน้ำหลากท่วมแปลงนา!`;
    }

    // อัปเดต Log และแสดง Toast
    setLogs((prev) => [actionText, ...prev]);
    setSuccessToast(`ส่งข้อความสั่งการบรรเทาเหตุ: ${item.name} สำเร็จ!`);
    window.dispatchEvent(new Event("waterLevelUpdate"));

    // เคลียร์ Toast ภายใน 4 วินาที
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert ความสำเร็จ */}
      {successToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl border border-emerald-800 bg-emerald-950/95 text-emerald-300 text-xs flex items-center gap-2.5 shadow-2xl animate-bounce">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{successToast}</span>
        </div>
      )}

      {/* ส่วนหัว */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-blue-400 animate-pulse" /> ระบบจัดลำดับความช่วยเหลืออุทกภัย
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          ระบบสนับสนุนการวิเคราะห์ความสำคัญเร่งด่วนแบบหลายเกณฑ์ (Multi-Criteria Decision Analysis: MCDA) เรียงอันดับการบรรเทาสาธารณภัยแบบเรียลไทม์
        </p>
      </div>

      {/* แผงปรับแต่งค่าน้ำหนักสไลเดอร์ */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4.5 w-4.5 text-blue-400" />
            <h3 className="text-xs font-bold text-white">ตั้งค่าน้ำหนักการคำนวณคะแนนภัยพิบัติ (Weights %)</h3>
          </div>
          <button
            onClick={resetWeights}
            className="text-[10px] text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 py-1 px-3.5 rounded-lg bg-slate-950/50 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className="h-3 w-3" /> คืนค่าน้ำหนักมาตรฐาน
          </button>
        </div>

        {/* ตารางสไลเดอร์ 4 เกณฑ์หลัก */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* เกณฑ์ภัยน้ำท่วม */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Droplet className="h-3.5 w-3.5 text-blue-400" /> ภัยคุกคามระดับน้ำ
              </span>
              <span className="font-mono text-blue-400 font-bold">{weights.waterThreat}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.waterThreat}
              onChange={(e) => handleWeightChange("waterThreat", Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-[10px] text-slate-500">ระดับระดับน้ำล้นแนวคันตลิ่งและระยะจมดิน</p>
          </div>

          {/* เกณฑ์กลุ่มเปราะบาง */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-400" /> ประชากรเปราะบาง
              </span>
              <span className="font-mono text-indigo-400 font-bold">{weights.vulnerable}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.vulnerable}
              onChange={(e) => handleWeightChange("vulnerable", Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <p className="text-[10px] text-slate-500">ความหนาแน่นของผู้ป่วยติดเตียง/คนชราในชุมชน</p>
          </div>

          {/* เกณฑ์โบราณสถาน */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-amber-400" /> มรดกวัฒนธรรม
              </span>
              <span className="font-mono text-amber-400 font-bold">{weights.heritage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.heritage}
              onChange={(e) => handleWeightChange("heritage", Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-[10px] text-slate-500">คุณค่าทางประวัติศาสตร์และความเสี่ยงการผุกร่อน</p>
          </div>

          {/* เกณฑ์เกษตรกรรม */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sprout className="h-3.5 w-3.5 text-emerald-400" /> พืชผลและนาข้าว
              </span>
              <span className="font-mono text-emerald-400 font-bold">{weights.economic}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.economic}
              onChange={(e) => handleWeightChange("economic", Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-[10px] text-slate-500">ความพร้อมเก็บเกี่ยวข้าวก่อนน้ำท่วมล้นทำลาย</p>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5">
          <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-emerald-500" /> ค่าน้ำหนักปรับเปลี่ยนจะมีผลกับตารางคะแนนในแบบวินาทีต่อวินาที</span>
          <span>ผลรวมน้ำหนักค่านิยมขณะนี้: {totalWeight}% (คำนวณแบบร้อยละถ่วงดุลน้ำหนักเฉลี่ยอัตราส่วน)</span>
        </div>
      </div>

      {/* บอร์ดผลวิเคราะห์ลำดับช่วยเหลือ (Decision Priority Ranked List) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* รายการจัดอันดับช่วยเหลือด่วน */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-slate-800">
          <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
            📊 รายชื่อสถานที่จัดลำดับความเร่งด่วนในการบริหารจัดการภัยพิบัติ
          </h3>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {rankedItems.map((item, index) => {
              const TypeIcon = item.type === "community" ? Users : item.type === "historic" ? Building : Sprout;
              let bgClass = "bg-slate-900/40 hover:bg-slate-900/90 border-slate-850 hover:border-slate-800";
              let badgeClass = "text-slate-400 bg-slate-800 border-slate-750";

              if (item.riskLevel === "high") {
                bgClass = "bg-rose-950/15 hover:bg-rose-950/25 border-rose-900/30 hover:border-rose-900/50";
                badgeClass = "text-rose-400 bg-rose-950/40 border-rose-800/40 animate-pulse";
              } else if (item.riskLevel === "warning") {
                bgClass = "bg-amber-950/10 hover:bg-amber-950/20 border-amber-900/20 hover:border-amber-900/40";
                badgeClass = "text-amber-400 bg-amber-950/40 border-amber-800/40";
              }

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200 ${bgClass}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                      <span className="font-mono text-sm font-black text-slate-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-100">{item.name}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-850 text-slate-400 font-semibold flex items-center gap-1">
                          <TypeIcon className="h-2.5 w-2.5 text-blue-400" />
                          {item.typeName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>{item.locationName}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-slate-300 font-medium">{item.metrics}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t border-slate-800/50 sm:border-t-0 pt-3 sm:pt-0 shrink-0">
                    <div className="flex flex-col items-center sm:items-end">
                      <span className="text-xxs text-slate-500 font-medium">คะแนนความสำคัญ</span>
                      <span className="text-base font-black text-white font-mono mt-0.5">{item.score.toFixed(1)}</span>
                    </div>

                    <button
                      onClick={() => handleDispatch(item)}
                      disabled={item.rawStatus === "sufficient" || item.rawStatus === "harvested" || item.rawStatus === "safe"}
                      className={`py-2 px-3.5 rounded-xl font-black text-[10px] flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                        item.rawStatus === "sufficient" || item.rawStatus === "harvested" || item.rawStatus === "safe"
                          ? "bg-slate-800 text-slate-500 border border-slate-850 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/10 active:shadow-none"
                      }`}
                    >
                      <Send className="h-3 w-3" />
                      {item.type === "community" ? "สั่งทีมอพยพ/เสริมคัน" : item.type === "historic" ? "สั่งเสริมกระสอบทราย" : "ประสานรถเกี่ยวข้าวด่วน"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* หน้าบอร์ดสั่งการล่าสุด (Dispatch Logs Dashboard) */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2 mb-1">
              📝 ประวัติคำสั่งควบคุมและแจ้งประสานเหตุ ปภ.
            </h3>
            <p className="text-xxs text-slate-400 mb-4">แสดงผลคำสั่งการตัดสินใจที่หัวหน้าหน่วยอนุมัติแบบไลฟ์</p>

            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={i} className="p-3 bg-slate-950/60 rounded-lg border border-slate-850 text-xxs text-slate-300 leading-relaxed font-medium">
                    {log}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-xxs border border-dashed border-slate-800 rounded-xl">
                  ยังไม่มีคำสั่งจำลองจัดส่งในเซสชันนี้
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-blue-950/15 border border-blue-900/30 rounded-xl text-[10px] text-blue-300 flex items-start gap-2 mt-6">
            <HelpCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">คำแนะนำการวิเคราะห์เกณฑ์ตัดสินใจ:</span>
              <span className="mt-1 block leading-relaxed text-slate-400">
                การตั้งน้ำหนักของเกณฑ์ ปภ. จะช่วยจัดเรียงความคุ้มค่าการปฏิบัติงาน เมื่อทรัพยากรกำลังพลและรถกู้ชีพมีจำกัด โดยระบบคำนวณระดับภัยเสี่ยงแม่น้ำรวมกับข้อมูลกลุ่มเปราะบางเป็นลำดับสูงสุดตามมาตรฐาน ปภ. สากล
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
