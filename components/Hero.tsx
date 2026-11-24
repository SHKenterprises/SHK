import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "./SvgSprite";

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  image?: string;
  status?: string;
  order?: number;
}

interface HeroProps {
  onOpenQuote: (productName?: string) => void;
  badge?: string;
  headline?: string;
  subtitle?: string;
  slides?: HeroSlide[];
}

export function Hero({ onOpenQuote, badge, headline, subtitle, slides }: HeroProps) {
  const activeSlides = (slides && slides.length > 0)
    ? slides
        .filter((s) => s.status === "Active")
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-cycle through active slides if multiple exist
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const currentSlide = activeSlides.length > 0 ? activeSlides[currentSlideIndex] : null;

  const currentBadge = currentSlide ? currentSlide.badge : (badge || "OEM-GRADE ENGINEERING & SPARES");
  const currentHeadline = currentSlide ? currentSlide.title : (headline || "Power Every Ride. Engineered to Last.");
  const currentSubtitle = currentSlide ? currentSlide.subtitle : subtitle;
  const currentCtaText = currentSlide?.ctaText || "Explore Catalog";
  const currentCtaLink = currentSlide?.ctaLink || "/products";

  return (
    <section className="hero-indusfoto" id="home">
      {/* Dynamic Background: Uses Active Slide Image or fallback to CNC Gear */}
      <div
        className="hero-indusfoto-bg"
        style={
          currentSlide?.image
            ? {
                backgroundImage: `url('${currentSlide.image}')`,
                backgroundSize: "cover",
                backgroundPosition: "right 18% center",
                backgroundRepeat: "no-repeat",
                transition: "background-image 0.5s ease-in-out",
              }
            : undefined
        }
      />
      {/* High-contrast smooth gradient overlay for crystal-clear readability */}
      <div className="hero-indusfoto-overlay" />

      <div className="container hero-indusfoto-container">
        <div className="hero-indusfoto-grid">
          {/* Left Column: Headlines, Subtext, Buttons & Trust metrics */}
          <div className="hero-indusfoto-content">
            <div className="hero-kicker-wrap" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)" }} />
              <span
                style={{
                  color: "var(--primary)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {currentBadge}
              </span>
            </div>

            <h1
              className="hero-title"
              style={{
                fontSize: "clamp(2.45rem, 3.8vw, 3.45rem)",
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                marginBottom: "18px",
                transition: "opacity 0.3s ease",
              }}
            >
              {(() => {
                const parts = currentHeadline.trim().split(/\s+/);
                if (parts.length > 1) {
                  const lastWord = parts.pop();
                  return (
                    <>
                      {parts.join(" ")}{" "}
                      <span className="highlight" style={{ color: "var(--primary)" }}>
                        {lastWord}
                      </span>
                    </>
                  );
                }
                return currentHeadline;
              })()}
            </h1>

            <p
              className="hero-desc"
              style={{
                color: "#94a3b8",
                fontSize: "0.98rem",
                lineHeight: 1.65,
                maxWidth: "480px",
                marginBottom: "28px",
                transition: "opacity 0.3s ease",
              }}
            >
              {currentSubtitle || (
                <>
                  Genuine <strong>Nexcolle&trade;</strong> high-CCA motorcycle batteries with 36-month warranty. Built for extreme heat, vibration resistance, and maximum starting reliability.
                </>
              )}
            </p>

            <div className="hero-buttons" style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "28px", alignItems: "center" }}>
              <Link
                href={currentCtaLink}
                className="btn btn-primary"
                style={{
                  borderRadius: "var(--radius-full)",
                  padding: "13px 34px",
                  fontWeight: 700,
                  fontSize: "0.98rem",
                  boxShadow: "0 8px 24px rgba(249, 87, 22, 0.45)",
                  background: "linear-gradient(135deg, #f95716, #e04a0e)",
                  border: "none",
                }}
              >
                {currentCtaText}
              </Link>

              {/* Carousel Slide Switcher Dots */}
              {activeSlides.length > 1 && (
                <div style={{ display: "inline-flex", gap: "8px", alignItems: "center", marginLeft: "10px" }}>
                  {activeSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(idx)}
                      style={{
                        width: currentSlideIndex === idx ? "26px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        backgroundColor: currentSlideIndex === idx ? "var(--primary)" : "rgba(255, 255, 255, 0.3)",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        padding: 0,
                      }}
                      title={`Slide ${idx + 1}`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Industrial Trust Bar: Clean inline icons, no boxy containers, no cutting border */}
            <div
              className="hero-trust-bar"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "28px",
                flexWrap: "wrap",
                borderTop: "none",
                paddingTop: "0",
              }}
            >
              <div className="hero-trust-item" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon name="shield-check" style={{ width: "22px", height: "22px", color: "var(--primary)", flexShrink: 0 }} />
                <div className="trust-text">
                  <strong style={{ fontSize: "0.86rem", color: "#ffffff", display: "block", lineHeight: 1.25, fontWeight: 700 }}>
                    100% Genuine OEM
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Certified JIS &amp; DIN Specs</span>
                </div>
              </div>

              <div className="hero-trust-item" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon name="truck" style={{ width: "22px", height: "22px", color: "var(--primary)", flexShrink: 0 }} />
                <div className="trust-text">
                  <strong style={{ fontSize: "0.86rem", color: "#ffffff", display: "block", lineHeight: 1.25, fontWeight: 700 }}>
                    Pan-India Dispatch
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>24–48h Air &amp; Freight</span>
                </div>
              </div>

              <div className="hero-trust-item" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon name="bolt" style={{ width: "22px", height: "22px", color: "var(--primary)", flexShrink: 0 }} />
                <div className="trust-text">
                  <strong style={{ fontSize: "0.86rem", color: "#ffffff", display: "block", lineHeight: 1.25, fontWeight: 700 }}>
                    Zero-Defect Fitment
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>36-Month Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
