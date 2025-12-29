// app/alert/page.tsx
export default function AlertPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ระบบแจ้งเตือนภัย</h1>

      <div className="bg-white p-4 rounded shadow max-w-lg">
        <select className="border p-2 w-full mb-3">
          <option>ระดับความเสี่ยงสูง</option>
          <option>ระดับความเสี่ยงปานกลาง</option>
        </select>

        <textarea
          className="border p-2 w-full mb-3"
          rows={3}
          placeholder="ข้อความแจ้งเตือน"
        />

        <button className="bg-red-600 text-white px-4 py-2 rounded">
          ส่งแจ้งเตือน (Mock)
        </button>
      </div>
    </div>
  );
}
