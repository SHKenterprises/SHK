import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_FILE = path.join(process.cwd(), "data", "coupons.json");

const DEFAULT_COUPONS = [
  {
    id: "cpn_bulk",
    code: "BULK10",
    description: "10% Wholesale volume rebate for orders over ₹5,000",
    discountType: "Percentage",
    discountValue: 10,
    minOrder: 5000,
    usageCount: 14,
    usageLimit: 500,
    expiryDate: "31 Dec 2026",
    status: "Active",
  },
  {
    id: "cpn_first",
    code: "SHKFIRST",
    description: "10% Welcome credit for verified workshop on first order over ₹1,000",
    discountType: "Percentage",
    discountValue: 10,
    minOrder: 1000,
    usageCount: 84,
    usageLimit: 500,
    expiryDate: "31 Dec 2026",
    status: "Active",
  },
  {
    id: "cpn_garage",
    code: "GARAGE20",
    description: "20% High-tier bulk discount for verified garages over ₹15,000",
    discountType: "Percentage",
    discountValue: 20,
    minOrder: 15000,
    usageCount: 29,
    usageLimit: 200,
    expiryDate: "31 Dec 2026",
    status: "Active",
  },
];

function readCoupons(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading coupons file:", err);
  }
  return DEFAULT_COUPONS;
}

function writeCoupons(coupons: any[]): boolean {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(coupons, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing coupons file:", err);
    return false;
  }
}

export async function GET(request: Request) {
  const coupons = readCoupons();
  return NextResponse.json(coupons, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupons = readCoupons();
    const formattedCode = body.code.trim().toUpperCase();
    const existingIndex = coupons.findIndex(
      (c) => (body.id && c.id === body.id) || c.code.toUpperCase() === formattedCode
    );

    const couponRecord = {
      id: body.id || `cpn-${Date.now()}`,
      code: formattedCode,
      description: body.description || `${body.discountValue || 10}% Discount`,
      discountType: body.discountType === "Flat" ? "Flat" : "Percentage",
      discountValue: Number(body.discountValue) || 10,
      minOrder: Number(body.minOrder) || 0,
      usageCount: Number(body.usageCount) || 0,
      usageLimit: Number(body.usageLimit) || 100,
      expiryDate: body.expiryDate || "31 Dec 2026",
      status: body.status === "Expired" ? "Expired" : "Active",
    };

    if (existingIndex >= 0) {
      coupons[existingIndex] = { ...coupons[existingIndex], ...couponRecord };
    } else {
      coupons.unshift(couponRecord);
    }

    const success = writeCoupons(coupons);
    if (!success) {
      return NextResponse.json({ error: "Failed to persist coupon data" }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupon: couponRecord, coupons });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid request payload" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    let code = searchParams.get("code");

    if (!id && !code) {
      try {
        const body = await request.json();
        id = body?.id;
        code = body?.code;
      } catch {
        // query param was preferred
      }
    }

    if (!id && !code) {
      return NextResponse.json({ error: "Coupon ID or code is required" }, { status: 400 });
    }

    const coupons = readCoupons();
    const updated = coupons.filter((c) => {
      if (id && c.id === id) return false;
      if (code && c.code.toUpperCase() === code.toUpperCase()) return false;
      return true;
    });

    writeCoupons(updated);
    return NextResponse.json({ success: true, coupons: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete coupon" }, { status: 500 });
  }
}
