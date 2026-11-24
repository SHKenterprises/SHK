export interface HomeCustomization {
  heroBadge: string;
  heroHeadline: string;
  heroSubtitle: string;
  showCompatibilityMatrix: boolean;
  showBrandPillars: boolean;
  showWholesaleSlabs: boolean;
  showSupplyChainTrust: boolean;
}

export const DEFAULT_HOME_CUSTOMIZATION: HomeCustomization = {
  heroBadge: "OEM-GRADE ENGINEERING & SPARES",
  heroHeadline: "Power Every Ride. Engineered to Last.",
  heroSubtitle:
    "Genuine Nexcolle™ high-CCA motorcycle batteries and FUJI™ precision engine components. Built for extreme heat, heavy duty, and maximum reliability.",
  showCompatibilityMatrix: true,
  showBrandPillars: true,
  showWholesaleSlabs: true,
  showSupplyChainTrust: true,
};
