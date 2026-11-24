import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DEFAULT_HOME_CUSTOMIZATION, HomeCustomization } from "@/lib/homeCustomization";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_FILE = path.join(process.cwd(), "data", "homeCustomization.json");

export async function GET() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(content);
      return NextResponse.json(
        { ...DEFAULT_HOME_CUSTOMIZATION, ...data },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }
  } catch (err) {
    console.error("Error reading home customization:", err);
  }
  return NextResponse.json(DEFAULT_HOME_CUSTOMIZATION, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body: Partial<HomeCustomization> = await req.json();
    let current = { ...DEFAULT_HOME_CUSTOMIZATION };
    if (fs.existsSync(DATA_FILE)) {
      try {
        current = { ...current, ...JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) };
      } catch {}
    }
    const updated = { ...current, ...body };
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return NextResponse.json(
      { success: true, data: updated },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("Error saving home customization:", err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
