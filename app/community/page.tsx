// app/community/page.tsx
export default function CommunityPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ข้อมูลชุมชน</h1>

      <table className="w-full border bg-white">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">ชุมชน</th>
            <th className="border p-2">ครัวเรือน</th>
            <th className="border p-2">กลุ่มเปราะบาง</th>
            <th className="border p-2">ระดับน้ำ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">ชุมชน A</td>
            <td className="border p-2">120</td>
            <td className="border p-2">35</td>
            <td className="border p-2">สูง</td>
          </tr>
          <tr>
            <td className="border p-2">ชุมชน B</td>
            <td className="border p-2">80</td>
            <td className="border p-2">23</td>
            <td className="border p-2">กลาง</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
