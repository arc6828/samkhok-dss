// app/login/page.tsx
export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4 text-center">เข้าสู่ระบบ</h1>

      <input className="border p-2 w-full mb-3" placeholder="Username" />
      <input
        className="border p-2 w-full mb-4"
        type="password"
        placeholder="Password"
      />

      <a
        href="/dashboard"
        className="block text-center bg-blue-600 text-white py-2 rounded"
      >
        Login (Mock)
      </a>
    </div>
  );
}
