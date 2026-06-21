// app/api/historical/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "dam";
  const damId = searchParams.get("dam_id") || "1";
  const years = searchParams.get("years") || "2026,2025,2024";

  if (type === "dam") {
    try {
      const url = `https://api-v3.thaiwater.net/api/v1/thaiwater30/analyst/dam_yearly_graph?data_type=dam_storage&dam_id=${damId}&year=${years}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "application/json"
        },
        next: { revalidate: 3600 } // แคชข้อมูล 1 ชั่วโมง
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `ThaiWater API returned status ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (e: any) {
      return NextResponse.json(
        { error: e.message || "Failed to fetch from ThaiWater API" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Unsupported request type" }, { status: 400 });
}
