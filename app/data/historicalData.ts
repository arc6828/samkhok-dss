// app/data/historicalData.ts

export interface HistoricalRecord {
  date: string; // YYYY-MM
  month: number; // 1 - 12
  monthName: string; // "ม.ค.", "ก.พ.", ...
  year: number; // ค.ศ. (e.g. 2022)
  yearThai: number; // พ.ศ. (e.g. 2565)
  value: number; // ระดับน้ำ (ม. รทก.) หรือ ปริมาตรน้ำเขื่อน (% ความจุ)
  inflow?: number; // น้ำไหลเข้า (ล้าน ลบ.ม./วัน) - เฉพาะเขื่อน
  outflow?: number; // น้ำระบายออก (ล้าน ลบ.ม./วัน) - เฉพาะเขื่อน
  storageVolume?: number; // ปริมาตรน้ำในอ่าง (ล้าน ลบ.ม.) - เฉพาะเขื่อน
}

export interface StationMetadata {
  id: string;
  name: string;
  type: "dam" | "station";
  province: string;
  river?: string;
  criticalThreshold: number; // ระดับวิกฤต (ม. รทก. หรือ % ความจุ)
  unit: string;
  capacity?: number; // ความจุน้ำอ่างเก็บน้ำสูงสุด (ล้าน ลบ.ม.) - เฉพาะเขื่อน
  damId?: number; // ไอดีเขื่อนสำหรับเชื่อมโยง API ของ สสน. (thaiwater.net)
}

export const historicalStations: StationMetadata[] = [
  // เขื่อนหลัก
  { id: "bhumibol", name: "เขื่อนภูมิพล", type: "dam", province: "ตาก", river: "ปิง", criticalThreshold: 85, unit: "%", capacity: 13462, damId: 1 },
  { id: "ubolratana", name: "เขื่อนอุบลรัตน์", type: "dam", province: "ขอนแก่น", river: "พอง", criticalThreshold: 85, unit: "%", capacity: 2431, damId: 2 },
  { id: "sirikit", name: "เขื่อนสิริกิติ์", type: "dam", province: "อุตรดิตถ์", river: "น่าน", criticalThreshold: 85, unit: "%", capacity: 9510, damId: 12 },
  { id: "kwainoi", name: "เขื่อนแควน้อยบำรุงแดน", type: "dam", province: "พิษณุโลก", river: "แควน้อย", criticalThreshold: 90, unit: "%", capacity: 939, damId: 17 },
  { id: "pasak", name: "เขื่อนป่าสักชลสิทธิ์", type: "dam", province: "ลพบุรี", river: "ป่าสัก", criticalThreshold: 90, unit: "%", capacity: 960, damId: 3 },
  { id: "chaophraya_dam", name: "เขื่อนเจ้าพระยา (C.13)", type: "dam", province: "ชัยนาท", river: "เจ้าพระยา", criticalThreshold: 80, unit: "%", capacity: 150 }, // ใช้ % ระบายกักเก็บ

  // จุดตรวจวัดใกล้เคียงรอบสามโคก
  { id: "c29a", name: "สถานี C.29A (บางไทร)", type: "station", province: "พระนครศรีอยุธยา", river: "เจ้าพระยา", criticalThreshold: 3.5, unit: "ม. (รทก.)" },
  { id: "c35", name: "สถานี C.35 (บางบาล)", type: "station", province: "พระนครศรีอยุธยา", river: "เจ้าพระยา", criticalThreshold: 4.2, unit: "ม. (รทก.)" },
  { id: "c7a", name: "สถานี C.7A (อ่างทอง)", type: "station", province: "อ่างทอง", river: "เจ้าพระยา", criticalThreshold: 7.5, unit: "ม. (รทก.)" },
  { id: "c12", name: "สถานี C.12 (สิงห์บุรี)", type: "station", province: "สิงห์บุรี", river: "เจ้าพระยา", criticalThreshold: 11.2, unit: "ม. (รทก.)" },
  { id: "samkhok", name: "สถานีตลาดสามโคก (ปทุมธานี)", type: "station", province: "ปทุมธานี", river: "เจ้าพระยา", criticalThreshold: 2.5, unit: "ม. (รทก.)" },
  { id: "pathum", name: "สถานีสะพานปทุมธานี 1", type: "station", province: "ปทุมธานี", river: "เจ้าพระยา", criticalThreshold: 2.7, unit: "ม. (รทก.)" },
  { id: "rama4", name: "สถานีปากเกร็ด (สะพานพระราม 4)", type: "station", province: "นนทบุรี", river: "เจ้าพระยา", criticalThreshold: 2.3, unit: "ม. (รทก.)" },
  { id: "memorial", name: "สถานีสะพานพุทธ (กรุงเทพฯ)", type: "station", province: "กรุงเทพฯ", river: "เจ้าพระยา", criticalThreshold: 2.1, unit: "ม. (รทก.)" },
  { id: "c2", name: "สถานี C.2 (นครสวรรค์)", type: "station", province: "นครสวรรค์", river: "เจ้าพระยา", criticalThreshold: 26.2, unit: "ม. (รทก.)" },
  { id: "c3", name: "สถานี C.3 (ยม-น่าน)", type: "station", province: "นครสวรรค์", river: "ยม-น่าน", criticalThreshold: 10.0, unit: "ม. (รทก.)" },
];

const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

// ดึงข้อมูลสำหรับปีเฉพาะเจาะจงหรือทั้งหมดแบบ deterministic (เสมือนจริงและค่าไม่เปลี่ยนเมื่อรีเฟรช)
export const generateHistoricalData = (stationId: string): HistoricalRecord[] => {
  const station = historicalStations.find(s => s.id === stationId);
  if (!station) return [];

  const data: HistoricalRecord[] = [];
  const startYear = 2016; // 2559
  const endYear = 2026;   // 2569

  // ค่าปีพิเศษ
  // 2022 (2565) - น้ำท่วมใหญ่
  // 2024 (2567) - น้ำหลากปานกลางค่อนข้างสูง
  // 2019-2020 (2562-2563) - ภัยแล้งรุนแรง เอลนีโญ
  const getYearWetnessFactor = (y: number): number => {
    if (y === 2022) return 1.35; // น้ำมากที่สุด
    if (y === 2024) return 1.18; // น้ำค่อนข้างมาก
    if (y === 2019) return 0.65; // แล้งจัด
    if (y === 2020) return 0.72; // แล้ง
    if (y === 2016) return 0.85; // ค่อนข้างแล้ง
    return 1.0; // ปีปกติ (2017, 2018, 2021, 2023, 2025, 2026)
  };

  for (let year = startYear; year <= endYear; year++) {
    const wetness = getYearWetnessFactor(year);

    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, "0");
      const dateStr = `${year}-${monthStr}`;

      // อ้างอิงทิศทางตามฤดูกาล: จุดสูงสุดในเดือนตุลาคม (10) และจุดต่ำสุดในเมษายน (4)
      // ปรับปรุงสูตร Math.sin ให้ยอดคลื่นตรงกับตารางฤดูกาลของไทย
      const seasonRad = ((month - 4) / 12) * 2 * Math.PI;
      const seasonalFactor = (Math.sin(seasonRad - Math.PI / 2) + 1) / 2; // อยู่ระหว่าง 0 ถึง 1

      // ตัวแปรแกว่งเล็กน้อยตามสมการ Sine แบบ Deterministic เพื่อไม่ให้เป็นเส้นกราฟเรียบเกินไป
      const microVariance = Math.sin(year * 17 + month * 31) * 0.05;

      let value = 0;
      let record: HistoricalRecord;

      if (station.type === "dam") {
        // อ่างเก็บน้ำ/เขื่อนหลัก (แสดงผลเป็น % ความจุของอ่าง)
        // ระดับน้ำกักเก็บเฉลี่ย 40% - 85%
        const baseMin = 35;
        const baseMax = 82;
        value = baseMin + (baseMax - baseMin) * seasonalFactor * wetness + microVariance * 5;
        
        // ขอบเขตค่า % ไม่ให้เกิน 100 หรือต่ำกว่า 15
        value = Math.min(100, Math.max(15, parseFloat(value.toFixed(1))));

        // คำนวณปริมาตรกักเก็บจริง (ล้าน ลบ.ม.)
        const capacity = station.capacity || 1000;
        const storageVolume = parseFloat(((value / 100) * capacity).toFixed(1));

        // คำนวณน้ำไหลเข้า (Inflow) และไหลออก (Outflow)
        // Inflow จะพุ่งสูงในช่วงสิงหาคม - ตุลาคม
        const inflowBase = capacity * 0.002; // ค่าเฉลี่ยการไหล
        const inflow = parseFloat((inflowBase * (seasonalFactor * 2.5 * wetness + 0.2) + Math.abs(microVariance) * 10).toFixed(1));

        // Outflow จะสัมพันธ์กับ Inflow และ % กักเก็บ (หากน้ำเต็มจะระบายออกมากเพื่อรักษาสมดุล)
        const outflowRatio = value > 80 ? 1.2 : value < 40 ? 0.5 : 0.85;
        const outflow = parseFloat((inflow * outflowRatio + (value > 85 ? (value - 85) * 5 : 0)).toFixed(1));

        record = {
          date: dateStr,
          month,
          monthName: THAI_MONTHS[month - 1],
          year,
          yearThai: year + 543,
          value,
          storageVolume,
          inflow: Math.max(1, inflow),
          outflow: Math.max(0.5, outflow)
        };
      } else {
        // สถานีโทรมาตรระดับน้ำ (แสดงระดับเมตร รทก.)
        // แต่ละสถานีมีระดับความสูงตลิ่งเฉลี่ยและระดับน้ำปกติที่ต่างกัน
        let baseMin = 0.5;
        let baseMax = 2.0;

        switch (station.id) {
          case "c2": // นครสวรรค์ ระดับตลิ่งสูงมาก
            baseMin = 14.5;
            baseMax = 25.5;
            break;
          case "c3": // ยม-น่าน
            baseMin = 3.5;
            baseMax = 9.2;
            break;
          case "c12": // สิงห์บุรี
            baseMin = 4.5;
            baseMax = 10.8;
            break;
          case "c7a": // อ่างทอง
            baseMin = 2.0;
            baseMax = 7.1;
            break;
          case "c35": // บางบาล
            baseMin = 1.0;
            baseMax = 3.9;
            break;
          case "c29a": // บางไทร (ดัชนีก่อนสามโคก)
            baseMin = 0.6;
            baseMax = 3.2;
            break;
          case "samkhok": // ตลาดสามโคก
            baseMin = 0.5;
            baseMax = 2.3;
            break;
          case "pathum": // สะพานปทุมธานี 1
            baseMin = 0.6;
            baseMax = 2.5;
            break;
          case "rama4": // ปากเกร็ด
            baseMin = 0.4;
            baseMax = 2.1;
            break;
          case "memorial": // สะพานพุทธ
            baseMin = 0.3;
            baseMax = 1.9;
            break;
        }

        const range = baseMax - baseMin;
        // คำนวณระดับน้ำตามฤดูกาลและ wetness
        value = baseMin + range * seasonalFactor * wetness + microVariance * (range * 0.1);
        
        // ขอบเขตค่าสูงสุดเมื่อน้ำล้นตลิ่งวิกฤต
        value = parseFloat(value.toFixed(2));

        record = {
          date: dateStr,
          month,
          monthName: THAI_MONTHS[month - 1],
          year,
          yearThai: year + 543,
          value
        };
      }

      data.push(record);
    }
  }

  return data;
};
