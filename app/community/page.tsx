// app/community/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getStoredData,
  saveStoredData,
  Community,
  VulnerableCitizen
} from "../data/mockData";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle,
  Phone,
  Filter,
  RefreshCw,
  X
} from "lucide-react";

export default function CommunityPage() {
  const [data, setData] = useState({
    communities: [] as Community[],
    vulnerableCitizens: [] as VulnerableCitizen[],
    historicSites: [],
    agriculturalFields: [],
    waterLevel: 1.8,
  });

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // State สำหรับจัดการฟอร์ม (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<VulnerableCitizen>>({
    name: "",
    age: 70,
    gender: "หญิง",
    type: "elderly",
    communityId: "",
    phone: "",
    contactName: "",
    medicalNeeds: "",
    status: "pending",
  });
  const [currentId, setCurrentId] = useState<string | null>(null);

  // โหลดข้อมูล
  const loadData = () => {
    setData(getStoredData() as any);
  };

  useEffect(() => {
    loadData();
    window.addEventListener("waterLevelUpdate", loadData);
    return () => {
      window.removeEventListener("waterLevelUpdate", loadData);
    };
  }, []);

  const { communities, vulnerableCitizens, waterLevel } = data;

  // กรองข้อมูลกลุ่มเปราะบาง
  const filteredCitizens = vulnerableCitizens.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.communityName.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === "all" || c.type === filterType;
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // คำนวณความเสี่ยงของแต่ละคนแบบเรียลไทม์ (ระดับน้ำท่วมถึงตลิ่งชุมชน)
  const getCitizenRisk = (citizen: VulnerableCitizen) => {
    const comm = communities.find((v) => v.id === citizen.communityId);
    if (!comm) return { text: "ปกติ", color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/50", level: "safe" };
    
    // หากน้ำเกินระดับดินชุมชน
    if (waterLevel >= comm.elevation) {
      return { text: "วิกฤต (น้ำท่วมขัง)", color: "text-rose-400 bg-rose-950/50 border-rose-800", level: "high" };
    }
    // หากน้ำปริ่มระดับดินลบออก 0.3 เมตร
    if (waterLevel >= comm.elevation - 0.3) {
      return { text: "เฝ้าระวังสูง (น้ำปริ่ม)", color: "text-amber-400 bg-amber-950/50 border-amber-800", level: "warning" };
    }
    return { text: "ปลอดภัย", color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/40", level: "safe" };
  };

  // เปิดแบบฟอร์มลงทะเบียนคนใหม่
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      age: 70,
      gender: "หญิง",
      type: "elderly",
      communityId: communities[0]?.id || "",
      phone: "",
      contactName: "",
      medicalNeeds: "",
      status: "pending",
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // เปิดแบบฟอร์มแก้ไข
  const handleOpenEdit = (citizen: VulnerableCitizen) => {
    setFormData(citizen);
    setCurrentId(citizen.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // จัดการบันทึกข้อมูล
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.communityId) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    const selectedComm = communities.find((v) => v.id === formData.communityId);
    const communityName = selectedComm ? selectedComm.name : "ชุมชนสามโคก";

    // อัปเดตพิกัดตามชุมชนที่เลือกสุ่มเล็กน้อยเพื่อไม่ให้จุดทับกันเป๊ะ
    const randomOffset = () => (Math.random() - 0.5) * 0.003;
    const baseCoords = selectedComm ? selectedComm.coords : [14.0543, 100.5222];
    const coords: [number, number] = [
      baseCoords[0] + randomOffset(),
      baseCoords[1] + randomOffset()
    ];

    let typeName = "ผู้สูงอายุ";
    if (formData.type === "bedridden") typeName = "ผู้ป่วยติดเตียง";
    else if (formData.type === "disabled") typeName = "ผู้พิการ";
    else if (formData.type === "pregnant") typeName = "สตรีตั้งครรภ์";

    let updatedCitizens = [...vulnerableCitizens];

    if (isEditMode && currentId) {
      updatedCitizens = updatedCitizens.map((c) =>
        c.id === currentId
          ? {
              ...(c as any),
              ...formData,
              communityName,
              typeName,
              coords: formData.communityId === c.communityId ? c.coords : coords, // ถ้าไม่เปลี่ยนชุมชน ให้ใช้พิกัดเดิม
            }
          : c
      );
    } else {
      const newCitizen: VulnerableCitizen = {
        id: `vuln-${Date.now()}`,
        name: formData.name!,
        age: Number(formData.age || 70),
        gender: formData.gender as "ชาย" | "หญิง",
        type: formData.type as any,
        typeName,
        communityId: formData.communityId!,
        communityName,
        phone: formData.phone || "ไม่มีข้อมูล",
        contactName: formData.contactName || "ไม่มีข้อมูล",
        medicalNeeds: formData.medicalNeeds || "ไม่มีข้อมูล",
        status: formData.status as any,
        coords,
      };
      updatedCitizens.push(newCitizen);
    }

    const updated = { ...data, vulnerableCitizens: updatedCitizens };
    setData(updated as any);
    saveStoredData(updated as any);
    setIsModalOpen(false);
    // แจ้งอัปเดตหน้าอื่น
    window.dispatchEvent(new Event("waterLevelUpdate"));
  };

  // จัดการลบข้อมูล
  const handleDelete = (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบรายชื่อกลุ่มเปราะบางรายนี้ออกจากระบบ?")) return;

    const updatedCitizens = vulnerableCitizens.filter((c) => c.id !== id);
    const updated = { ...data, vulnerableCitizens: updatedCitizens };
    setData(updated as any);
    saveStoredData(updated as any);
    window.dispatchEvent(new Event("waterLevelUpdate"));
  };

  // สรุปข้อมูลผู้เปราะบางแต่ละประเภท
  const typeCounts = vulnerableCitizens.reduce(
    (acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    },
    { elderly: 0, disabled: 0, pregnant: 0, bedridden: 0 }
  );

  return (
    <div className="space-y-6">
      {/* ส่วนหัวหน้าเว็บและแดชบอร์ดสรุปสถิติเปราะบาง */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" /> ทะเบียนประชาชนกลุ่มเปราะบาง
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ฐานข้อมูลผู้สูงอายุ ผู้พิการ สตรีตั้งครรภ์ และผู้ป่วยติดเตียง เพื่อการช่วยเหลือและอพยพอย่างเร่งด่วน
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/10 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> ลงทะเบียนกลุ่มเปราะบางใหม่
        </button>
      </div>

      {/* บล็อกสถิติย่อย */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xxs text-slate-400 block font-medium">🧓 ผู้สูงอายุทั้งหมด</span>
            <span className="text-xl font-black mt-1 block font-mono">{typeCounts.elderly} ราย</span>
          </div>
          <span className="text-xl">👵</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xxs text-slate-400 block font-medium">♿ ผู้ทุพพลภาพ</span>
            <span className="text-xl font-black mt-1 block font-mono">{typeCounts.disabled} ราย</span>
          </div>
          <span className="text-xl">♿</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xxs text-slate-400 block font-medium">🤰 สตรีมีครรภ์</span>
            <span className="text-xl font-black mt-1 block font-mono">{typeCounts.pregnant} ราย</span>
          </div>
          <span className="text-xl">🤰</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xxs text-slate-400 block font-medium">🛏️ ผู้ป่วยติดเตียง</span>
            <span className="text-xl font-black mt-1 block font-mono">{typeCounts.bedridden} ราย</span>
          </div>
          <span className="text-xl">🛌</span>
        </div>
      </div>

      {/* แถบเครื่องมือกองข้อมูลและค้นหา */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* ค้นหา */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, เบอร์โทร, หรือชุมชน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* ตัวกรอง */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-slate-300 text-xxs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">ทุกประเภทเปราะบาง</option>
              <option value="elderly">👵 ผู้สูงอายุ</option>
              <option value="disabled">♿ ผู้พิการ</option>
              <option value="pregnant">🤰 สตรีตั้งครรภ์</option>
              <option value="bedridden">🛌 ผู้ป่วยติดเตียง</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-slate-300 text-xxs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">ทุกสถานะช่วยเหลือ</option>
              <option value="pending">⏳ ค้างอพยพ/ยังไม่ช่วย</option>
              <option value="contacted">📞 ติดต่อแล้ว</option>
              <option value="evacuated">⛵ อพยพเข้าศูนย์แล้ว</option>
              <option value="safe">✓ ปลอดภัยดี/ที่บ้านปกติ</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setFilterType("all");
              setFilterStatus("all");
            }}
            className="p-2 rounded-xl border border-slate-800 hover:bg-slate-900 transition-colors text-slate-400 hover:text-slate-200"
            title="รีเซ็ตฟิลเตอร์"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ตารางแสดงผลทะเบียนรายชื่อ */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-300 text-xxs font-bold uppercase tracking-wider">
                <th className="p-4">กลุ่มเปราะบาง</th>
                <th className="p-4">ประเภท</th>
                <th className="p-4">ชุมชนที่อยู่</th>
                <th className="p-4">ระดับภัยคุกคามปัจจุบัน</th>
                <th className="p-4">ผู้ติดต่อ / โทรศัพท์</th>
                <th className="p-4">สถานะช่วยเหลือ</th>
                <th className="p-4 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {filteredCitizens.length > 0 ? (
                filteredCitizens.map((c) => {
                  const risk = getCitizenRisk(c);
                  return (
                    <tr key={c.id} className="hover:bg-slate-900/30 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-slate-100">{c.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{c.gender} อายุ {c.age} ปี</div>
                      </td>
                      <td className="p-4 text-blue-300 font-medium">{c.typeName}</td>
                      <td className="p-4">{c.communityName}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${risk.color}`}>
                          {risk.text}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>{c.contactName}</div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 inline text-slate-500" /> {c.phone}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === "evacuated" ? "bg-blue-900/60 text-blue-300 border border-blue-800" :
                          c.status === "contacted" ? "bg-amber-900/60 text-amber-300 border border-amber-800" :
                          c.status === "safe" ? "bg-emerald-900/60 text-emerald-300 border border-emerald-800" : "bg-slate-800 text-slate-400"
                        }`}>
                          {c.status === "evacuated" ? "อพยพแล้ว" : c.status === "contacted" ? "ติดต่อแล้ว" : c.status === "safe" ? "ปลอดภัย" : "รอน้ำท่วม"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title="ลบข้อมูล"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    ไม่พบข้อมูลประชาชนกลุ่มเปราะบางตามตัวกรองที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* แบบฟอร์มลงทะเบียน / แก้ไข (Popup Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 hover:bg-slate-850 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              {isEditMode ? "แก้ไขประวัติกลุ่มเปราะบาง" : "ลงทะเบียนกลุ่มเปราะบางรายใหม่"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">ชื่อ-นามสกุล <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                    placeholder="เช่น นางสมศรี รักษ์ดี"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">อายุ</label>
                    <input
                      type="number"
                      value={formData.age || 70}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">เพศ</label>
                    <select
                      value={formData.gender || "หญิง"}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">ประเภทความเปราะบาง</label>
                  <select
                    value={formData.type || "elderly"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="elderly">👵 ผู้สูงอายุ</option>
                    <option value="disabled">♿ ผู้พิการ</option>
                    <option value="pregnant">🤰 สตรีตั้งครรภ์</option>
                    <option value="bedridden">🛌 ผู้ป่วยติดเตียง</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">สังกัดชุมชน (หมู่) <span className="text-rose-500">*</span></label>
                  <select
                    required
                    value={formData.communityId || ""}
                    onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">เลือกชุมชน...</option>
                    {communities.map((comm) => (
                      <option key={comm.id} value={comm.id}>
                        {comm.name} (คันสูง {comm.barrierHeight}ม.)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">ผู้ดูแลติดต่อ</label>
                  <input
                    type="text"
                    value={formData.contactName || ""}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                    placeholder="บุตรชาย/หลานสาว/คู่สมรส"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">เบอร์โทรศัพท์ผู้ติดต่อ</label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                    placeholder="เช่น 08x-xxx-xxxx"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">ความต้องการการแพทย์ / ยารักษาประจำ</label>
                <textarea
                  value={formData.medicalNeeds || ""}
                  onChange={(e) => setFormData({ ...formData, medicalNeeds: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="เช่น ต้องการสายฟอกไต, ถังออกซิเจนสำรอง, ยาลดความดันประจำทุกเช้า..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">สถานะการช่วยเหลือและลําดับการอพยพ</label>
                <select
                  value={formData.status || "pending"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="pending">⏳ รอความช่วยเหลือ (เมื่อเกิดวิกฤตน้ำ)</option>
                  <option value="contacted">📞 ได้รับการติดต่อตรวจสอบข้อมูลแล้ว</option>
                  <option value="evacuated">⛵ อพยพเรียบร้อย (เข้าศูนย์พักพิงตำบล)</option>
                  <option value="safe">✓ ที่บ้านปลอดภัยดี/น้ำท่วมไม่ถึงแนวตลิ่ง</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
