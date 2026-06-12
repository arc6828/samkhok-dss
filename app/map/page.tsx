// app/map/page.tsx
"use client";

import dynamic from "next/dynamic";

// โหลด MapComponent แบบไดนามิกเพื่อป้องกันปัญหาเรื่อง 'window is not defined' ในส่วนของ SSR ของ Next.js
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-800 border-t-blue-500 mb-4"></div>
      <p className="text-xs font-semibold tracking-wide text-slate-400">กำลังโหลดโมดูลแผนที่ภูมิสารสนเทศ (GIS)...</p>
    </div>
  ),
});

export default function MapPage() {
  return <MapComponent />;
}
