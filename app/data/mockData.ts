// app/data/mockData.ts

export interface Community {
  id: string;
  name: string;
  moo: number; // หมู่
  households: number;
  vulnerableCount: number;
  elevation: number; // ความสูงพื้นที่จากระดับน้ำทะเลปานกลาง (เมตร)
  barrierHeight: number; // ความสูงของคันกั้นน้ำ/กระสอบทรายที่มีอยู่ (เมตร)
  sandbagStatus: "sufficient" | "need_reinforcement" | "critical";
  evacuationCenter: string;
  coords: [number, number]; // [lat, lng]
}

export interface VulnerableCitizen {
  id: string;
  name: string;
  age: number;
  gender: "ชาย" | "หญิง";
  type: "elderly" | "disabled" | "pregnant" | "bedridden";
  typeName: string; // คำอธิบายภาษาไทย เช่น ผู้สูงอายุ, ผู้พิการ, ผู้ป่วยติดเตียง, สตรีตั้งครรภ์
  communityId: string;
  communityName: string;
  phone: string;
  contactName: string;
  medicalNeeds: string;
  status: "pending" | "contacted" | "evacuated" | "safe";
  coords: [number, number];
}

export interface HistoricSite {
  id: string;
  name: string;
  history: string;
  elevation: number; // เมตร
  barrierHeight: number; // เมตร
  sandbagStatus: "sufficient" | "need_reinforcement" | "critical";
  distanceToRiver: number; // เมตร
  imageUrl?: string;
  coords: [number, number];
}

export interface AgriculturalField {
  id: string;
  farmerName: string;
  cropType: string;
  areaRai: number;
  plantingDate: string; // YYYY-MM-DD
  ageDays: number;
  harvestReadiness: number; // 0 - 100 (%)
  elevation: number; // เมตร
  status: "safe" | "warning" | "harvesting" | "harvested" | "flooded";
  coords: [number, number];
}

// ข้อมูลจำลองสำหรับเริ่มต้น (Initial Data)

export const initialCommunities: Community[] = [
  {
    id: "comm-1",
    name: "ชุมชนบ้านปทุม (หมู่ 3)",
    moo: 3,
    households: 120,
    vulnerableCount: 14,
    elevation: 1.5,
    barrierHeight: 2.2,
    sandbagStatus: "need_reinforcement",
    evacuationCenter: "โรงเรียนวัดบ้านปทุม",
    coords: [14.0612, 100.5352],
  },
  {
    id: "comm-2",
    name: "ชุมชนวัดสิงห์ (หมู่ 2)",
    moo: 2,
    households: 85,
    vulnerableCount: 9,
    elevation: 1.2,
    barrierHeight: 2.0,
    sandbagStatus: "critical",
    evacuationCenter: "วัดสิงห์ (อาคารอเนกประสงค์)",
    coords: [14.0682, 100.5365],
  },
  {
    id: "comm-3",
    name: "ชุมชนวัดศาลาแดงเหนือ (หมู่ 1)",
    moo: 1,
    households: 95,
    vulnerableCount: 11,
    elevation: 1.0,
    barrierHeight: 1.8,
    sandbagStatus: "critical",
    evacuationCenter: "โรงเรียนวัดศาลาแดงเหนือ",
    coords: [14.0885, 100.5302],
  },
  {
    id: "comm-4",
    name: "ชุมชนเชียงรากใหญ่ (หมู่ 4)",
    moo: 4,
    households: 150,
    vulnerableCount: 22,
    elevation: 1.8,
    barrierHeight: 2.5,
    sandbagStatus: "sufficient",
    evacuationCenter: "เทศบาลตำบลสามโคก",
    coords: [14.0452, 100.5402],
  },
  {
    id: "comm-5",
    name: "ชุมชนบางเตย (หมู่ 5)",
    moo: 5,
    households: 110,
    vulnerableCount: 8,
    elevation: 2.0,
    barrierHeight: 2.7,
    sandbagStatus: "sufficient",
    evacuationCenter: "วัดบางเตยใน",
    coords: [14.0535, 100.5185],
  },
];

export const initialVulnerableCitizens: VulnerableCitizen[] = [
  {
    id: "vuln-1",
    name: "นางสมศรี รักษ์ดี",
    age: 82,
    gender: "หญิง",
    type: "elderly",
    typeName: "ผู้สูงอายุ (ช่วยเหลือตัวเองไม่ได้)",
    communityId: "comm-1",
    communityName: "ชุมชนบ้านปทุม (หมู่ 3)",
    phone: "081-234-5678",
    contactName: "นายสมชาย รักษ์ดี (บุตรชาย)",
    medicalNeeds: "ยารักษาโรคความดันโลหิตสูงและเบาหวาน",
    status: "pending",
    coords: [14.0615, 100.5355],
  },
  {
    id: "vuln-2",
    name: "นายบุญมี มีชัย",
    age: 74,
    gender: "ชาย",
    type: "bedridden",
    typeName: "ผู้ป่วยติดเตียง",
    communityId: "comm-2",
    communityName: "ชุมชนวัดสิงห์ (หมู่ 2)",
    phone: "089-876-5432",
    contactName: "นางนภา มีชัย (ภรรยา)",
    medicalNeeds: "ต้องใช้ถังออกซิเจนสำรอง และแผ่นรองซับ",
    status: "contacted",
    coords: [14.0685, 100.5369],
  },
  {
    id: "vuln-3",
    name: "นางสาวอารีวรรณ นามดี",
    age: 28,
    gender: "หญิง",
    type: "pregnant",
    typeName: "สตรีตั้งครรภ์ (7 เดือน)",
    communityId: "comm-3",
    communityName: "ชุมชนวัดศาลาแดงเหนือ (หมู่ 1)",
    phone: "085-555-4433",
    contactName: "นายวิชัย นามดี (สามี)",
    medicalNeeds: "ใกล้นัดตรวจครรภ์, ยาบำรุงครรภ์",
    status: "pending",
    coords: [14.0890, 100.5305],
  },
  {
    id: "vuln-4",
    name: "เด็กชายจ๊อบ พิการซ้ำซ้อน",
    age: 12,
    gender: "ชาย",
    type: "disabled",
    typeName: "ผู้พิการทางการเคลื่อนไหว",
    communityId: "comm-1",
    communityName: "ชุมชนบ้านปทุม (หมู่ 3)",
    phone: "084-321-0987",
    contactName: "นางอรทัย ใจดี (มารดา)",
    medicalNeeds: "รถเข็นผู้พิการ (Wheelchair)",
    status: "evacuated",
    coords: [14.0610, 100.5349],
  },
  {
    id: "vuln-5",
    name: "ยายทองดี มีทรัพย์",
    age: 91,
    gender: "หญิง",
    type: "bedridden",
    typeName: "ผู้ป่วยติดเตียง",
    communityId: "comm-3",
    communityName: "ชุมชนวัดศาลาแดงเหนือ (หมู่ 1)",
    phone: "082-111-2222",
    contactName: "นางสาวสมใจ มีทรัพย์ (หลานสาว)",
    medicalNeeds: "ยาบำรุงหัวใจ, อาหารเหลวทางการแพทย์",
    status: "pending",
    coords: [14.0882, 100.5298],
  },
  {
    id: "vuln-6",
    name: "นายวิโรจน์ แสงแก้ว",
    age: 68,
    gender: "ชาย",
    type: "disabled",
    typeName: "ผู้ทุพพลภาพ (ทางการเห็น)",
    communityId: "comm-4",
    communityName: "ชุมชนเชียงรากใหญ่ (หมู่ 4)",
    phone: "086-123-9988",
    contactName: "นางสายใจ แสงแก้ว (ภรรยา)",
    medicalNeeds: "ต้องการคนนำทางในการอพยพ",
    status: "safe",
    coords: [14.0455, 100.5405],
  },
];

export const initialHistoricSites: HistoricSite[] = [
  {
    id: "hist-1",
    name: "วัดโบสถ์ (สามโคก)",
    history: "สร้างขึ้นในสมัยอยุธยา มีหลวงพ่อโตองค์ใหญ่ริมน้ำ เป็นจุดศูนย์รวมจิตใจและท่องเที่ยวสำคัญ",
    elevation: 1.6,
    barrierHeight: 2.4,
    sandbagStatus: "need_reinforcement",
    distanceToRiver: 15,
    coords: [14.0754, 100.5367],
  },
  {
    id: "hist-2",
    name: "วัดสิงห์ (โบราณสถานแห่งชาติ)",
    history: "วัดโบราณของชุมชนชาวมอญ มีโบสถ์เก่าแก่ หลวงพ่อโต และพิพิธภัณฑ์เครื่องปั้นดินเผาสามโคก",
    elevation: 1.3,
    barrierHeight: 2.1,
    sandbagStatus: "critical",
    distanceToRiver: 35,
    coords: [14.0681, 100.5375],
  },
  {
    id: "hist-3",
    name: "วัดศาลาแดงเหนือ",
    history: "วัดมอญโบราณ ริมฝั่งแม่น้ำเจ้าพระยาฝั่งตะวันตก อนุรักษ์วัฒนธรรมมอญและพระคัมภีร์ใบลานโบราณ",
    elevation: 1.1,
    barrierHeight: 1.9,
    sandbagStatus: "critical",
    distanceToRiver: 20,
    coords: [14.0895, 100.5312],
  },
  {
    id: "hist-4",
    name: "เจดีย์ทอง (วัดเจดีย์ทอง)",
    history: "เจดีย์ทรงรามัญแบบมอญ เลียนแบบเจดีย์จิตตะกอง อายุกว่า 160 ปี แหล่งโบราณคดีสำคัญ",
    elevation: 1.7,
    barrierHeight: 2.6,
    sandbagStatus: "sufficient",
    distanceToRiver: 50,
    coords: [14.0321, 100.5401],
  },
  {
    id: "hist-5",
    name: "โบราณสถานเตาเผาตุ่มสามโคก",
    history: "แหล่งเตาเผาโบราณผลิตตุ่มสามโคก เครื่องปั้นดินเผาเอกลักษณ์เมืองสามโคกสมัยอยุธยาตอนปลาย",
    elevation: 1.4,
    barrierHeight: 2.2,
    sandbagStatus: "need_reinforcement",
    distanceToRiver: 120,
    coords: [14.0592, 100.5305],
  },
];

export const initialAgriculturalFields: AgriculturalField[] = [
  {
    id: "agri-1",
    farmerName: "นายเกษม ชาวนาดี",
    cropType: "ข้าวปทุมธานี 1",
    areaRai: 25,
    plantingDate: "2026-03-01",
    ageDays: 104,
    harvestReadiness: 95, // ใกล้เก็บเกี่ยว
    elevation: 1.3,
    status: "warning",
    coords: [14.0722, 100.5215],
  },
  {
    id: "agri-2",
    farmerName: "นางพยอม กิ่งข้าว",
    cropType: "ข้าวมะลิ 105",
    areaRai: 40,
    plantingDate: "2026-02-15",
    ageDays: 118,
    harvestReadiness: 100, // พร้อมเก็บเกี่ยวทันที
    elevation: 1.1,
    status: "warning",
    coords: [14.0815, 100.5188],
  },
  {
    id: "agri-3",
    farmerName: "นายประพันธ์ ดำดี",
    cropType: "ข้าว กข 43",
    areaRai: 18,
    plantingDate: "2026-04-10",
    ageDays: 63,
    harvestReadiness: 55, // ยังไม่พร้อมเก็บเกี่ยว (ต้องการอีกประมาณ 30-40 วัน)
    elevation: 1.6,
    status: "safe",
    coords: [14.0482, 100.5288],
  },
  {
    id: "agri-4",
    farmerName: "นายสมชาย กสิกรรม",
    cropType: "ข้าว กข 85",
    areaRai: 30,
    plantingDate: "2026-03-15",
    ageDays: 90,
    harvestReadiness: 80, // อีกประมาณ 1-2 สัปดาห์เก็บเกี่ยวได้
    elevation: 1.2,
    status: "safe",
    coords: [14.0385, 100.5255],
  },
  {
    id: "agri-5",
    farmerName: "นางสุรีย์ มีนา",
    cropType: "ข้าวปทุมธานี 1",
    areaRai: 15,
    plantingDate: "2026-02-10",
    ageDays: 122,
    harvestReadiness: 100,
    elevation: 1.0,
    status: "harvested", // เก็บเกี่ยวแล้วเสร็จ
    coords: [14.0910, 100.5202],
  },
];

// ฟังก์ชันโหลดข้อมูลจาก LocalStorage (ช่วยรักษาสถานะแบบไดนามิกข้ามหน้า)
export const getStoredData = () => {
  if (typeof window === "undefined") {
    return {
      communities: initialCommunities,
      vulnerableCitizens: initialVulnerableCitizens,
      historicSites: initialHistoricSites,
      agriculturalFields: initialAgriculturalFields,
      waterLevel: 1.8, // ระดับน้ำจำลองเริ่มต้น (เมตร)
    };
  }

  const communities = localStorage.getItem("dss_communities");
  const vulnerableCitizens = localStorage.getItem("dss_vulnerable");
  const historicSites = localStorage.getItem("dss_historic");
  const agriculturalFields = localStorage.getItem("dss_agricultural");
  const waterLevel = localStorage.getItem("dss_water_level");

  return {
    communities: communities ? JSON.parse(communities) : initialCommunities,
    vulnerableCitizens: vulnerableCitizens
      ? JSON.parse(vulnerableCitizens)
      : initialVulnerableCitizens,
    historicSites: historicSites
      ? JSON.parse(historicSites)
      : initialHistoricSites,
    agriculturalFields: agriculturalFields
      ? JSON.parse(agriculturalFields)
      : initialAgriculturalFields,
    waterLevel: waterLevel ? parseFloat(waterLevel) : 1.8,
  };
};

// ฟังก์ชันบันทึกข้อมูลลง LocalStorage
export const saveStoredData = (data: {
  communities: Community[];
  vulnerableCitizens: VulnerableCitizen[];
  historicSites: HistoricSite[];
  agriculturalFields: AgriculturalField[];
  waterLevel: number;
}) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("dss_communities", JSON.stringify(data.communities));
  localStorage.setItem("dss_vulnerable", JSON.stringify(data.vulnerableCitizens));
  localStorage.setItem("dss_historic", JSON.stringify(data.historicSites));
  localStorage.setItem("dss_agricultural", JSON.stringify(data.agriculturalFields));
  localStorage.setItem("dss_water_level", data.waterLevel.toString());
};

// ฟังก์ชันรีเซ็ตข้อมูลเป็นค่าเริ่มต้น
export const resetStoredData = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("dss_communities");
  localStorage.removeItem("dss_vulnerable");
  localStorage.removeItem("dss_historic");
  localStorage.removeItem("dss_agricultural");
  localStorage.removeItem("dss_water_level");
};

// อัลกอริทึมคำนวณคะแนนความเร่งด่วนในการช่วยเหลือ (Decision Prioritization Algorithm)
export const calculatePriorityScore = (
  location: { elevation: number; barrierHeight: number; id: string },
  type: "community" | "historic" | "agriculture",
  waterLevel: number,
  weights: {
    waterThreat: number; // น้ำหนักของภัยคุกคามน้ำท่วม
    vulnerable: number; // น้ำหนักกลุ่มเปราะบาง (เฉพาะชุมชน)
    heritage: number; // น้ำหนักความสำคัญของโบราณสถาน (เฉพาะโบราณสถาน)
    economic: number; // น้ำหนักมูลค่าทางเศรษฐกิจ/ความก้าวหน้าการเกษตร (เฉพาะเกษตรกร)
  },
  extraData: {
    vulnerableCount?: number;
    harvestReadiness?: number;
    distanceToRiver?: number;
  }
): number => {
  // 1. คำนวณภัยคุกคามจากน้ำท่วม (Water Threat Score 0-100)
  // ระดับน้ำก้าวข้ามแนวคันกั้นน้ำ:
  const floodMargin = waterLevel - location.barrierHeight;
  let waterThreatScore = 0;
  if (floodMargin >= 0) {
    // น้ำท่วมแล้ว คันกั้นน้ำรับไม่ไหว คะแนนขึ้นตามระดับความลึก
    waterThreatScore = Math.min(100, 50 + floodMargin * 50);
  } else {
    // ยังไม่ท่วม แต่ถ้าเข้าใกล้คันกั้นน้ำ คะแนนจะค่อยๆ ขึ้น
    const freeboard = Math.abs(floodMargin); // ระยะห่างที่เหลือ
    waterThreatScore = Math.max(0, 50 - freeboard * 50);
  }

  // 2. คำนวณคะแนนตามลักษณะจุดประเมิน
  let baseScore = 0;
  let categoryWeightMultiplier = 0;

  if (type === "community") {
    // คะแนนกลุ่มเปราะบาง
    const vuln = extraData.vulnerableCount || 0;
    const vulnScore = Math.min(100, vuln * 5); // 20 คนขึ้นไปได้ 100 คะแนน
    baseScore =
      (waterThreatScore * weights.waterThreat + vulnScore * weights.vulnerable) /
      (weights.waterThreat + weights.vulnerable);
  } else if (type === "historic") {
    // โบราณสถาน: ยิ่งใกล้แม่น้ำยิ่งมีโอกาสคันพัง, มีคะแนนโบราณวัตถุประวัติศาสตร์ (Heritage Score)
    const distance = extraData.distanceToRiver || 100;
    const distanceScore = Math.max(0, 100 - distance); // ยิ่งใกล้ยิ่งสูง
    const heritageScore = 90; // ค่าคงที่สมมติของความสำคัญทางประวัติศาสตร์
    const vulnerabilityScore = (distanceScore + heritageScore) / 2;
    baseScore =
      (waterThreatScore * weights.waterThreat +
        vulnerabilityScore * weights.heritage) /
      (weights.waterThreat + weights.heritage);
  } else if (type === "agriculture") {
    // การเกษตร: พิจารณาความพร้อมในการเก็บเกี่ยว (ถ้าพร้อม 90% ขึ้นไปแต่น้ำกำลังท่วม คะแนนจะพุ่งขึ้นสูงสุดเพราะต้องการความช่วยเหลือรถเกี่ยวด่วน)
    const readiness = extraData.harvestReadiness || 0;
    let urgencyScore = 0;
    if (readiness >= 90) {
      urgencyScore = 100; // วิกฤต: ต้องดึงคนช่วยเกี่ยวทันที!
    } else if (readiness >= 60) {
      urgencyScore = 60; // ปานกลาง: พอเกี่ยวเขียวได้บ้าง
    } else {
      urgencyScore = 10; // ต่ำ: ยังเพาะปลูกอ่อนอยู่ ช่วยไปอาจได้ผลผลิตไม่คุ้มค่าเท่าชุมชน/โบราณสถาน
    }
    baseScore =
      (waterThreatScore * weights.waterThreat +
        urgencyScore * weights.economic) /
      (weights.waterThreat + weights.economic);
  }

  return Math.round(baseScore * 10) / 10;
};
