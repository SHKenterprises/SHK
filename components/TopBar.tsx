"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "./SvgSprite";
import {
  getAnnouncementSettings,
  AnnouncementData,
  DEFAULT_ANNOUNCEMENT_DATA,
} from "@/lib/supabaseService";

export function TopBar() {
  const [data, setData] = useState<AnnouncementData>(DEFAULT_ANNOUNCEMENT_DATA);

  useEffect(() => {
    // 1. Read immediate cached value from localStorage
    try {
      const cached = localStorage.getItem("shk_announcement");
      if (cached) {
        setData((prev) => ({ ...prev, ...JSON.parse(cached) }));
      }
    } catch {}

    // 2. Fetch live settings from API
    getAnnouncementSettings().then((live) => {
      if (live) setData(live);
    });

    // 3. Listen to live sync events across tabs
    const handleSync = () => {
      try {
        const updated = localStorage.getItem("shk_announcement");
        if (updated) {
          setData((prev) => ({ ...prev, ...JSON.parse(updated) }));
        } else {
          getAnnouncementSettings().then((live) => {
            if (live) setData(live);
          });
        }
      } catch {}
    };

    window.addEventListener("shk_announcement_updated", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);

    return () => {
      window.removeEventListener("shk_announcement_updated", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  if (!data.enabled) {
    return null;
  }

  const phone = data.phone || "+91 98765 43210";
  const email = data.email || "sales@shkauto.in";

  return (
    <div className="top-bar">
      <div className="container">
        <div className="top-bar-left" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {data.badgeText && (
            <span className="status-dot">
              {data.badgeText}
            </span>
          )}
          {data.marqueeText && (
            <span style={{ color: "#cbd5e1", fontSize: "0.78rem" }}>
              &bull; {data.marqueeText}
            </span>
          )}
          {data.offerNotice && (
            <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: "0.78rem" }}>
              &bull; {data.offerNotice}
            </span>
          )}
        </div>

        <div className="top-bar-right" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/track-order" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Icon name="truck" /> Track Order
          </Link>
          <a href={`tel:${phone.replace(/\s+/g, "")}`}>
            <Icon name="phone" /> {phone}
          </a>
          <a href={`mailto:${email}`}>
            <Icon name="mail" /> {email}
          </a>
        </div>
      </div>
    </div>
  );
}
