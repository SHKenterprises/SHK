"use client";

import React from "react";

interface EnterpriseShowcaseProps {
  onOpenQuote?: (productName?: string) => void;
}

export function EnterpriseShowcase({ onOpenQuote }: EnterpriseShowcaseProps = {}) {
  return (
    <section className="shk-ref-section" id="shk-enterprises-hub">
      <div className="shk-ref-container">
        {/* ========================================================
            ROW 1: TOP HERO BANNER (PANORAMIC MASTER BANNER)
            - Top-left orange racing wedge
            - Left: White rounded card with custom-created SHK vector logo
            - Sleek vertical divider line
            - Middle: Vector NEXOCELL branding & READY TO RIDE >>
            - Right: Real Nexocell_Motorcycle_Power_Duo.png asset
            ======================================================== */}
        <div className="shk-ref-panoramic-hero">
          {/* Top-Left Orange Racing Angle */}
          <div className="shk-ref-orange-corner-wedge" />

          {/* Background Ambient Glows & Speed Trails */}
          <div className="shk-ref-hero-flare-center" />
          <div className="shk-ref-hero-flare-right" />
          <div className="shk-ref-hero-speed-lines" />

          <div className="shk-ref-hero-inner-grid">
            {/* Left: White Rounded Panel with Official SHK Logo */}
            <div className="shk-ref-white-panel">
              <div className="shk-ref-logo-box">
                <img
                  src="/images/logos/shk_logo.png"
                  alt="SHK Enterprises Logo"
                  className="shk-ref-shk-logo-img"
                  loading="eager"
                />
              </div>

              <div className="shk-ref-kannada-heading">ಎಸ್.ಹೆಚ್.ಕೆ. ಎಂಟರ್‌ಪ್ರೈಸಸ್</div>
              <div className="shk-ref-english-heading">S.H.K ENTERPRISES</div>
              <div className="shk-ref-orange-badge">ENGINE SPARE PARTS DEALER</div>
            </div>

            {/* Sleek Vertical Divider Line */}
            <div className="shk-ref-hero-vertical-divider" />

            {/* Right: NEXOCELL Branding, Typography & Power Duo Image */}
            <div className="shk-ref-hero-right-stage">
              {/* Left Typography Block */}
              <div className="shk-ref-nexo-copy">
                <div className="shk-ref-nexo-logo-wrapper">
                  {/* Clean Vector NEXOCELL Logo */}
                  <svg viewBox="0 0 260 70" className="nexo-created-logo" aria-label="Nexocell Logo">
                    <defs>
                      <linearGradient id="nexoGoldV" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="50%" stopColor="#EA580C" />
                        <stop offset="100%" stopColor="#FF7900" />
                      </linearGradient>
                      <radialGradient id="nexoAuraV" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FF7900" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    <g transform="translate(98, 4)">
                      <circle cx="18" cy="18" r="24" fill="url(#nexoAuraV)" opacity="0.45" />
                      <path d="M 18 0 L 35 18 L 18 36 L 1 18 Z" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
                      <path d="M 7 7 L 29 29 M 29 7 L 7 29" stroke="url(#nexoGoldV)" strokeWidth="6" strokeLinecap="round" />
                      <circle cx="18" cy="18" r="3" fill="#FFFFFF" />
                    </g>

                    <text x="6" y="30" fill="#FFFFFF" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.08em">
                      NEXO
                    </text>     
                    <text x="146" y="30" fill="#FFFFFF" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.08em">
                      CELL
                    </text>
                    <text x="238" y="16" fill="#94A3B8" fontSize="10" fontWeight="700">
                      TM
                    </text>
                    <text x="130" y="48" fill="#FF7900" fontSize="12" fontWeight="700" letterSpacing="0.14em" fontFamily="sans-serif">
                      power your ride
                    </text>
                  </svg>
                </div>

                <div className="shk-ref-ready-ride-box">
                  <div className="shk-ref-ready-to">READY TO</div>
                  <div className="shk-ref-ride-chevron">
                    RIDE <span className="shk-ref-chevrons">&gt;&gt;</span>
                  </div>
                </div>
              </div>

              {/* Right: Actual Available Nexocell Motorcycle Power Duo Asset */}
              <div className="shk-ref-power-duo-wrapper">
                <img
                  src="/images/Nexocell_Motorcycle_Power_Duo.png"
                  alt="Nexocell Motorcycle Power Duo - Rider and VRLA Battery"
                  className="shk-ref-duo-img"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            ROW 2: FEATURES SECTION
            - 4 Horizontally aligned feature cards with orange icons
            ======================================================== */}
        <div className="shk-ref-features-bar">
          {/* 1. Extreme Weather */}
          <div className="shk-ref-feature-pill">
            <div className="shk-ref-icon-orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF7900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                <path d="M17 14a5 5 0 0 0-7.54-4.32A7 7 0 0 0 2 16h15a3 3 0 0 0 0-6" />
              </svg>
            </div>
            <div className="shk-ref-feature-texts">
              <span className="shk-ref-feat-title">Extreme Weather</span>
              <span className="shk-ref-feat-sub">Performance</span>
            </div>
          </div>

          <div className="shk-ref-bar-separator" />

          {/* 2. High Vibration */}
          <div className="shk-ref-feature-pill">
            <div className="shk-ref-icon-orange">
              <svg
                viewBox="0 0 28 28"
                fill="none"
                className="shk-ref-feat-svg-icon"
                aria-label="High Vibration Resistance"
              >
                {/* Vibration wave circle boundary */}
                <circle cx="14" cy="14" r="12" stroke="#FF7900" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.4" />
                {/* Dynamic high vibration pulse waveform */}
                <path
                  d="M 4 14 L 7 14 L 9.5 8 L 12 19 L 14.5 5 L 17 23 L 19.5 9 L 22 17 L 24 14 L 26 14"
                  stroke="#FF7900"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="shk-ref-feature-texts">
              <span className="shk-ref-feat-title">High Vibration</span>
              <span className="shk-ref-feat-sub">Resistance</span>
            </div>
          </div>

          <div className="shk-ref-bar-separator" />

          {/* 3. 100% Recyclable */}
          <div className="shk-ref-feature-pill">
            <div className="shk-ref-icon-orange">
              <img
                src="/images/icons/orange_recycling_symbol.svg"
                alt="100% Recyclable Green Technology"
                width={28}
                height={28}
                className="shk-ref-feat-svg-icon"
                loading="lazy"
              />
            </div>
            <div className="shk-ref-feature-texts">
              <span className="shk-ref-feat-title">100% Recyclable</span>
              <span className="shk-ref-feat-sub">Green Technology</span>
            </div>
          </div>

          <div className="shk-ref-bar-separator" />

          {/* 4. Maintenance Free Series */}
          <div className="shk-ref-feature-pill">
            <div className="shk-ref-icon-orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF7900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div className="shk-ref-feature-texts">
              <span className="shk-ref-feat-title">Maintenance</span>
              <span className="shk-ref-feat-sub">Free Series</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            ROW 3: BUSINESS SECTION
            - Left: White Business Details Card
            - Right: Dark NEXOCELL Battery Features Card
            ======================================================== */}
        <div className="shk-ref-business-row">
          {/* LEFT: White Business Details Card */}
          <div className="shk-ref-white-biz-card">
            {/* Top Left Orange Tab Badge */}
            <div className="shk-ref-biz-tab">
              <span className="shk-ref-tab-icon-wrap">
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="8" r="1.25" fill="currentColor" />
                </svg>
              </span>
              <span>Business Details</span>
            </div>

            {/* Row 1: GSTIN, SRZS, Prop */}
            <div className="shk-ref-biz-meta-line">
              <div className="shk-ref-gst-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" width="16" height="16">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span>
                  GSTIN: <strong>29BAQPR4342R1ZL</strong>
                </span>
              </div>

              <div className="shk-ref-srzs-badge">SRZS</div>

              <div className="shk-ref-prop-wrap">
                <span className="shk-ref-prop-dim">Prop:</span>{" "}
                <strong className="shk-ref-prop-val">SYED RABBANI</strong>
              </div>
            </div>

            <div className="shk-ref-biz-divider" />

            {/* Row 2: Location Address */}
            <div className="shk-ref-address-line">
              <div className="shk-ref-pin-icon-wrap">
                <svg viewBox="0 0 24 24" fill="#FF7900" width="22" height="22">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
                </svg>
              </div>
              <p className="shk-ref-address-p">
                Shop No. B3, Noorani Complex, Malebennur – 577 530,<br />
                Harihara Tq, Davanagere Dist.
              </p>
            </div>
          </div>

          {/* RIGHT: Dark Glassmorphic NEXOCELL Battery Features Card */}
          <div className="shk-ref-dark-nexo-card">
            {/* Header */}
            <div className="shk-ref-nexo-card-header">
              <div className="shk-ref-battery-icon-orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="#FF7900" strokeWidth="2.2" width="26" height="26">
                  <rect x="2" y="7" width="18" height="13" rx="2" />
                  <line x1="22" y1="11" x2="22" y2="15" strokeLinecap="round" />
                  <line x1="6" y1="13.5" x2="10" y2="13.5" strokeLinecap="round" />
                  <line x1="8" y1="11.5" x2="8" y2="15.5" strokeLinecap="round" />
                  <line x1="14" y1="13.5" x2="16" y2="13.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="shk-ref-nexo-card-title">
                NEXO<span className="shk-ref-golden-x">&#x2738;</span>CELL&trade; Batteries
              </h3>
            </div>

            {/* 4 Feature Bullets with Orange Checkmarks */}
            <ul className="shk-ref-nexo-bullet-list">
              <li>
                <span className="shk-ref-orange-check">&#10003;</span>
                <span>The Advance Lead Calcium – Calcium Technology</span>
              </li>
              <li>
                <span className="shk-ref-orange-check">&#10003;</span>
                <span>Better Cranking Performance &amp; Low Self-Discharge</span>
              </li>
              <li>
                <span className="shk-ref-orange-check">&#10003;</span>
                <span>Superior Quality Terminals with Anti-Corrosive Coat</span>
              </li>
              <li>
                <span className="shk-ref-orange-check">&#10003;</span>
                <span>Factory Charged &amp; Ready To Use</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ========================================================
            ROW 4: BRAND SECTION (OFFICIAL BRAND LOGOS)
            - White background with Maruti, Tata, Ashok Leyland,
              Hyundai and Mahindra logos from public/images/logos/
            ======================================================== */}
        <div className="shk-ref-brands-panel">
          <div className="shk-ref-brands-label-block">
            <span className="shk-ref-brands-title">Specialist Spares For</span>
            <div className="shk-ref-brands-orange-line" />
          </div>

          <div className="shk-ref-brands-col-divider" />

          <div className="shk-ref-brands-row">
            {/* 1. Maruti */}
            <div className="shk-ref-single-brand" title="Maruti Suzuki Spare Parts">
              <img
                src="/images/logos/Maruti.png"
                alt="Maruti Suzuki"
                className="shk-ref-brand-img"
                loading="lazy"
              />
            </div>

            <div className="shk-ref-brand-sep" />

            {/* 2. Tata */}
            <div className="shk-ref-single-brand" title="Tata Motors Spare Parts">
              <img
                src="/images/logos/Tata_Logo.png"
                alt="Tata Motors"
                className="shk-ref-brand-img"
                loading="lazy"
              />
            </div>

            <div className="shk-ref-brand-sep" />

            {/* 3. Ashok Leyland */}
            <div className="shk-ref-single-brand" title="Ashok Leyland Spare Parts">
              <img
                src="/images/logos/ashok_l.png"
                alt="Ashok Leyland"
                className="shk-ref-brand-img"
                loading="lazy"
              />
            </div>

            <div className="shk-ref-brand-sep" />

            {/* 4. Hyundai */}
            <div className="shk-ref-single-brand" title="Hyundai Spare Parts">
              <img
                src="/images/logos/Glossy_Hyundai.png"
                alt="Hyundai"
                className="shk-ref-brand-img"
                loading="lazy"
              />
            </div>

            <div className="shk-ref-brand-sep" />

            {/* 5. Mahindra */}
            <div className="shk-ref-single-brand" title="Mahindra Spare Parts">
              <img
                src="/images/logos/Mahindra.png"
                alt="Mahindra"
                className="shk-ref-brand-img"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            ROW 5: CONTACT SECTION
            - Phone numbers, email, green WhatsApp button and
              orange Call button
            ======================================================== */}
        <div className="shk-ref-contact-bar">
          {/* Left: Phone Numbers */}
          <div className="shk-ref-contact-left">
            <div className="shk-ref-phone-circle">
              <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22">
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.72 11.72 0 0 0 3.68.59 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.72 11.72 0 0 0 .59 3.68 1 1 0 0 1-.24 1.02l-2.23 2.09z" />
              </svg>
            </div>
            <div className="shk-ref-phone-stack">
              <a href="tel:9972455179" className="shk-ref-phone-item">99724 55179</a>
              <a href="tel:9880301426" className="shk-ref-phone-item">98803 01426</a>
              <a href="tel:9986763461" className="shk-ref-phone-item">99867 63461</a>
            </div>
          </div>

          <div className="shk-ref-contact-v-sep" />

          {/* Middle: Email */}
          <div className="shk-ref-contact-mid">
            <div className="shk-ref-mail-icon-wrap">
              <svg viewBox="0 0 24 24" fill="#FF7900" width="24" height="24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <a href="mailto:s.h.kenterprises121192@gmail.com" className="shk-ref-email-text">
              s.h.kenterprises121192@gmail.com
            </a>
          </div>

          {/* Right: Green WhatsApp & Orange Call Button */}
          <div className="shk-ref-contact-right">
            <a
              href="https://wa.me/919972455179?text=Hello%20SHK%20Enterprises%2C%20I%20am%20inquiring%20about%20Engine%20Spare%20Parts%20and%20Nexocell%20Batteries"
              target="_blank"
              rel="noopener noreferrer"
              className="shk-ref-btn-whatsapp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.31 3.8 2.53 1.09 2.53.73 2.99.69.45-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z" />
              </svg>
              <span>WhatsApp Inquiry</span>
            </a>

            <a href="tel:9972455179" className="shk-ref-btn-call">
              <svg viewBox="0 0 24 24" fill="#FFFFFF" width="18" height="18">
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.72 11.72 0 0 0 3.68.59 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.72 11.72 0 0 0 .59 3.68 1 1 0 0 1-.24 1.02l-2.23 2.09z" />
              </svg>
              <span>Call Store Desk</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
