/**
 * ==============================================================================
 * SHK AUTO - IMAGEKIT SERVICE & CDN UTILITIES
 * ==============================================================================
 * Provides high-speed image and video delivery, on-the-fly transformations, and
 * direct upload functionality via ImageKit CDN.
 */

const IMAGEKIT_URL_ENDPOINT =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/lv0h5ou9z";
const IMAGEKIT_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_sZB9ANa6IDeOYGAvdTB0AGcKAEA=";
const IMAGEKIT_PRIVATE_KEY =
  process.env.IMAGEKIT_PRIVATE_KEY || "";

/**
 * Check if ImageKit credentials are fully configured
 */
export function isImageKitConfigured(): boolean {
  return (
    IMAGEKIT_URL_ENDPOINT.startsWith("https://ik.imagekit.io/") &&
    IMAGEKIT_PUBLIC_KEY.length > 10
  );
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "maintain_ratio" | "force" | "at_least";
}

/**
 * Transform an image path or URL into an optimized ImageKit CDN URL
 */
export function getImageKitUrl(
  imagePath: string,
  options?: ImageTransformOptions
): string {
  const cleanEndpoint = IMAGEKIT_URL_ENDPOINT.replace(/\/+$/, "");

  if (!imagePath) {
    return `${cleanEndpoint}/products/piston.jpg`;
  }

  // If external non-ImageKit URL, return as-is
  if (imagePath.startsWith("http") && !imagePath.includes("ik.imagekit.io")) {
    return imagePath;
  }

  // Determine subpath in ImageKit
  let subPath = imagePath;
  if (imagePath.includes("ik.imagekit.io")) {
    subPath = imagePath.replace(cleanEndpoint, "").replace(/^\/+/, "");
    // Remove existing tr: transforms if any for re-transforming
    subPath = subPath.replace(/^tr:[^/]+\//, "");
  } else if (imagePath.startsWith("/images/logos/")) {
    subPath = "logos/" + imagePath.replace("/images/logos/", "");
  } else if (imagePath.startsWith("/images/")) {
    subPath = "products/" + imagePath.replace("/images/", "");
  } else if (imagePath.startsWith("/")) {
    subPath = imagePath.slice(1);
  }

  const transforms: string[] = [];
  if (options?.width) transforms.push(`w-${options.width}`);
  if (options?.height) transforms.push(`h-${options.height}`);
  if (options?.quality) transforms.push(`q-${options.quality}`);
  if (options?.format) transforms.push(`f-${options.format}`);
  if (options?.crop) transforms.push(`c-${options.crop}`);

  if (transforms.length > 0) {
    return `${cleanEndpoint}/tr:${transforms.join(",")}/${subPath}`;
  }

  return `${cleanEndpoint}/${subPath}`;
}

/**
 * Server-side upload to ImageKit using ImageKit REST API
 * Supports both images and videos.
 */
export async function uploadImageToImageKit(
  fileBuffer: Buffer | string,
  fileName: string,
  folder: string = "/products"
): Promise<{
  success: boolean;
  url?: string;
  fileId?: string;
  fileType?: string;
  thumbnailUrl?: string;
  error?: string;
}> {
  const privateKey = IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY || "";
  if (!privateKey) {
    return { success: false, error: "ImageKit private key not configured" };
  }

  try {
    const base64File =
      typeof fileBuffer === "string"
        ? fileBuffer
        : fileBuffer.toString("base64");

    const formData = new FormData();
    formData.append("file", base64File);
    formData.append("fileName", fileName);
    formData.append("folder", folder);
    formData.append("useUniqueFileName", "true");

    const authHeader = "Basic " + Buffer.from(privateKey + ":").toString("base64");

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || "Failed to upload to ImageKit" };
    }

    return {
      success: true,
      url: data.url,
      fileId: data.fileId,
      fileType: data.fileType,
      thumbnailUrl: data.thumbnailUrl,
    };
  } catch (err: any) {
    console.error("ImageKit upload error:", err);
    return { success: false, error: err?.message || "ImageKit upload failed" };
  }
}

/**
 * Delete an image from ImageKit by its URL or fileId
 */
export async function deleteImageFromImageKit(
  fileUrlOrId: string
): Promise<{ success: boolean; error?: string }> {
  const privateKey = IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY || "";
  if (!privateKey) {
    return { success: false, error: "ImageKit private key not configured" };
  }

  try {
    const authHeader = "Basic " + Buffer.from(privateKey + ":").toString("base64");
    let fileId = fileUrlOrId;

    // If a full URL or path was passed, lookup the fileId first
    if (fileUrlOrId.includes("ik.imagekit.io") || fileUrlOrId.includes("/")) {
      const fileName = fileUrlOrId.split("/").pop()?.split("?")[0];
      if (!fileName) {
        return { success: false, error: "Invalid file URL or name" };
      }

      // Find file by name in ImageKit
      const listRes = await fetch(
        `https://api.imagekit.io/v1/files?searchQuery=name="${encodeURIComponent(fileName)}"`,
        {
          headers: { Authorization: authHeader },
        }
      );

      if (listRes.ok) {
        const listData = await listRes.json();
        if (Array.isArray(listData) && listData.length > 0) {
          fileId = listData[0].fileId;
        } else {
          return { success: false, error: "File not found on ImageKit" };
        }
      } else {
        return { success: false, error: "Failed to query ImageKit files" };
      }
    }

    // Delete by fileId
    const delRes = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
      method: "DELETE",
      headers: { Authorization: authHeader },
    });

    if (delRes.status === 204 || delRes.ok) {
      return { success: true };
    }

    const delData = await delRes.json().catch(() => ({}));
    return { success: false, error: delData.message || "Failed to delete file from ImageKit" };
  } catch (err: any) {
    console.error("ImageKit delete error:", err);
    return { success: false, error: err.message };
  }
}
