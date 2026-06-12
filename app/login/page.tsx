// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, User, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // จำลองล็อกอิน 1 วินาที
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        router.push("/dashboard");
      } else {
        setError("ชื่อผู้ใช้หรือรหัสผ่านจำลองไม่ถูกต้อง (คำแนะนำ: ใช้ admin / admin123)");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative space-y-6">
      {/* เอฟเฟกต์แสงไฟเรืองด้านหลัง */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur-xl -z-10 animate-pulse"></div>

      {/* ส่วนหัวแบรนด์ */}
      <div className="text-center space-y-2.5">
        <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-black tracking-tight text-white mt-4">
          ระบบสารสนเทศเพื่อสนับสนุนการตัดสินใจ (DSS)
        </h1>
        <p className="text-xxs text-slate-400 font-medium">
          ระบบควบคุมสั่งการภัยพิบัติอุทกภัย | เทศบาลตำบลสามโคก
        </p>
      </div>

      {/* ฟอร์มกรอกข้อมูล */}
      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        {error && (
          <div className="p-3.5 rounded-xl border border-rose-900/40 bg-rose-950/20 text-rose-400 text-xxs font-medium">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-slate-400 font-semibold block">ชื่อผู้ใช้งาน</label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
              placeholder="Username"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-400 font-semibold block">รหัสผ่าน</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
              placeholder="Password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-blue-500/15 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
          ) : (
            "เข้าสู่ระบบสนับสนุน"
          )}
        </button>
      </form>

      {/* คำอธิบายสิทธิ์การทดลอง POC */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col items-center gap-2 text-xxs text-slate-500">
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 py-1.5 px-3 rounded-lg text-slate-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
          <span>บัญชีทดสอบระบบ: <strong className="text-slate-200">admin</strong> / รหัสผ่าน: <strong className="text-slate-200">admin123</strong></span>
        </div>
        <span>สิทธิ์ผู้ดูแลระบบการตัดสินใจ - สาธารณภัยสามโคก</span>
      </div>
    </div>
  );
}
