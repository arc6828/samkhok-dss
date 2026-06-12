// app/map/MapComponent.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  getStoredData,
  saveStoredData,
  Community,
  VulnerableCitizen,
  HistoricSite,
  AgriculturalField
} from "../data/mockData";
import {
  Layers,
  Droplet,
  Users,
  Building,
  Sprout,
  Compass,
  MapPin,
  Phone,
  ShieldAlert,
  Info
} from "lucide-react";

export default function MapComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const kmzLayersRef = useRef<{ [key: string]: any }>({});

  const [data, setData] = useState({
    communities: [] as Community[],
    vulnerableCitizens: [] as VulnerableCitizen[],
    historicSites: [] as HistoricSite[],
    agriculturalFields: [] as AgriculturalField[],
    waterLevel: 1.8,
  });

  // สถานะเปิด-ปิดตัวคัดกรองเลเยอร์
  const [layers, setLayers] = useState({
    boundary: true,
    government: true,
    buildings: false, // ปิดตึกเป็นค่าเริ่มต้นเพราะกินทรัพยากรเครื่อง
    vuln: true,
    historic: true,
    agri: true,
  });

  // วัตถุที่ถูกเลือกเพื่อดูรายละเอียด (Inspector)
  const [selectedNode, setSelectedNode] = useState<{
    type: "vulnerable" | "historic" | "agri";
    data: any;
    risk: "high" | "warning" | "safe";
  } | null>(null);

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

  // เริ่มต้นแผนที่ Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let mapInstance: any;

    const initMap = async () => {
      const L = await import("leaflet");
      await import("leaflet-kmz");

      // พิกัดเทศบาลสามโคก
      const samkhokCoords: [number, number] = [14.0543, 100.5222];

      mapInstance = L.map(mapContainerRef.current!, {
        center: samkhokCoords,
        zoom: 13,
        zoomControl: false,
      });
      mapRef.current = mapInstance;

      L.control.zoom({ position: "bottomright" }).addTo(mapInstance);

      // แผนที่ฐาน (Base Maps)
      const openStreetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance);

      const googleSatellite = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        attribution: "© Google Maps",
      });

      // จัดการเมนูเปลี่ยน Base Layer ด่วนแบบมุมขวา
      const baseMaps = {
        "แผนที่ถนน": openStreetMap,
        "แผนที่ดาวเทียม": googleSatellite,
      };
      L.control.layers(baseMaps, {}, { collapsed: true, position: "bottomright" }).addTo(mapInstance);

      // โหลดไฟล์ KMZ ด้วยปลั๊กอิน leaflet-kmz
      const LAny = L as any;

      // 1. ขอบเขตเทศบาล
      const kmzBoundary = new LAny.KMZLayer();
      kmzBoundary.load("/assets/kmz/ขอบเขตเทศบาล.kmz");
      kmzLayersRef.current.boundary = kmzBoundary;
      if (layers.boundary) mapInstance.addLayer(kmzBoundary);

      // 2. สถานที่ราชการ
      const kmzGov = new LAny.KMZLayer();
      kmzGov.load("/assets/kmz/สถานที่ราชการ.kmz");
      kmzLayersRef.current.government = kmzGov;
      if (layers.government) mapInstance.addLayer(kmzGov);

      // 3. อาคารสิ่งปลูกสร้าง
      const kmzBuild = new LAny.KMZLayer();
      kmzBuild.load("/assets/kmz/อาคาร.kmz");
      kmzLayersRef.current.buildings = kmzBuild;
      if (layers.buildings) mapInstance.addLayer(kmzBuild);

      // ซูมเข้าขอบเขตเทศบาลอัตโนมัติเมื่อโหลด KMZ เสร็จ
      kmzBoundary.on("load", (e: any) => {
        if (e.target && typeof e.target.getBounds === "function") {
          const bounds = e.target.getBounds();
          if (bounds.isValid()) {
            mapInstance.fitBounds(bounds);
          }
        }
      });
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // จัดการการเปิด-ปิดเลเยอร์ KMZ
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const boundary = kmzLayersRef.current.boundary;
    const government = kmzLayersRef.current.government;
    const buildings = kmzLayersRef.current.buildings;

    if (boundary) {
      if (layers.boundary) map.addLayer(boundary);
      else map.removeLayer(boundary);
    }
    if (government) {
      if (layers.government) map.addLayer(government);
      else map.removeLayer(government);
    }
    if (buildings) {
      if (layers.buildings) map.addLayer(buildings);
      else map.removeLayer(buildings);
    }
  }, [layers.boundary, layers.government, layers.buildings]);

  // วาดและอัปเดต Markers (ประชาชนเปราะบาง, โบราณสถาน, พื้นที่เกษตร) เมื่อระดับน้ำ หรือคาร์ดฟิลเตอร์เปลี่ยน
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const L = (window as any).L;
    if (!L) return;

    // เคลียร์มาร์กเกอร์เก่าทั้งหมด
    Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
    markersRef.current = {};

    // 1. วาดมาร์กเกอร์กลุ่มเปราะบาง
    if (layers.vuln) {
      vulnerableCitizens.forEach((c) => {
        const comm = communities.find((v) => v.id === c.communityId);
        const elevation = comm ? comm.elevation : 1.5;
        const isFlooded = waterLevel >= elevation;
        const isWarning = !isFlooded && waterLevel >= elevation - 0.3;

        let riskStatus: "high" | "warning" | "safe" = "safe";
        let colorClass = "bg-emerald-500 border-emerald-300";
        let emoji = "👵";

        if (c.type === "bedridden") emoji = "🛏️";
        else if (c.type === "disabled") emoji = "♿";
        else if (c.type === "pregnant") emoji = "🤰";

        if (c.status === "evacuated") {
          colorClass = "bg-blue-600 border-blue-400";
        } else if (isFlooded) {
          colorClass = "bg-rose-600 border-rose-300 animate-ping";
          riskStatus = "high";
        } else if (isWarning) {
          colorClass = "bg-amber-500 border-amber-300";
          riskStatus = "warning";
        }

        const icon = L.divIcon({
          html: `<div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 text-white font-bold text-sm ${colorClass} shadow-lg transition-transform hover:scale-110 cursor-pointer">
                  <span>${emoji}</span>
                 </div>`,
          className: "custom-marker-icon",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker(c.coords, { icon }).addTo(map);

        marker.on("click", () => {
          setSelectedNode({
            type: "vulnerable",
            data: c,
            risk: riskStatus,
          });
        });

        markersRef.current[`vuln-${c.id}`] = marker;
      });
    }

    // 2. วาดมาร์กเกอร์โบราณสถาน
    if (layers.historic) {
      historicSites.forEach((h) => {
        const isFlooded = waterLevel >= h.elevation;
        const isWarning = !isFlooded && waterLevel >= h.elevation - 0.3;

        let riskStatus: "high" | "warning" | "safe" = "safe";
        let colorClass = "bg-slate-700 border-slate-500"; // ปกติ

        if (isFlooded) {
          colorClass = "bg-rose-700 border-rose-400 animate-pulse";
          riskStatus = "high";
        } else if (isWarning) {
          colorClass = "bg-amber-600 border-amber-400";
          riskStatus = "warning";
        } else {
          colorClass = "bg-indigo-700 border-indigo-500";
        }

        const icon = L.divIcon({
          html: `<div class="relative flex items-center justify-center w-9 h-9 rounded-xl border-2 text-white font-bold text-base ${colorClass} shadow-xl transition-transform hover:scale-110 cursor-pointer">
                  <span>🛕</span>
                 </div>`,
          className: "custom-marker-icon",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker(h.coords, { icon }).addTo(map);

        marker.on("click", () => {
          setSelectedNode({
            type: "historic",
            data: h,
            risk: riskStatus,
          });
        });

        markersRef.current[`hist-${h.id}`] = marker;
      });
    }

    // 3. วาดมาร์กเกอร์พื้นที่เกษตรกร
    if (layers.agri) {
      agriculturalFields.forEach((a) => {
        if (a.status === "harvested") return; // ข้ามแปลงที่เกี่ยวแล้วเพื่อลดความรก

        const isFlooded = waterLevel >= a.elevation;
        const isWarning = !isFlooded && waterLevel >= a.elevation - 0.3;

        let riskStatus: "high" | "warning" | "safe" = "safe";
        let colorClass = "bg-emerald-700 border-emerald-500";

        if (isFlooded) {
          colorClass = "bg-red-800 border-red-500 animate-pulse";
          riskStatus = "high";
        } else if (isWarning) {
          colorClass = "bg-amber-700 border-amber-500";
          riskStatus = "warning";
        } else {
          colorClass = "bg-green-700 border-green-500";
        }

        const icon = L.divIcon({
          html: `<div class="relative flex items-center justify-center w-8 h-8 rounded-lg border-2 text-white font-bold text-xs ${colorClass} shadow-lg transition-transform hover:scale-110 cursor-pointer">
                  <span>🌾</span>
                 </div>`,
          className: "custom-marker-icon",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker(a.coords, { icon }).addTo(map);

        marker.on("click", () => {
          setSelectedNode({
            type: "agri",
            data: a,
            risk: riskStatus,
          });
        });

        markersRef.current[`agri-${a.id}`] = marker;
      });
    }
  }, [layers.vuln, layers.historic, layers.agri, waterLevel, vulnerableCitizens, historicSites, agriculturalFields]);

  // การเปลี่ยนระดับน้ำจำลองแบบเรียลไทม์
  const handleWaterLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const updated = {
      communities,
      vulnerableCitizens,
      historicSites,
      agriculturalFields,
      waterLevel: val,
    };
    setData(updated);
    saveStoredData(updated);
    window.dispatchEvent(new Event("waterLevelUpdate"));

    // อัปเดตสถานะของไอเทมที่เลือกอยู่ใน Inspector ทันที
    if (selectedNode) {
      let isFlooded = false;
      let isWarning = false;
      if (selectedNode.type === "vulnerable") {
        const comm = communities.find((v) => v.id === selectedNode.data.communityId);
        const elev = comm ? comm.elevation : 1.5;
        isFlooded = val >= elev;
        isWarning = !isFlooded && val >= elev - 0.3;
      } else {
        isFlooded = val >= selectedNode.data.elevation;
        isWarning = !isFlooded && val >= selectedNode.data.elevation - 0.3;
      }
      setSelectedNode({
        ...selectedNode,
        risk: isFlooded ? "high" : isWarning ? "warning" : "safe",
      });
    }
  };

  // ดำเนินการช่วยเหลือจำลองจากหน้าแผนที่
  const executeAction = (actionType: string) => {
    if (!selectedNode) return;

    if (selectedNode.type === "vulnerable") {
      const updatedList = vulnerableCitizens.map((c) =>
        c.id === selectedNode.data.id
          ? { ...c, status: actionType as "pending" | "contacted" | "evacuated" | "safe" }
          : c
      );
      const updated = { ...data, vulnerableCitizens: updatedList };
      setData(updated);
      saveStoredData(updated);
      setSelectedNode({
        ...selectedNode,
        data: { ...selectedNode.data, status: actionType },
      });
      window.dispatchEvent(new Event("waterLevelUpdate"));
    } else if (selectedNode.type === "historic") {
      const updatedList = historicSites.map((h) =>
        h.id === selectedNode.data.id
          ? { ...h, sandbagStatus: actionType as "sufficient" | "need_reinforcement" | "critical", barrierHeight: actionType === "sufficient" ? h.barrierHeight + 0.4 : h.barrierHeight }
          : h
      );
      const updated = { ...data, historicSites: updatedList };
      setData(updated);
      saveStoredData(updated);
      setSelectedNode({
        ...selectedNode,
        data: { ...selectedNode.data, sandbagStatus: actionType, barrierHeight: actionType === "sufficient" ? selectedNode.data.barrierHeight + 0.4 : selectedNode.data.barrierHeight },
      });
      window.dispatchEvent(new Event("waterLevelUpdate"));
    } else if (selectedNode.type === "agri") {
      const updatedList = agriculturalFields.map((a) =>
        a.id === selectedNode.data.id ? { ...a, status: actionType as any } : a
      );
      const updated = { ...data, agriculturalFields: updatedList };
      setData(updated);
      saveStoredData(updated);
      setSelectedNode({
        ...selectedNode,
        data: { ...selectedNode.data, status: actionType },
      });
      window.dispatchEvent(new Event("waterLevelUpdate"));
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row overflow-hidden bg-slate-950">
      {/* แผงควบคุมด้านข้างซ้าย (Control Sidebar) */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/90 backdrop-blur-md p-5 flex flex-col justify-between overflow-y-auto z-10 shrink-0">
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-blue-400" /> ควบคุมแผนที่วิเคราะห์
            </h2>
            <p className="text-xxs text-slate-400 mt-1">วิเคราะห์เชิงพื้นที่และพิกัดกลุ่มเปราะบาง-โบราณสถาน</p>
          </div>

          {/* สไลเดอร์ระดับน้ำ */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">ความลึกแม่น้ำจำลอง:</span>
              <span className={`font-mono font-bold ${waterLevel >= 2.5 ? "text-rose-400" : "text-blue-400"}`}>
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
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="text-[9px] text-slate-500 flex justify-between">
              <span>1.0ม. ปกติ</span>
              <span>2.5ม. ตลิ่งล้น</span>
              <span>3.5ม. วิกฤตหนัก</span>
            </div>
          </div>

          {/* สลับการเปิดปิดเลเยอร์ GIS */}
          <div className="space-y-2.5">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">ชั้นข้อมูลเชิงพื้นที่ (KMZ)</span>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-950/30 border border-slate-850 hover:bg-slate-800/20 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={layers.boundary}
                  onChange={(e) => setLayers({ ...layers, boundary: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 bg-slate-900 border-slate-800"
                />
                <span className="text-slate-200">ขอบเขตเทศบาลตำบล</span>
              </label>

              <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-950/30 border border-slate-850 hover:bg-slate-800/20 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={layers.government}
                  onChange={(e) => setLayers({ ...layers, government: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 bg-slate-900 border-slate-800"
                />
                <span className="text-slate-200">สถานที่ราชการสำคัญ</span>
              </label>

              <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-950/30 border border-slate-850 hover:bg-slate-800/20 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={layers.buildings}
                  onChange={(e) => setLayers({ ...layers, buildings: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 bg-slate-900 border-slate-800"
                />
                <span className="text-slate-200">สิ่งปลูกสร้าง/อาคาร (ละเอียด)</span>
              </label>
            </div>
          </div>

          {/* สลับการเปิดปิดจุดความช่วยเหลือ */}
          <div className="space-y-2.5">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">จุดสนับสนุนตัดสินใจภัยพิบัติ</span>
            <div className="space-y-1.5">
              <label className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/30 border border-slate-850 hover:bg-slate-800/20 cursor-pointer text-xs">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={layers.vuln}
                    onChange={(e) => setLayers({ ...layers, vuln: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 bg-slate-900 border-slate-800"
                  />
                  <span className="text-slate-200">👵 กลุ่มเปราะบาง</span>
                </div>
                <span className="text-xxs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {vulnerableCitizens.length}
                </span>
              </label>

              <label className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/30 border border-slate-850 hover:bg-slate-800/20 cursor-pointer text-xs">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={layers.historic}
                    onChange={(e) => setLayers({ ...layers, historic: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 bg-slate-900 border-slate-800"
                  />
                  <span className="text-slate-200">🛕 โบราณสถานริมน้ำ</span>
                </div>
                <span className="text-xxs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {historicSites.length}
                </span>
              </label>

              <label className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/30 border border-slate-850 hover:bg-slate-800/20 cursor-pointer text-xs">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={layers.agri}
                    onChange={(e) => setLayers({ ...layers, agri: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 bg-slate-900 border-slate-800"
                  />
                  <span className="text-slate-200">🌾 แปลงนาข้าวเสี่ยงภัย</span>
                </div>
                <span className="text-xxs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {agriculturalFields.filter(a => a.status !== "harvested").length}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* แผงคำอธิบายรหัสสี (Legend) */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">ระดับความเสี่ยงภัย</span>
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
            <div className="p-1 rounded bg-rose-950/60 border border-rose-800 text-rose-400">🔴 ท่วม/วิกฤต</div>
            <div className="p-1 rounded bg-amber-950/60 border border-amber-800 text-amber-400">🟡 เฝ้าระวังสูง</div>
            <div className="p-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400">🟢 ปลอดภัย</div>
          </div>
        </div>
      </div>

      {/* แผนที่หลักและส่วนตรวจสอบรายละเอียด (Map and Inspector) */}
      <div className="flex-1 relative h-full">
        {/* คอนเทนเนอร์แผนที่ Leaflet */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* กล่องตรวจสอบรายละเอียดจุดที่คลิก (Inspector Overlay) - เลื่อนขึ้นจากขวาบน */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-10 w-80 md:w-96 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-md p-5 shadow-2xl text-xs space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {selectedNode.type === "vulnerable" ? "👵" : selectedNode.type === "historic" ? "🛕" : "🌾"}
                </span>
                <div>
                  <h3 className="font-black text-sm text-slate-100">
                    {selectedNode.type === "vulnerable" ? "ข้อมูลกลุ่มเปราะบาง" : selectedNode.type === "historic" ? "โบราณสถาน" : "แปลงนาเกษตรกร"}
                  </h3>
                  <span className="text-xxs text-slate-400">พิกัด GIS โลคัลในเขตพื้นที่</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-lg text-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>

            {/* ส่วนคำนวณและแสดงระดับความเสี่ยงแบบเรียลไทม์ */}
            <div className="p-3 rounded-xl border flex items-center justify-between bg-slate-950/50 border-slate-800">
              <span className="text-slate-400 font-medium">ความเสี่ยงภายใต้ระดับน้ำปัจจุบัน:</span>
              {selectedNode.risk === "high" ? (
                <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold animate-pulse text-xxs">🔴 วิกฤต/น้ำท่วม</span>
              ) : selectedNode.risk === "warning" ? (
                <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold text-xxs">🟡 น้ำปริ่มกระสอบทราย</span>
              ) : (
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-xxs">🟢 ปลอดภัย</span>
              )}
            </div>

            {/* รายละเอียดเนื้อหาข้อมูลแต่ละประเภท */}
            <div className="space-y-2.5 text-slate-350">
              {selectedNode.type === "vulnerable" && (
                <>
                  <div className="flex justify-between"><span className="text-slate-400">ชื่อ-สกุล:</span><span className="font-bold text-slate-100">{selectedNode.data.name} ({selectedNode.data.age} ปี)</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">ประเภท:</span><span className="text-blue-300 font-medium">{selectedNode.data.typeName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">ชุมชนสังกัด:</span><span>{selectedNode.data.communityName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">ผู้ดูแลติดต่อ:</span><span>{selectedNode.data.contactName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">เบอร์โทรศัพท์:</span><span className="font-mono flex items-center gap-1"><Phone className="h-3 w-3 inline text-slate-500" /> {selectedNode.data.phone}</span></div>
                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-850"><span className="text-slate-400 font-bold block mb-1">ความต้องการทางการแพทย์:</span><span className="text-slate-200">{selectedNode.data.medicalNeeds}</span></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-400">สถานะอพยพ:</span>
                    <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase ${
                      selectedNode.data.status === "evacuated" ? "bg-blue-900/60 text-blue-300 border border-blue-800" :
                      selectedNode.data.status === "contacted" ? "bg-amber-900/60 text-amber-300 border border-amber-800" : "bg-slate-800 text-slate-400"
                    }`}>
                      {selectedNode.data.status === "evacuated" ? "ย้ายแล้ว" : selectedNode.data.status === "contacted" ? "ติดต่อแล้ว" : "รอน้ำท่วม"}
                    </span>
                  </div>
                  {/* การตัดสินใจช่วยเหลือ */}
                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                    <button onClick={() => executeAction("contacted")} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-xxs transition-colors">ติดต่อแล้ว</button>
                    <button onClick={() => executeAction("evacuated")} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xxs transition-all shadow-md shadow-blue-500/10">ทีมอพยพด่วน</button>
                  </div>
                </>
              )}

              {selectedNode.type === "historic" && (
                <>
                  <div className="flex justify-between"><span className="text-slate-400">ชื่อสถานที่:</span><span className="font-bold text-slate-100">{selectedNode.data.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">ความสูงพื้นดิน:</span><span>{selectedNode.data.elevation} เมตร (รทก.)</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">แนวคันกั้นน้ำเสริม:</span><span>{selectedNode.data.barrierHeight.toFixed(2)} เมตร</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">ระยะห่างแม่น้ำ:</span><span>{selectedNode.data.distanceToRiver} เมตร</span></div>
                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-850"><span className="text-slate-400 font-bold block mb-1">ความสำคัญทางประวัติศาสตร์:</span><span className="text-slate-200 leading-relaxed">{selectedNode.data.history}</span></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-400">การป้องกันคันกั้นน้ำ:</span>
                    <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase ${
                      selectedNode.data.sandbagStatus === "sufficient" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" :
                      selectedNode.data.sandbagStatus === "need_reinforcement" ? "bg-amber-950 text-amber-400 border border-amber-800" : "bg-rose-950 text-rose-400 border border-rose-800 animate-pulse"
                    }`}>
                      {selectedNode.data.sandbagStatus === "sufficient" ? "แข็งแรงดี" : selectedNode.data.sandbagStatus === "need_reinforcement" ? "ต้องเสริมอีก" : "อันตรายล้นตลิ่ง"}
                    </span>
                  </div>
                  {/* การตัดสินใจช่วยเหลือ */}
                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                    <button onClick={() => executeAction("sufficient")} className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xxs transition-colors w-full">
                      🚀 สั่งระดมกระสอบทรายเสริมตลิ่ง (+40 ซม.)
                    </button>
                  </div>
                </>
              )}

              {selectedNode.type === "agri" && (
                <>
                  <div className="flex justify-between"><span className="text-slate-400">เกษตรกรผู้ดูแล:</span><span className="font-bold text-slate-100">{selectedNode.data.farmerName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">ประเภทพืชผล:</span><span className="text-amber-300 font-semibold">{selectedNode.data.cropType}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">ขนาดแปลงนา:</span><span>{selectedNode.data.areaRai} ไร่</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">อายุต้นข้าว:</span><span>{selectedNode.data.ageDays} วัน</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400">ความพร้อมเก็บเกี่ยว:</span>
                    <span className="font-mono font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{selectedNode.data.harvestReadiness}%</span>
                  </div>
                  <div className="flex justify-between"><span className="text-slate-400">ระดับระดับน้ำวิกฤตแปลง:</span><span>{selectedNode.data.elevation} เมตร</span></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-400">สถานะแปลงปัจจุบัน:</span>
                    <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase ${
                      selectedNode.data.status === "warning" ? "bg-amber-950 text-amber-400 border border-amber-800" :
                      selectedNode.data.status === "harvesting" ? "bg-blue-950 text-blue-400 border border-blue-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    }`}>
                      {selectedNode.data.status === "warning" ? "เริ่มมีความเสี่ยง" : selectedNode.data.status === "harvesting" ? "รถเกี่ยวอยู่หน้างาน" : "ปลอดภัยดี"}
                    </span>
                  </div>
                  {/* การตัดสินใจช่วยเหลือ */}
                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                    <button onClick={() => executeAction("harvesting")} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xxs transition-colors">เรียกรถเกี่ยวข้าวลงพื้นที่</button>
                    <button onClick={() => executeAction("harvested")} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xxs transition-colors">เกี่ยวเสร็จสิ้น (ปลอดภัย)</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ป้ายเตือนว่ากำลังอยู่ในโหมดจำลองระดับน้ำ */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-lg py-1.5 px-3 flex items-center gap-2 text-slate-300 text-[10px]">
          <Info className="h-3.5 w-3.5 text-blue-400" />
          <span>คลิกที่สัญลักษณ์แต่ละประเภทบนแผนที่เพื่อเปิดดูแผงข้อมูลการวิเคราะห์และข้อแนะนำในการตัดสินใจช่วยเหลือ ปภ.</span>
        </div>
      </div>
    </div>
  );
}
