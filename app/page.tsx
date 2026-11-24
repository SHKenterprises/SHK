"use client";

import React, { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { ProcessFlow } from "@/components/ProcessFlow";
import { ProductCatalog } from "@/components/ProductCatalog";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { StatsTicker } from "@/components/StatsTicker";
import { EngineeringSection } from "@/components/EngineeringSection";
import { CompatibilityMatrix } from "@/components/CompatibilityMatrix";
import { WorkshopSpotlight } from "@/components/WorkshopSpotlight";
import { EnterpriseShowcase } from "@/components/EnterpriseShowcase";
import { Testimonials } from "@/components/Testimonials";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { QuoteModal } from "@/components/QuoteModal";
import { DEFAULT_HOME_CUSTOMIZATION, HomeCustomization } from "@/lib/homeCustomization";
import { getHeroSlides } from "@/lib/supabaseService";

export default function Home() {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("General Inquiry");
  const [activeCategory, setActiveCategory] = useState("all");
  const [homeCustom, setHomeCustom] = useState<HomeCustomization>(DEFAULT_HOME_CUSTOMIZATION);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);

  useEffect(() => {
    // Helper to load live hero slides
    const reloadHeroSlides = () => {
      getHeroSlides().then((slides) => {
        if (slides && slides.length > 0) setHeroSlides(slides);
      });
    };

    reloadHeroSlides();

    // 1. Read from localStorage immediately
    try {
      const saved = localStorage.getItem("shk_home_customization");
      if (saved) {
        setHomeCustom((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {}

    // 2. Fetch from server API
    fetch("/api/home-customization", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setHomeCustom((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});

    // 3. Listen to live storage & custom events
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem("shk_home_customization");
        if (saved) {
          setHomeCustom((prev) => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch {}
      reloadHeroSlides();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("shk_home_custom_updated", handleUpdate);
    window.addEventListener("shk_hero_slides_updated", reloadHeroSlides);
    window.addEventListener("focus", reloadHeroSlides);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("shk_home_custom_updated", handleUpdate);
      window.removeEventListener("shk_hero_slides_updated", reloadHeroSlides);
      window.removeEventListener("focus", reloadHeroSlides);
    };
  }, []);

  const handleOpenQuote = (productName?: string) => {
    setSelectedProduct(productName || "General Inquiry");
    setQuoteModalOpen(true);
  };

  const handleCloseQuote = () => {
    setQuoteModalOpen(false);
  };

  const handleSelectCategory = (category: string) => {
    setActiveCategory(category);
    // Smooth scroll down to catalog if selected from feature showcase
    const catalogEl = document.getElementById("catalog");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <TopBar />
      <Header onOpenQuote={handleOpenQuote} />

      <main>
        {/* SECTION 1: Industrial Hero with Dynamic Banner Typography & Live Slides */}
        <Hero
          onOpenQuote={handleOpenQuote}
          badge={homeCustom.heroBadge}
          headline={homeCustom.heroHeadline}
          subtitle={homeCustom.heroSubtitle}
          slides={heroSlides}
        />

        {/* SECTION 2: Dispatch-Ready Product Catalog with Pill Category Filters */}
        <ProductCatalog
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          onOpenQuote={handleOpenQuote}
        />

        {/* SECTION 3: Feature Showcase (Nexcolle Battery Power Systems) */}
        {homeCustom.showBrandPillars && (
          <FeatureShowcase onSelectCategory={handleSelectCategory} />
        )}

        {/* SECTION 4: Supply Chain Trust / Process */}
        {homeCustom.showSupplyChainTrust && <ProcessFlow />}

        {/* SECTION 5: Wholesale Garage Volume Slabs & Value Prop */}
        {homeCustom.showWholesaleSlabs && <WhyChooseUs />}

        {/* TECHNICAL DEPTH & PROOFS */}
        {homeCustom.showSupplyChainTrust && (
          <>
            <StatsTicker />
            <EngineeringSection />
          </>
        )}

        {/* SECTION 6: OEM Two-Wheeler Compatibility Matrix */}
        {homeCustom.showCompatibilityMatrix && <CompatibilityMatrix />}

        <WorkshopSpotlight />
        {/* PHYSICAL STORE HEADQUARTERS & NEXOCELL BATTERY DISTRIBUTION */}
        <EnterpriseShowcase onOpenQuote={handleOpenQuote} />
        <Testimonials />

        {/* SECTION 7: High-Contrast Dark CTA Banner with Orange Action Button */}
        <CtaBanner onOpenQuote={handleOpenQuote} />
      </main>

      {/* SECTION 8: Multi-Column Dark Industrial Footer */}
      <Footer onSelectCategory={handleSelectCategory} />
      <WhatsAppFloat />

      <QuoteModal
        isOpen={quoteModalOpen}
        selectedProduct={selectedProduct}
        onClose={handleCloseQuote}
      />
    </>
  );
}
