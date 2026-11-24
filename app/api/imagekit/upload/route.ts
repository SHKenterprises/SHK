import { NextResponse } from "next/server";
import { uploadImageToImageKit } from "@/lib/imagekit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "/products";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadImageToImageKit(buffer, file.name, folder);
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API ImageKit upload error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Upload handler error" },
      { status: 500 }
    );
  }
}
