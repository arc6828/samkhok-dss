// app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // นำทางผู้ใช้งานไปยังหน้าแดชบอร์ดควบคุมอัตโนมัติเมื่อเข้าสู่หน้าแรก
  redirect("/dashboard");
}
