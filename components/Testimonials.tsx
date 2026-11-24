"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Icon } from "./SvgSprite";

interface Review {
  stars: number;
  badge: string;
  quote: string;
  initials: string;
  avatarBg: string;
  name: string;
  role: string;
  location: string;
}

const REVIEWS: Review[] = [
  {
    stars: 5,
    badge: "Nexcolle™ 4Ah Batteries",
    quote:
      "We install around 50 to 60 motorcycle batteries every month. Ever since switching to Nexcolle Maintenance-Free VRLA batteries from S.H.K ENTERPRISES, customer complaints dropped to virtually zero. Instant cranking, zero leakage, and perfect fitment.",
    initials: "MK",
    avatarBg: "linear-gradient(135deg, #1e293b, #0f172a)",
    name: "Mahesh Kumar",
    role: "Lead Mechanic, Sri Sai Two-Wheeler Workshop",
    location: "Coimbatore, Tamil Nadu",
  },
  {
    stars: 5,
    badge: "Nexcolle™ AGM Batteries",
    quote:
      "Nexcolle batteries have been a game-changer for our retail shop. Customers never come back with complaints. The cranking power is solid even in cold weather, and replacement claims are practically unheard of.",
    initials: "RP",
    avatarBg: "linear-gradient(135deg, #ea580c, #c2410c)",
    name: "Rajesh Patel",
    role: "Proprietor, Patel Auto Spares & Electricals",
    location: "Ahmedabad, Gujarat",
  },
  {
    stars: 5,
    badge: "Wholesale Dispatches",
    quote:
      "Dispatches are always punctual. When a customer's bike is disassembled in the bay, you cannot wait a week for parts. S.H.K ENTERPRISES delivers within 24 to 48 hours with correct OEM tolerances every single time.",
    initials: "AS",
    avatarBg: "linear-gradient(135deg, #334155, #1e293b)",
    name: "Amritpal Singh",
    role: "Owner & Head Tech, Apex Moto Care",
    location: "Ludhiana, Punjab",
  },
  {
    stars: 5,
    badge: "Nexcolle™ Heavy-Duty 9Ah",
    quote:
      "We service Royal Enfield Classic 350 and sports bikes daily. Nexcolle 9Ah and 14Ah batteries deliver high cold-cranking torque effortlessly even after standing in freezing winter for weeks. Best battery for heavy singles and twins.",
    initials: "VS",
    avatarBg: "linear-gradient(135deg, #d97706, #92400e)",
    name: "Vikram Shinde",
    role: "Chief Technician, Precision Moto Works",
    location: "Pune, Maharashtra",
  },
  {
    stars: 5,
    badge: "Commercial Fleet Support",
    quote:
      "Managing 120 delivery bikes in stop-and-go Chennai heat used to drain batteries every 10 months. Switching the fleet to Nexcolle AGM cut our downtime and emergency replacement costs by 40%.",
    initials: "KR",
    avatarBg: "linear-gradient(135deg, #4338ca, #312e81)",
    name: "K. V. Ramanathan",
    role: "Fleet Maintenance Supervisor, SwiftLog",
    location: "Chennai, Tamil Nadu",
  },
  {
    stars: 5,
    badge: "Nexcolle™ Sports 7Ah",
    quote:
      "We install Nexcolle 7Ah batteries on Apache RTR, Pulsar 220, and KTMs. The sustained voltage under heavy LED lighting and ABS load is rock solid. Never had a single dead cell comeback.",
    initials: "GD",
    avatarBg: "linear-gradient(135deg, #475569, #1e293b)",
    name: "Gurpreet Dhillon",
    role: "Head Technician, Doaba Moto Care",
    location: "Jalandhar, Punjab",
  },
  {
    stars: 5,
    badge: "Nexcolle™ VRLA Sealed",
    quote:
      "The leak-proof sealed AGM construction handles bad potholes and heavy road vibrations across Hyderabad without terminal corrosion or acid spilling. Cleanest battery install in the market.",
    initials: "MA",
    avatarBg: "linear-gradient(135deg, #0f766e, #115e59)",
    name: "Mohammad Arif",
    role: "Proprietor, Deccan Auto Electricals",
    location: "Hyderabad, Telangana",
  },
  {
    stars: 5,
    badge: "Nexcolle™ High CCA",
    quote:
      "Nexcolle's high cold-cranking amps start heavy 150cc–220cc commuter bikes on the first thumb press even during freezing Jaipur winter mornings. Local garages swear by them.",
    initials: "SV",
    avatarBg: "linear-gradient(135deg, #b45309, #78350f)",
    name: "Sunil Verma",
    role: "Proprietor, Verma Auto Electricals",
    location: "Jaipur, Rajasthan",
  },
];

// Duplicated list creates a seamless, infinite loop
const DUPLICATED_REVIEWS = [...REVIEWS, ...REVIEWS];

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const scrollPosRef = useRef<number>(0);
  const isInteractingRef = useRef<boolean>(false);

  // Smooth subpixel auto-scroll loop
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    scrollPosRef.current = container.scrollLeft;
    const speed = 0.045; // ~45px per second, calm and readable

    const step = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = Math.min(time - lastTimeRef.current, 64);
      lastTimeRef.current = time;

      if (!isPaused && !isInteractingRef.current && container) {
        scrollPosRef.current += delta * speed;

        const halfWidth = container.scrollWidth / 2;
        if (halfWidth > 0 && scrollPosRef.current >= halfWidth) {
          scrollPosRef.current -= halfWidth;
          container.scrollLeft = scrollPosRef.current;
        } else {
          container.scrollLeft = scrollPosRef.current;
        }
      } else if (container) {
        // Keep accumulator in sync during manual drag / scroll
        scrollPosRef.current = container.scrollLeft;
      }

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPaused]);

  // Keep internal position in sync if user manually scrolls
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const halfWidth = container.scrollWidth / 2;
      if (halfWidth > 0) {
        if (container.scrollLeft >= halfWidth * 1.8) {
          container.scrollLeft -= halfWidth;
        } else if (container.scrollLeft <= 5) {
          container.scrollLeft += halfWidth;
        }
      }
      scrollPosRef.current = container.scrollLeft;
    }
  }, []);

  return (
    <section className="section reviews-section" id="reviews">
      <div className="container">
        <div className="section-header">
          <span className="pill-tag">Workshop Verified</span>
          <h2 className="section-title">Trusted By Mechanics Across India</h2>
          <p className="section-desc">
            Real feedback from mechanics, fleet operators, and automotive retail stores across 8+ states.
          </p>
        </div>

        {/* Carousel aligned cleanly inside container boundaries */}
        <div className="reviews-carousel-container">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => {
              isInteractingRef.current = true;
              setIsPaused(true);
            }}
            onTouchEnd={() => {
              isInteractingRef.current = false;
              setTimeout(() => setIsPaused(false), 2000);
            }}
            className="reviews-carousel-track"
            role="region"
            aria-label="Mechanic testimonials carousel in a row"
          >
            {DUPLICATED_REVIEWS.map((rev, idx) => (
              <div key={idx} className="review-card">
                <div>
                  <div className="review-card-top">
                    <div className="stars-row">
                      {Array.from({ length: rev.stars }).map((_, sidx) => (
                        <Icon key={sidx} name="star" />
                      ))}
                    </div>
                    <span className="review-badge">{rev.badge}</span>
                  </div>
                  <p className="review-quote">&ldquo;{rev.quote}&rdquo;</p>
                </div>

                <div className="reviewer-meta">
                  <div
                    className="reviewer-avatar"
                    style={{ background: rev.avatarBg }}
                  >
                    {rev.initials}
                  </div>
                  <div className="reviewer-info">
                    <strong>{rev.name}</strong>
                    <span className="role">{rev.role}</span>
                    <span className="location">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {rev.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
