// app/layout.tsx
import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Navbar from "./components/Navbar";

// โหลดฟอนต์ Sarabun เพื่อความสวยงามและอ่านง่ายในภาษาไทย
const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ระบบสนับสนุนการตัดสินใจอุทกภัย - เทศบาลตำบลสามโคก",
  description: "ระบบ DSS สำหรับบริหารจัดการและเตือนภัยอุทกภัยระดับชุมชนและเกษตรกร",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${sarabun.variable}`}>
      <body className="bg-slate-950 text-slate-100 font-sans antialiased">
        <Navbar>{children}</Navbar>
      </body>
    </html>
  );
}
