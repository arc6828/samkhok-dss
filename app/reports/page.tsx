// app/reports/page.tsx
export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">รายงานสรุป</h1>

      <ul className="bg-white p-4 rounded shadow list-disc pl-6">
        <li>รายงานพื้นที่เสี่ยงสูง</li>
        <li>รายงานกลุ่มเปราะบาง</li>
        <li>รายงานการตัดสินใจช่วยเหลือ</li>
      </ul>

      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Export PDF (Mock)
      </button>
    </div>
  )
}
