// app/priority/page.tsx
export default function PriorityPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">การจัดลำดับความช่วยเหลือ</h1>

      <ol className="bg-white p-4 rounded shadow">
        <li>🥇 ชุมชน A — คะแนนความเสี่ยง 85.2 (สูงมาก)</li>
        <li>🥈 ชุมชน B — คะแนนความเสี่ยง 63.4 (สูง)</li>
        <li>🥉 ชุมชน C — คะแนนความเสี่ยง 28.1 (ต่ำ)</li>
      </ol>

      <p className="text-sm text-gray-600 mt-3">
        * พิจารณาจากระดับน้ำและกลุ่มเปราะบาง
      </p>
    </div>
  );
}
