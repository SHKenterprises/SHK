import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { deleteImageFromImageKit } from "@/lib/imagekit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_FILE = path.join(process.cwd(), "data", "heroSlides.json");

function readSlides() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading hero slides file:", err);
  }
  return [];
}

function writeSlides(slides: any[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(slides, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing hero slides file:", err);
    return false;
  }
}

export async function GET() {
  const slides = readSlides();
  return NextResponse.json(slides, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(req: Request) {
  try {
    const slide = await req.json();
    if (!slide || !slide.title) {
      return NextResponse.json({ error: "Slide title is required" }, { status: 400 });
    }

    const currentSlides = readSlides();
    const existingIndex = currentSlides.findIndex((s: any) => s.id === slide.id);

    if (existingIndex >= 0) {
      // Update existing
      currentSlides[existingIndex] = { ...currentSlides[existingIndex], ...slide };
    } else {
      // Add new
      const newSlide = {
        id: slide.id || `SLIDE-${Date.now().toString().slice(-4)}`,
        badge: slide.badge || "PROMOTIONAL",
        title: slide.title,
        subtitle: slide.subtitle || "",
        ctaText: slide.ctaText || "Explore Catalog",
        ctaLink: slide.ctaLink || "/products",
        image: slide.image || "",
        status: slide.status || "Active",
        order: slide.order || currentSlides.length + 1,
      };
      currentSlides.push(newSlide);
    }

    writeSlides(currentSlides);
    return NextResponse.json({ success: true, data: currentSlides });
  } catch (err: any) {
    console.error("Error saving hero slide:", err);
    return NextResponse.json({ error: err.message || "Failed to save slide" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    let id: string | null = null;
    try {
      const url = new URL(req.url);
      id = url.searchParams.get("id");
    } catch {}

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Slide ID is required" }, { status: 400 });
    }

    const currentSlides = readSlides();
    const slideToDelete = currentSlides.find((s: any) => s.id === id);
    const filtered = currentSlides.filter((s: any) => s.id !== id);
    writeSlides(filtered);

    // If slide had an ImageKit image, purge it from ImageKit too
    if (slideToDelete?.image && slideToDelete.image.includes("ik.imagekit.io")) {
      deleteImageFromImageKit(slideToDelete.image).catch((err) => {
        console.warn("Failed to delete image from ImageKit:", err);
      });
    }

    // Also delete from Supabase if configured
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SECRET_KEY;
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        await fetch(`${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        });
      } catch (err) {
        console.warn("Supabase hero_slides delete error:", err);
      }
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (err: any) {
    console.error("Error deleting hero slide:", err);
    return NextResponse.json({ error: err.message || "Failed to delete slide" }, { status: 500 });
  }
}
