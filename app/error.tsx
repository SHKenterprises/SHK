"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
        backgroundColor: "#090c13",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "rgba(249, 87, 22, 0.15)",
          color: "var(--primary)",
          display: "grid",
          placeItems: "center",
          fontSize: "1.8rem",
          fontWeight: 900,
          marginBottom: "20px",
        }}
      >
        !
      </div>
      <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "12px", color: "#ffffff" }}>
        Something went wrong
      </h2>
      <p style={{ color: "#94a3b8", maxWidth: "460px", marginBottom: "24px", fontSize: "0.95rem" }}>
        An unexpected error occurred while loading this page. Please try refreshing or return to the homepage.
      </p>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => reset()}
          style={{
            backgroundColor: "var(--primary)",
            color: "#ffffff",
            border: "none",
            padding: "10px 22px",
            borderRadius: "var(--radius-full)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            color: "#ffffff",
            padding: "10px 22px",
            borderRadius: "var(--radius-full)",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
