import { NextResponse } from "next/server";
import { deleteImageFromImageKit } from "@/lib/imagekit";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  try {
    let url: string | null = null;
    try {
      const parsedUrl = new URL(req.url);
      url = parsedUrl.searchParams.get("url") || parsedUrl.searchParams.get("fileId");
    } catch {}

    if (!url) {
      try {
        const body = await req.json();
        url = body?.url || body?.fileId;
      } catch {}
    }

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Missing file URL or fileId" },
        { status: 400 }
      );
    }

    const result = await deleteImageFromImageKit(url);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("ImageKit delete route error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete file from ImageKit" },
      { status: 500 }
    );
  }
}
