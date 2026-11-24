"use client";

import React, { useState, useRef } from "react";
import { Icon } from "./SvgSprite";

interface ImageKitUploadProps {
  label?: string;
  folder?: string;
  currentUrl?: string;
  accept?: string;
  onUploaded: (url: string, fileType?: string) => void;
  onRemove?: () => void;
}

export function ImageKitUpload({
  label = "Upload Image or Video (Stored on ImageKit CDN)",
  folder = "/products",
  currentUrl = "",
  accept = "image/*,video/*",
  onUploaded,
  onRemove,
}: ImageKitUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("folder", folder);

      const res = await fetch("/api/imagekit/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload file to ImageKit");
      }

      setPreviewUrl(data.url);
      setManualInput(data.url);
      onUploaded(data.url, data.fileType);
    } catch (err: any) {
      console.error("ImageKit upload error:", err);
      setUploadError(err.message || "Upload failed. Please check network.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreviewUrl("");
    setManualInput("");
    if (onRemove) onRemove();
    else onUploaded("");
  };

  const handleApplyManual = () => {
    const trimmed = manualInput.trim();
    setPreviewUrl(trimmed);
    onUploaded(trimmed);
    setManualMode(false);
  };

  const isVideo = previewUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i);

  return (
    <div style={{ marginTop: "10px", marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setManualMode(!manualMode)}
          style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
        >
          {manualMode ? "Upload File" : "Paste ImageKit URL"}
        </button>
      </div>

      {manualMode ? (
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="https://ik.imagekit.io/lv0h5ou9z/..."
            style={{
              flex: 1,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              padding: "10px 12px",
              color: "#ffffff",
              fontSize: "0.85rem",
            }}
          />
          <button
            type="button"
            onClick={handleApplyManual}
            style={{
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0 14px",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Apply
          </button>
        </div>
      ) : previewUrl ? (
        <div
          style={{
            position: "relative",
            borderRadius: "12px",
            border: "1px solid rgba(249, 87, 22, 0.3)",
            backgroundColor: "#06090e",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {isVideo ? (
            <video
              src={previewUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "64px",
                height: "64px",
                objectFit: "cover",
                borderRadius: "8px",
                backgroundColor: "#000",
              }}
            />
          ) : (
            <img
              src={previewUrl}
              alt="Uploaded Asset"
              style={{
                width: "64px",
                height: "64px",
                objectFit: "cover",
                borderRadius: "8px",
                backgroundColor: "#000",
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                }}
              />
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#10b981" }}>
                Stored on ImageKit CDN
              </span>
            </div>
            <div
              style={{
                fontSize: "0.74rem",
                color: "#94a3b8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {previewUrl}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Change
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            style={{ display: "none" }}
            id={`ik-upload-input-${folder.replace(/[^a-z0-9]/gi, "-")}`}
          />
          <label
            htmlFor={`ik-upload-input-${folder.replace(/[^a-z0-9]/gi, "-")}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              border: "2px dashed rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              cursor: uploading ? "wait" : "pointer",
              transition: "border-color 0.2s, background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.backgroundColor = "rgba(249, 87, 22, 0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
            }}
          >
            {uploading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--primary)" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "18px",
                    height: "18px",
                    border: "2px solid var(--primary)",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                  Uploading asset to ImageKit CDN...
                </span>
              </div>
            ) : (
              <>
                <div style={{ color: "var(--primary)", marginBottom: "6px" }}>
                  <Icon name="package" style={{ width: "24px", height: "24px" }} />
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
                  Click or drag file to upload to ImageKit
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                  Supports high-res PNG, JPG, WebP, and MP4 videos (folder: {folder})
                </div>
              </>
            )}
          </label>
        </div>
      )}

      {uploadError && (
        <div style={{ marginTop: "6px", fontSize: "0.75rem", color: "#ef4444" }}>
          âš  {uploadError}
        </div>
      )}
    </div>
  );
}
