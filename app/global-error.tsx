"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: "#090c13",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "12px" }}>
            Application Error
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "24px", maxWidth: "460px" }}>
            A critical error occurred. Please reload the application.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: "#f95716",
              color: "#ffffff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "999px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
