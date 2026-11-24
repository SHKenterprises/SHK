import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || "";

/**
 * ImageKit Client Authentication Endpoint
 * Returns token, expire timestamp, and HMAC-SHA1 signature
 */
export async function GET() {
  if (!IMAGEKIT_PRIVATE_KEY) {
    return NextResponse.json(
      { error: "IMAGEKIT_PRIVATE_KEY is not configured" },
      { status: 500 }
    );
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes validity
  const signature = crypto
    .createHmac("sha1", IMAGEKIT_PRIVATE_KEY)
    .update(token + expire)
    .digest("hex");

  return NextResponse.json({
    token,
    expire,
    signature,
  });
}
