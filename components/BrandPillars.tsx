import React from "react";
import Link from "next/link";
import { Icon } from "./SvgSprite";

interface BrandPillarsProps {
  onOpenQuote?: (productName?: string) => void;
}

export function BrandPillars({ onOpenQuote }: BrandPillarsProps) {
  return (
    <section className="section brands-section" id="brands">
      <div className="container">
        <div className="section-header">
          <span className="pill-tag">Nexcolle™ Power Systems</span>
          <h2 className="section-title">Engineered For Everyday Dominance</h2>
          <p className="section-desc">
            We partner exclusively with verified battery manufacturing specialists to supply mechanics and dealers with power systems that eliminate breakdown risks.
          </p>
        </div>

        <div className="brands-split">
          {/* Pillar 1: Nexcolle Commuter Series */}
          <article className="brand-pillar-card">
            <div className="brand-pillar-header battery-theme">
              <span className="pillar-tagline">Commuter &amp; Everyday Series</span>
              <h3 className="pillar-name">
                Nexcolle&trade; <small>2.5Ah &amp; 4Ah Batteries</small>
              </h3>
              <p className="pillar-desc">
                Engineered with high cold-cranking amps (CCA), ultra-dense calcium alloy grids, and spill-proof VRLA-AGM design for instantaneous starts in 100cc-125cc motorcycles and scooters.
              </p>
            </div>

            <div className="brand-pillar-body">
              <ul className="feature-check-list">
                <li className="feature-check-item">
                  <div className="check-circle">
                    <Icon name="check" />
                  </div>
                  <div>
                    <strong>High Cold Cranking Amperage (CCA)</strong>
                    <p>Instant engine ignition even during freezing winter mornings.</p>
                  </div>
                </li>
                <li className="feature-check-item">
                  <div className="check-circle">
                    <Icon name="check" />
                  </div>
                  <div>
                    <strong>Zero-Maintenance VRLA Technology</strong>
                    <p>Hermetically factory-sealed — no acid leaks, no water top-ups required.</p>
                  </div>
                </li>
                <li className="feature-check-item">
                  <div className="check-circle">
                    <Icon name="check" />
                  </div>
                  <div>
                    <strong>Heavy Vibration &amp; Pothole Resistance</strong>
                    <p>Reinforced polypropylene casing built for rugged Indian terrain.</p>
                  </div>
                </li>
              </ul>

              <div className="pillar-media-box">
                <img src="/images/battery.jpg" alt="Nexcolle Commuter Battery Showcase" />
              </div>

              {onOpenQuote ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onOpenQuote("Nexcolle Commuter Batteries")}
                >
                  Inquire Commuter Range
                </button>
              ) : (
                <Link href="/contact" className="btn btn-primary" style={{ textAlign: "center" }}>
                  Inquire Commuter Range
                </Link>
              )}
            </div>
          </article>

          {/* Pillar 2: Nexcolle Heavy-Duty & Cruiser Series */}
          <article className="brand-pillar-card">
            <div className="brand-pillar-header battery-theme" style={{ borderColor: "rgba(59, 130, 246, 0.3)" }}>
              <span className="pillar-tagline">Sports &amp; Cruiser Series</span>
              <h3 className="pillar-name">
                Nexcolle&trade; <small>5Ah, 7Ah, 9Ah &amp; 14Ah</small>
              </h3>
              <p className="pillar-desc">
                Heavy-duty VRLA AGM batteries engineered for 150cc to 650cc sports, touring, and cruiser motorcycles requiring high cranking current and deep discharge endurance.
              </p>
            </div>

            <div className="brand-pillar-body">
              <ul className="feature-check-list">
                <li className="feature-check-item">
                  <div className="check-circle">
                    <Icon name="check" />
                  </div>
                  <div>
                    <strong>High Cold Cranking (Up to 260 CCA)</strong>
                    <p>Effortless turn-over for large displacement singles and twins.</p>
                  </div>
                </li>
                <li className="feature-check-item">
                  <div className="check-circle">
                    <Icon name="check" />
                  </div>
                  <div>
                    <strong>High-Load Electrical Stability</strong>
                    <p>Maintains steady 12V output for auxiliary lighting and digital consoles.</p>
                  </div>
                </li>
                <li className="feature-check-item">
                  <div className="check-circle">
                    <Icon name="check" />
                  </div>
                  <div>
                    <strong>36-Month Nationwide Guarantee</strong>
                    <p>Direct hassle-free B2B replacement for registered garages.</p>
                  </div>
                </li>
              </ul>

              <div className="pillar-media-box">
                <img src="/images/battery.jpg" alt="Nexcolle Heavy-Duty Battery Series" />
              </div>

              {onOpenQuote ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onOpenQuote("Nexcolle High-Power Batteries")}
                >
                  Inquire High-Power Range
                </button>
              ) : (
                <Link href="/contact" className="btn btn-primary" style={{ textAlign: "center" }}>
                  Inquire High-Power Range
                </Link>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

