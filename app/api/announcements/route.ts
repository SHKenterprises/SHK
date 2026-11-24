import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_FILE = path.join(process.cwd(), "data", "announcements.json");

const DEFAULT_ANNOUNCEMENT = {
  enabled: true,
  badgeText: "Dispatch Center Live",
  marqueeText: "Pan-India Logistics & Wholesale Supply for Verified Garages",
  phone: "+91 98765 43210",
  email: "sales@shkauto.in",
};

function readAnnouncements() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return { ...DEFAULT_ANNOUNCEMENT, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error("Error reading announcements file:", err);
  }
  return DEFAULT_ANNOUNCEMENT;
}

function writeAnnouncements(data: any) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing announcements file:", err);
    return false;
  }
}

export async function GET() {
  const data = readAnnouncements();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = readAnnouncements();
    const updated = { ...current, ...body };
    writeAnnouncements(updated);

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("Error saving announcements:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save announcement" },
      { status: 500 }
    );
  }
}
