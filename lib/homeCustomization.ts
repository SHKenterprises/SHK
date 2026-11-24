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
  heroBadge: "100% GENUINE TWO-WHEELER BATTERIES",
  heroHeadline: "Power Every Ride. Engineered to Last.",
  heroSubtitle:
    "Genuine Nexcolle™ high-CCA motorcycle batteries engineered for extreme Indian weather, heavy duty, and instantaneous ignition.",
  showCompatibilityMatrix: true,
  showBrandPillars: true,
  showWholesaleSlabs: true,
  showSupplyChainTrust: true,
};
