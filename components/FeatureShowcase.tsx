"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "./SvgSprite";

interface FeatureShowcaseProps {
  onSelectCategory?: (category: string) => void;
}

export function FeatureShowcase({ onSelectCategory }: FeatureShowcaseProps) {
  const features = [
    {
      id: "battery",
      title: "Nexcolle™ VRLA AGM Batteries",
      desc: "Ultra-low resistance AGM matrix with 400+ cold-cranking amps for instantaneous ignition in all seasons.",
      image: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
      icon: "bolt",
    },
    {
      id: "commuter",
      title: "Nexcolle™ Commuter 4Ah Series",
      desc: "High-density calcium-alloy lead grids engineered for 100cc-125cc commuter bikes and high daily mileage.",
      image: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
      icon: "check-circle",
    },
    {
      id: "performance",
      title: "Nexcolle™ Sports 5Ah & 7Ah",
      desc: "Heavy sustained cranking current for 150cc-250cc sports motorcycles and high-load electrical accessories.",
      image: "https://ik.imagekit.io/lv0h5ou9z/products/battery-5ah.jpg",
      icon: "shield-check",
    },
    {
      id: "cruiser",
      title: "Nexcolle™ Cruiser 9Ah & 14Ah",
      desc: "Massive initial cranking torque formulated specifically for heavy 350cc/500cc pushrod engines and Royal Enfield.",
      image: "https://ik.imagekit.io/lv0h5ou9z/products/battery-5ah.jpg",
      icon: "bolt",
    },
  ];

  return (
    <section className="feature-showcase-section" id="features">
      <div className="container">
        <div className="feature-showcase-grid">
          {/* Left Column matching HİZMETLERİMİZ */}
          <div className="feature-showcase-left">
            <span className="kicker-pill">ADVANCED BATTERY SYSTEMS</span>
            <h2>Power Every Ride. Engineered To Last.</h2>
            <p>
              Engineered with advanced VRLA AGM technology and ultra-dense calcium
              alloy grids. We supply certified workshops, dealerships, and fleet operators
              across India with zero-maintenance, high-CCA batteries built to withstand
              extreme weather and heavy daily usage.
            </p>
            <Link href="/products" className="btn btn-primary feature-showcase-btn">
              <span>View All Batteries</span>
            </Link>
          </div>

          {/* Right Column: 4 Vertical Cards */}
          <div className="feature-cards-row">
            {features.map((item) => (
              <Link
                key={item.id}
                href="/products"
                className="service-feature-card"
                style={{ cursor: "pointer", textDecoration: "none" }}
              >
                <div className="service-card-body">
                  <div className="service-icon-box">
                    <Icon name={item.icon} style={{ width: "20px", height: "20px" }} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
                <div className="service-card-photo">
                  <img src={item.image} alt={item.title} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

