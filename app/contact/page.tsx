"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { Icon } from "@/components/SvgSprite";
import { createInquiry } from "@/lib/supabaseService";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("workshop");
  const [interest, setInterest] = useState("Nexcolle Batteries");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Store inquiry directly in Supabase Inquiries table
      const res = await createInquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        customerType: role,
        product: interest,
        details: message.trim() || "Catalog & Price List Request",
      });

      if (!res.success && res.error) {
        setErrorMsg(res.error);
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error("Supabase contact inquiry sync error:", err);
      setErrorMsg("Failed to submit inquiry to database. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TopBar />
      <Header />

      <main style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0 80px 0" }}>
        <div className="container" style={{ maxWidth: "1080px" }}>
          
          {/* Breadcrumb */}
          <div style={{ display: "flex", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "24px" }}>
            <Link href="/" style={{ color: "var(--text-muted)" }}>Home</Link>
            <span>/</span>
            <strong style={{ color: "var(--text-main)" }}>Contact &amp; Trade Inquiries</strong>
          </div>

          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="pill-tag">Trade &amp; Logistics Desk</span>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--text-main)", marginTop: "8px" }}>
              Get in Touch with S.H.K ENTERPRISES
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "600px", margin: "8px auto 0 auto" }}>
              Direct contact for workshop wholesale supply, dealership applications, order dispatch tracking, and technical inquiries.
            </p>
          </div>

          {/* Contact Details Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "48px",
            }}
          >
            {/* Card 1: Phone */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--light-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#fee2e2",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <Icon name="phone" style={{ width: "20px", height: "20px" }} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px 0" }}>Direct Call &amp; WhatsApp</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 10px 0" }}>
                Fast technical &amp; order assistance.
              </p>
              <a
                href="tel:+919876543210"
                style={{ display: "block", fontSize: "0.95rem", fontWeight: 800, color: "var(--primary)" }}
              >
                +91 98765 43210
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 700, display: "inline-block", marginTop: "4px" }}
              >
                Chat on WhatsApp
              </a>
            </div>

            {/* Card 2: Email */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--light-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#ecfdf5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <Icon name="mail" style={{ width: "20px", height: "20px" }} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px 0" }}>Email Trade Desk</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 10px 0" }}>
                Invoicing, quotes &amp; catalogs.
              </p>
              <a
                href="mailto:sales@shkauto.in"
                style={{ display: "block", fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)" }}
              >
                sales@shkauto.in
              </a>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                Response within 30 mins
              </span>
            </div>

            {/* Card 3: Address */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--light-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <Icon name="map-pin" style={{ width: "20px", height: "20px" }} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px 0" }}>Central Warehouse Hub</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                Main Auto Market, Central Hub, Industrial Area, India.
              </p>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginTop: "8px" }}>
                Mon &ndash; Sat: 9:00 AM &ndash; 7:30 PM
              </span>
            </div>

            {/* Card 4: Dispatch Tracking */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--light-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#fef3c7",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <Icon name="truck" style={{ width: "20px", height: "20px" }} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px 0" }}>Courier Airway Bill</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 10px 0" }}>
                Track live active dispatches online.
              </p>
              <Link
                href="/track-order"
                style={{ display: "inline-block", fontSize: "0.95rem", fontWeight: 800, color: "var(--primary)" }}
              >
                Open Shipment Tracker
              </Link>
            </div>
          </div>

          {/* Form & Map/Info Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "36px",
              backgroundColor: "#ffffff",
              padding: "40px",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--light-border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {/* Form */}
            <div>
              <h2 style={{ fontSize: "1.45rem", fontWeight: 800, marginBottom: "8px" }}>
                Send Direct Message
              </h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "24px" }}>
                Fill out the form below. Your request will be directly submitted to our sales &amp; dispatch database.
              </p>

              {errorMsg && (
                <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", color: "#b91c1c", fontSize: "0.85rem", fontWeight: 600, marginBottom: "16px" }}>
                  ⚠ {errorMsg}
                </div>
              )}

              {submitted ? (
                <div
                  style={{
                    padding: "36px 24px",
                    backgroundColor: "#ecfdf5",
                    border: "1px solid #10b981",
                    borderRadius: "var(--radius-lg)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#10b981", color: "#fff", display: "grid", placeItems: "center", margin: "0 auto 16px auto", fontSize: "1.6rem" }}>
                    ✓
                  </div>
                  <h3 style={{ color: "#065f46", margin: "0 0 8px 0", fontSize: "1.3rem", fontWeight: 800 }}>
                    Inquiry Saved in Database!
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "#047857", margin: "0 0 20px 0", lineHeight: 1.5 }}>
                    Thank you, <strong>{name}</strong>. Your inquiry for <strong>{interest}</strong> has been saved directly to our system database. Our sales and wholesale dispatch team will review your requirements and reach out to you at <strong>{phone}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setPhone("");
                      setEmail("");
                      setMessage("");
                    }}
                    className="btn btn-primary"
                    style={{ padding: "10px 24px", fontSize: "0.9rem", fontWeight: 700 }}
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                      Your Full Name / Garage Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Patel (Patel Auto Spares)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--light-border)",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                        WhatsApp / Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--light-border)",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="rajesh@patelauto.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--light-border)",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                        I Am A...
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--light-border)",
                          background: "#fff",
                        }}
                      >
                        <option value="Two-Wheeler Workshop / Garage">Workshop Owner</option>
                        <option value="Spare Parts Retailer">Auto Parts Retailer</option>
                        <option value="Regional Distributor">Regional Distributor</option>
                        <option value="Individual Mechanic / Rider">Mechanic / Rider</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                        Primary Interest
                      </label>
                      <select
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--light-border)",
                          background: "#fff",
                        }}
                      >
                        <option value="Nexcolle Batteries">Nexcolle Batteries (All Series)</option>
                        <option value="Nexcolle Commuter 2.5Ah-4Ah">Commuter Series (2.5Ah - 4Ah)</option>
                        <option value="Nexcolle Sports 5Ah-7Ah">Performance Series (5Ah - 7Ah)</option>
                        <option value="Nexcolle Cruiser 9Ah-14Ah">Cruiser &amp; Heavy Series (9Ah - 14Ah)</option>
                        <option value="Bulk Wholesale Catalog">Complete Bulk Wholesale Supply</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                      Message / Vehicle Models / Quantities
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Inquiring about 20 sets of Splendor & Pulsar pistons, 15 batteries with dispatch to Jaipur..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--light-border)",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding: "14px",
                      fontSize: "1rem",
                      fontWeight: 800,
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>{isSubmitting ? "Submitting to Database..." : "Submit B2B Inquiry"}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Right Information / Workshop Benefits */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "32px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--light-border)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span className="pill-tag dark">B2B Advantages</span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "12px 0 16px 0" }}>
                  Direct Wholesale Dealer Perks
                </h3>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                  <li style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ color: "var(--accent-green)", flexShrink: 0, marginTop: "2px" }}>
                      <Icon name="check" style={{ strokeWidth: "3" }} />
                    </div>
                    <div>
                      <strong style={{ fontSize: "0.9rem" }}>Tiered Trade Margins</strong>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Up to 30% discount off MRP on bulk case packs.
                      </p>
                    </div>
                  </li>

                  <li style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ color: "var(--accent-green)", flexShrink: 0, marginTop: "2px" }}>
                      <Icon name="check" style={{ strokeWidth: "3" }} />
                    </div>
                    <div>
                      <strong style={{ fontSize: "0.9rem" }}>GST Input Tax Invoice</strong>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        18% GST input credit invoice provided with every dispatch.
                      </p>
                    </div>
                  </li>

                  <li style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ color: "var(--accent-green)", flexShrink: 0, marginTop: "2px" }}>
                      <Icon name="check" style={{ strokeWidth: "3" }} />
                    </div>
                    <div>
                      <strong style={{ fontSize: "0.9rem" }}>Priority 24h Air Cargo Dispatch</strong>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Zero waiting time for critical garage repair jobs.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  backgroundColor: "#ffffff",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed #cbd5e1",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                💡 <strong>Need Immediate Breakdown Spares?</strong> Call our dispatch hotline at <strong>+91 98765 43210</strong> for express same-day courier handover.
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  );
}
