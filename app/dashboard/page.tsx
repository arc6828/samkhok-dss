// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard ภาพรวม</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-100 p-4 rounded">🔴 เสี่ยงสูง<br />3 ชุมชน</div>
        <div className="bg-yellow-100 p-4 rounded">🟠 เสี่ยงปานกลาง<br />5 ชุมชน</div>
        <div className="bg-green-100 p-4 rounded">🟢 เสี่ยงต่ำ<br />7 ชุมชน</div>
      </div>

      <div className="flex gap-4">
        <a className="btn" href="/map">ดูแผนที่</a>
        <a className="btn" href="/priority">จัดลำดับช่วยเหลือ</a>
      </div>
    </div>
  )
}
