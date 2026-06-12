// app/alert/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getStoredData,
  Community,
  VulnerableCitizen,
  AgriculturalField
} from "../data/mockData";
import {
  Bell,
  Send,
  MessageSquare,
  Volume2,
  Smartphone,
  Layers,
  History,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  Clock
} from "lucide-react";

interface BroadcastLog {
  id: string;
  time: string;
  target: string;
  channel: string;
  level: "high" | "warning" | "info";
  message: string;
  recipientCount: number;
}

export default function AlertPage() {
  const [data, setData] = useState({
    communities: [] as Community[],
    vulnerableCitizens: [] as VulnerableCitizen[],
    historicSites: [],
    agriculturalFields: [] as AgriculturalField[],
    waterLevel: 1.8,
  });

  // ฟอร์มส่งแจ้งเตือน
  const [targetGroup, setTargetGroup] = useState("all-risk");
  const [channel, setChannel] = useState("sms");
  const [alertLevel, setAlertLevel] = useState<"high" | "warning" | "info">("warning");
  const [message, setMessage] = useState("");
  const [template, setTemplate] = useState("custom");

  // แอนิเมชันตอนส่งข้อมูล
  const [isSending, setIsSending] = useState(false);
  const [sendStep, setSendStep] = useState("");
  const [historyLogs, setHistoryLogs] = useState<BroadcastLog[]>([]);

  // โหลดข้อมูล
  const loadData = () => {
    setData(getStoredData() as any);
  };

  useEffect(() => {
    loadData();
    window.addEventListener("waterLevelUpdate", loadData);

    // โหลดประวัติจาก LocalStorage
    if (typeof window !== "undefined") {
      const storedLogs = localStorage.getItem("dss_alert_history");
      if (storedLogs) {
        setHistoryLogs(JSON.parse(storedLogs));
      } else {
        // ประวัติจำลองเริ่มต้น
        const initialLogs: BroadcastLog[] = [
          {
            id: "alert-1",
            time: "12 มิ.ย. 14:30 น.",
            target: "เกษตรกรแปลงนาโซน A และ B",
            channel: "SMS และระบบกระจายข่าวสมาคมชาวนา",
            level: "warning",
            message: "เฝ้าระวังน้ำหลากเหนือเขื่อนเจ้าพระยา: แนะนำเกษตรกรข้าวพันธุ์ปทุมธานี 1 อายุเกิน 100 วัน เริ่มวางแผนเก็บเกี่ยวล่วงหน้า",
            recipientCount: 5,
          },
          {
            id: "alert-2",
            time: "11 มิ.ย. 09:15 น.",
            target: "ผู้นำชุมชนทุกหมู่ริมแม่น้ำ",
            channel: "แอปพลิเคชัน Line Liff ประชาชน",
            level: "info",
            message: "เทศบาลตำบลสามโคก จัดเตรียมกระสอบทรายสำรอง 5,000 ถุง ณ ที่ทำการ ปภ. ประธานชุมชนสามารถติดต่อขอรับด่วน",
            recipientCount: 15,
          }
        ];
        setHistoryLogs(initialLogs);
        localStorage.setItem("dss_alert_history", JSON.stringify(initialLogs));
      }
    }

    return () => {
      window.removeEventListener("waterLevelUpdate", loadData);
    };
  }, []);

  const { communities, vulnerableCitizens, agriculturalFields, waterLevel } = data;

  // เทมเพลตข้อความเตือนภัย
  const templates = {
    custom: "",
    agri: "⚠️ ด่วนที่สุด! เทศบาลตำบลสามโคกขอแจ้งเตือนเกษตรกรแปลงนาข้าวริมแม่น้ำเจ้าพระยา เนื่องจากระดับน้ำน้ำเหนือหลากและน้ำทะเลหนุน คาดระดับน้ำสูงถึง 2.4 เมตรภายใน 48 ชั่วโมง ขอให้เกษตรกรเร่งเก็บเกี่ยวผลผลิตที่พร้อมเกี่ยวทันที ประสานขอรถเกี่ยวข้าวด่วนโทร ปภ. 02-xxx-xxxx",
    evacuation: "🚨 ประกาศอพยพเร่งด่วน! เนื่องจากระดับน้ำแม่น้ำเจ้าพระยาวัดได้ที่ {level} เมตร ล้นคันตลิ่งเข้าท่วมชุมชนลุ่มต่ำ ขอให้ประชาชนกลุ่มเปราะบาง เด็ก สตรีมีครรภ์ และผู้ป่วยใน ชุมชนวัดศาลาแดงเหนือ และ ชุมชนวัดสิงห์ เตรียมอพยพขึ้นศูนย์กู้ภัยโรงเรียนวัดบ้านปทุมทันที ทีมช่วยเหลือ ปภ. กำลังเคลื่อนกำลังทางเรือเข้าพื้นที่",
    volunteer: "👷 ขอแรงอาสาสมัคร: เฝ้าระวังระบายนํ้า คาดนํ้าเหนือหนุนสูง คืนนี้ เทศบาลสามโคกต้องการกำลังอาสาสมัครรวมพลกรอกและเสริมกระสอบทรายบริเวณแนวโบราณสถานวัดสิงห์ ด่วน ตั้งแต่เวลา 17:00 น. เป็นต้นไป",
  };

  // เปลี่ยนข้อความเมื่อเลือกเทมเพลต
  useEffect(() => {
    if (template !== "custom") {
      let tplText = templates[template as keyof typeof templates] || "";
      // แทนค่าระดับน้ำปัจจุบันจำลอง
      tplText = tplText.replace("{level}", waterLevel.toFixed(2));
      setMessage(tplText);

      // ปรับระดับความเสี่ยงตามเนื้อหาอัตโนมัติ
      if (template === "evacuation") {
        setAlertLevel("high");
      } else if (template === "agri") {
        setAlertLevel("warning");
      } else if (template === "volunteer") {
        setAlertLevel("info");
      }
    }
  }, [template, waterLevel]);

  // คำนวณผู้ที่จะได้รับข้อความจำลอง
  const getRecipientCount = () => {
    if (targetGroup === "all") return communities.reduce((acc, curr) => acc + curr.households, 0); // ครัวเรือนทั้งหมด
    if (targetGroup === "vuln") return vulnerableCitizens.length;
    if (targetGroup === "agri") return agriculturalFields.length;
    
    // ทุกคนที่เสี่ยงภัย (อยู่ในชุมชนที่ระดับตลิ่งต่ำกว่าระดับน้ำจำลอง)
    if (targetGroup === "all-risk") {
      const riskCommIds = communities.filter((v) => waterLevel >= v.elevation - 0.3).map((v) => v.id);
      const householdsCount = communities.filter((v) => riskCommIds.includes(v.id)).reduce((acc, curr) => acc + curr.households, 0);
      const vulnInRisk = vulnerableCitizens.filter((c) => riskCommIds.includes(c.communityId)).length;
      return householdsCount + vulnInRisk;
    }
    return 10;
  };

  // ดำเนินการส่งแจ้งเตือนจำลอง
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) {
      alert("กรุณากรอกข้อความแจ้งเตือน");
      return;
    }

    setIsSending(true);
    setSendStep("กำลังเชื่อมต่อเกตเวย์ SMS และ Line Broadcast API...");

    // ลำดับขั้นตอนส่งข้อความจำลอง
    setTimeout(() => {
      setSendStep("กรองรายชื่อและพิกัดพิกัด GPS อุปกรณ์เคลื่อนที่เป้าหมาย...");
      setTimeout(() => {
        setSendStep(`กำลังกระจายสัญญาณเตือนภัยระดับ [${alertLevel.toUpperCase()}] ไปยังผู้รับปลายทางจำนวน ${getRecipientCount()} ราย...`);
        setTimeout(() => {
          // สำเร็จ
          const now = new Date();
          const timeStr = `${now.getDate()} มิ.ย. ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} น.`;
          
          let targetText = "ทุกคนในพื้นที่เสี่ยง";
          if (targetGroup === "all") targetText = "ครัวเรือนทั้งหมดในเทศบาล";
          else if (targetGroup === "vuln") targetText = "ประชาชนกลุ่มเปราะบาง";
          else if (targetGroup === "agri") targetText = "เกษตรกรแปลงนาข้าว";

          let channelText = "SMS ด่วนเสาสัญญาณ";
          if (channel === "line") channelText = "Line Liff ราชการ";
          else if (channel === "speaker") channelText = "ระบบลำโพงหอกระจายข่าวหมู่บ้าน";

          const newLog: BroadcastLog = {
            id: `alert-${Date.now()}`,
            time: timeStr,
            target: targetText,
            channel: channelText,
            level: alertLevel,
            message: message,
            recipientCount: getRecipientCount(),
          };

          const updatedLogs = [newLog, ...historyLogs];
          setHistoryLogs(updatedLogs);
          if (typeof window !== "undefined") {
            localStorage.setItem("dss_alert_history", JSON.stringify(updatedLogs));
          }

          setIsSending(false);
          setSendStep("");
          setMessage("");
          setTemplate("custom");
          alert("✓ ระบบส่งสัญญาณการเตือนภัยอุทกภัยเสร็จสมบูรณ์เรียบร้อย!");
        }, 1500);
      }, 1500);
    }, 1500);
  };

  // ล้างประวัติการส่ง
  const handleClearHistory = () => {
    if (!confirm("คุณต้องการลบประวัติการส่งสัญญาณแจ้งเตือนทั้งหมดหรือไม่?")) return;
    setHistoryLogs([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("dss_alert_history");
    }
  };

  return (
    <div className="space-y-6">
      {/* ส่วนหัว */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-400" /> ศูนย์แจ้งเตือนภัยอุทกภัยและเกษตรกรรม
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          ระบบส่งคลื่นสัญญาณข้อความจำลอง ไปยังโทรศัพท์เคลื่อนที่ หอกระจายเสียงประจำหมู่บ้าน และกลุ่มเป้าหมายริมแม่น้ำเจ้าพระยาแบบระบุพื้นที่เจาะจง
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* คอนโทรลส่งกระจายเสียง (Broadcast Controller Panel) */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Send className="h-4.5 w-4.5 text-blue-400" /> แผงควบคุมกระจายสัญญาณแจ้งเตือนภัย
          </h3>

          {isSending ? (
            <div className="p-12 text-center text-slate-350 border border-slate-800 rounded-xl bg-slate-950/40 flex flex-col items-center justify-center gap-4 min-h-[300px]">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-200">ระบบกำลังทำรายการส่งแจ้งเตือนภัยแบบไร้สาย...</p>
                <p className="text-xxs text-blue-400 font-mono animate-pulse">{sendStep}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. เลือกกลุ่มเป้าหมาย */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-slate-500" /> กลุ่มผู้รับเป้าหมาย
                  </label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="all-risk">🔔 ทุกคนในพื้นที่เสี่ยงภัยน้ำท่วมสูง ({getRecipientCount()} ราย)</option>
                    <option value="all">👨‍👩‍👧‍👦 ประชาชนทุกครัวเรือนในเขตเทศบาล ({getRecipientCount()} ครัวเรือน)</option>
                    <option value="vuln">👵 ประชาชนกลุ่มเปราะบางเท่านั้น ({getRecipientCount()} ราย)</option>
                    <option value="agri">🌾 เกษตรกรแปลงเพาะปลูก/ชาวนา ({getRecipientCount()} ราย)</option>
                  </select>
                </div>

                {/* 2. เลือกช่องทาง */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-slate-500" /> ช่องทางสื่อสารหลัก
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="sms">📱 ส่ง SMS ด่วนพิกัดเซลไซท์ (Cell Broadcast)</option>
                    <option value="line">💬 ส่งข้อความแชทแอปฯ Line OA เทศบาล</option>
                    <option value="speaker">🔊 เปิดเสียงแจ้งวิกฤตตามสาย (หอกระจายเสียง)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 3. ระดับการเตือนภัย */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-slate-500" /> ระดับสัญญาณแจ้งเตือน
                  </label>
                  <select
                    value={alertLevel}
                    onChange={(e) => setAlertLevel(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="high">🔴 แดง - แจ้งอพยพ / เกิดอุทกภัยล้นตลิ่งแล้ว</option>
                    <option value="warning">🟡 ส้ม - เตรียมตัวเกี่ยวด่วน / เฝ้าระวังเข้มข้น</option>
                    <option value="info">🔵 น้ำเงิน - ข่าวสารข้อมูล / เสริมแนวตลิ่ง</option>
                  </select>
                </div>

                {/* 4. เทมเพลตข้อความสำเร็จรูป */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-500" /> เลือกข้อความสำเร็จรูป (Templates)
                  </label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="custom">✍️ พิมพ์ข้อความใหม่เอง (Custom Message)</option>
                    <option value="agri">🌾 [เกษตรกร] แจ้งระดับน้ำหนุน เร่งเก็บเกี่ยวข้าว</option>
                    <option value="evacuation">🚨 [กลุ่มเปราะบาง] สั่งแผนอพยพพุ่งศูนย์ราชการ</option>
                    <option value="volunteer">👷 [ทั่วไป] ประกาศขอแรงอาสาพิทักษ์วัดโบราณสถาน</option>
                  </select>
                </div>
              </div>

              {/* ข้อความที่จะส่ง */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">พิมพ์ข้อความเตือนภัยที่จะทำการกระจายส่ง <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="กรุณากรอกข้อมูลด่วนเตือนภัยที่จะแจ้งเตือน หรือกดเลือกเทมเพลตด้านบน..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/10 active:scale-95 cursor-pointer"
                >
                  <Send className="h-4 w-4" /> ส่งคำสั่งแจ้งภัยออกอากาศ (Broadcast Alert)
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ตารางแสดงระดับคำอธิบายการแจ้งเตือน */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            📢 เกณฑ์การระบายเตือนภัยแม่น้ำเจ้าพระยาสามโคก
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-xl border border-rose-900/30 bg-rose-950/25 flex gap-2.5">
              <span className="text-base shrink-0">🚨</span>
              <div className="text-xxs">
                <span className="font-bold text-rose-400 block">ระบายนํ้าเกิน 2.8 เมตร (ระดับวิกฤต)</span>
                <span className="text-slate-400 block mt-0.5">ล้นตลิ่งแม่น้ำท่วมแปลงเกษตรและชุมชนฝั่งตะวันตก จำเป็นต้องส่ง SMS คำสั่งเคลื่อนย้ายทันที</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-amber-900/30 bg-amber-950/25 flex gap-2.5">
              <span className="text-base shrink-0">⚠️</span>
              <div className="text-xxs">
                <span className="font-bold text-amber-400 block">ระบายนํ้า 2.3 - 2.7 เมตร (ระดับเตือนภัย)</span>
                <span className="text-slate-400 block mt-0.5">นํ้าท่วมใกล้ถึงแนวตลิ่งระดับคันดินนาข้าว ให้เกษตรกรที่มีข้าวอายุเกิน 90 วัน เร่งประสานรถเกี่ยวข้าวเก็บเกี่ยวผลผลิตด่วน</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-blue-900/30 bg-blue-950/25 flex gap-2.5">
              <span className="text-base shrink-0">ℹ️</span>
              <div className="text-xxs">
                <span className="font-bold text-blue-400 block">ระบายนํ้าต่ำกว่า 2.2 เมตร (ระดับเฝ้าระวัง)</span>
                <span className="text-slate-400 block mt-0.5">สภาวะทางชลประทานปกติ ให้ข้อมูลเฝ้าระวังน้ำหลากเหนือและการสร้างแนวกั้นกระสอบทรายตามชุมชน</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ประวัติการส่งสัญญาณเตือนภัย (Alert History Log Table) */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-blue-400" /> ประวัติการแพร่กระจายสัญญาณเตือนภัยในพื้นที่
          </h3>
          <button
            onClick={handleClearHistory}
            disabled={historyLogs.length === 0}
            className="text-[10px] text-rose-400 hover:text-rose-350 border border-slate-850 hover:border-slate-800 bg-slate-950/40 p-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-3.5 w-3.5" /> ล้างประวัติส่งข้อความ
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xxs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3 w-36">วัน-เวลาส่ง</th>
                <th className="p-3 w-40">กลุ่มเป้าหมาย</th>
                <th className="p-3 w-44">ช่องทางการส่ง</th>
                <th className="p-3 w-28">ระดับความสำคัญ</th>
                <th className="p-3">ข้อความสั้นที่แจ้ง</th>
                <th className="p-3 text-right">จำนวนเครื่องที่รับข้อความ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-350">
              {historyLogs.length > 0 ? (
                historyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="p-3 font-mono text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-slate-600" /> {log.time}
                    </td>
                    <td className="p-3 font-bold text-slate-200">{log.target}</td>
                    <td className="p-3">{log.channel}</td>
                    <td className="p-3">
                      {log.level === "high" ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/40 font-bold">🔴 อพยพวิกฤต</span>
                      ) : log.level === "warning" ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40 font-bold">🟡 เตือนภัยด่วน</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/40 font-bold">🔵 ข้อมูลข่าวสาร</span>
                      )}
                    </td>
                    <td className="p-3 max-w-xs truncate font-medium text-slate-300" title={log.message}>
                      {log.message}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-200">{log.recipientCount.toLocaleString()} ปลายทาง</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    ยังไม่มีรายการประวัติการประกาศส่งแจ้งภัยในหน่วยงาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
