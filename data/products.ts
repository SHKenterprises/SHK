export interface WholesaleTier {
  minQty: number;
  discountPercent: number;
  pricePerUnit: number;
}

export interface Product {
  id: string;
  slug: string;
  category: "battery" | "commuter" | "performance" | "cruiser" | string;
  brand: "Nexcolle" | string;
  title: string;
  shortDesc: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  gallery: string[];
  badge: string;
  meta: string;
  specs: string[];
  specDetails: Record<string, string>;
  oemTag: string;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  compatibleBikes: string[];
  warranty: string;
  wholesaleTiers: WholesaleTier[];
}

export const PRODUCTS: Product[] = [
  {
    id: "nex-12v2-5ah",
    slug: "nexcolle-eco-start-12v-2-5ah",
    category: "commuter",
    brand: "Nexcolle",
    title: "Nexcolle Eco-Start 12V 2.5Ah Two-Wheeler Battery",
    shortDesc: "Maintenance-Free VRLA battery for kick-start & light commuter motorcycles.",
    description:
      "Precision-engineered with high-density calcium alloy plates and advanced AGM separator matrix. Delivers reliable spark voltage and electrical stability for 100cc commuter bikes. 100% spill-proof, factory-activated and zero-maintenance.",
    price: 1250,
    originalPrice: 1450,
    discount: 14,
    image: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
    gallery: [
      "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
      "https://ik.imagekit.io/lv0h5ou9z/products/workshop.jpg",
    ],
    badge: "Nexcolle™",
    meta: "Commuter Series",
    specs: ["VRLA AGM", "12V 2.5Ah", "Low Discharge", "36M Guarantee"],
    specDetails: {
      Voltage: "12V",
      Capacity: "2.5Ah (C10)",
      CCA: "95 Amps",
      Technology: "VRLA / AGM Sealed",
      Terminal: "Standard Brass Nut & Bolt",
      Dimensions: "80 x 70 x 105 mm",
      Weight: "1.15 kg",
    },
    oemTag: "Eco Cranking",
    stock: 95,
    inStock: true,
    rating: 4.8,
    reviewsCount: 86,
    compatibleBikes: [
      "Hero Splendor Plus (Kick Start)",
      "Hero Passion Plus",
      "Hero HF Dawn / Deluxe",
      "Bajaj CT 100 / Boxer",
      "TVS Star City 110",
    ],
    warranty: "36 Months (24 Free Replacement + 12 Pro-Rata)",
    wholesaleTiers: [
      { minQty: 5, discountPercent: 10, pricePerUnit: 1125 },
      { minQty: 20, discountPercent: 18, pricePerUnit: 1025 },
      { minQty: 50, discountPercent: 25, pricePerUnit: 938 },
    ],
  },
  {
    id: "nex-12v4ah",
    slug: "nexcolle-pro-power-12v-4ah",
    category: "commuter",
    brand: "Nexcolle",
    title: "Nexcolle Pro-Power 12V 4Ah Maintenance-Free Battery",
    shortDesc: "VRLA AGM battery engineered for 100cc-125cc motorcycles & scooters.",
    description:
      "Engineered with ultra-dense calcium alloy lead grids and microporous AGM separators for exceptional high cold cranking amperage (CCA). 100% leak-proof, zero-maintenance factory sealed construction designed to absorb road vibrations and potholes across Indian riding conditions.",
    price: 1650,
    originalPrice: 1950,
    discount: 15,
    image: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
    gallery: [
      "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
      "https://ik.imagekit.io/lv0h5ou9z/products/hero-rider.jpg",
    ],
    badge: "Nexcolle™",
    meta: "Commuter Series",
    specs: ["VRLA AGM", "12V 4Ah", "High CCA", "36M Guarantee"],
    specDetails: {
      Voltage: "12V",
      Capacity: "4Ah (C10)",
      CCA: "135 Amps",
      Technology: "VRLA / AGM Sealed",
      Terminal: "Standard Brass Nut & Bolt",
      Dimensions: "113 x 70 x 105 mm",
      Weight: "1.65 kg",
    },
    oemTag: "Instant Cranking",
    stock: 85,
    inStock: true,
    rating: 4.9,
    reviewsCount: 142,
    compatibleBikes: [
      "Hero Splendor Plus / Pro",
      "Hero HF Deluxe",
      "Hero Passion Pro",
      "Honda Activa 3G/4G/5G/6G",
      "Honda Shine 125",
      "TVS Jupiter 110",
      "Bajaj Platina 100",
    ],
    warranty: "36 Months (24 Free Replacement + 12 Pro-Rata)",
    wholesaleTiers: [
      { minQty: 5, discountPercent: 10, pricePerUnit: 1485 },
      { minQty: 20, discountPercent: 18, pricePerUnit: 1353 },
      { minQty: 50, discountPercent: 25, pricePerUnit: 1237 },
    ],
  },
  {
    id: "nex-12v5ah",
    slug: "nexcolle-heavy-duty-12v-5ah",
    category: "performance",
    brand: "Nexcolle",
    title: "Nexcolle Heavy-Duty 12V 5Ah VRLA Motorcycle Battery",
    shortDesc: "High-crank power battery for 125cc-160cc self-start performance bikes.",
    description:
      "Delivers high sustained cranking current for fast electrical startup and high-load LED headlamp arrays. Features vibration-dampened cell layout and flame-arrestor safety vents for maximum durability under severe traffic and weather conditions.",
    price: 1850,
    originalPrice: 2250,
    discount: 18,
    image: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
    gallery: [
      "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
      "https://ik.imagekit.io/lv0h5ou9z/products/workshop.jpg",
    ],
    badge: "Nexcolle™",
    meta: "Performance Series",
    specs: ["VRLA AGM", "12V 5Ah", "Heavy Cranking", "36M Guarantee"],
    specDetails: {
      Voltage: "12V",
      Capacity: "5Ah (C10)",
      CCA: "160 Amps",
      Technology: "VRLA / AGM Sealed",
      Terminal: "Reinforced Alloy",
      Dimensions: "120 x 70 x 130 mm",
      Weight: "2.1 kg",
    },
    oemTag: "All-Weather Start",
    stock: 64,
    inStock: true,
    rating: 4.8,
    reviewsCount: 98,
    compatibleBikes: [
      "Bajaj Pulsar 125 / 150",
      "TVS Apache RTR 160",
      "Honda Unicorn 150 / 160",
      "Yamaha FZ / FZ-S V2/V3",
      "Suzuki Gixxer 150",
    ],
    warranty: "36 Months (24 Free Replacement + 12 Pro-Rata)",
    wholesaleTiers: [
      { minQty: 5, discountPercent: 10, pricePerUnit: 1665 },
      { minQty: 20, discountPercent: 18, pricePerUnit: 1517 },
      { minQty: 50, discountPercent: 25, pricePerUnit: 1387 },
    ],
  },
  {
    id: "nex-12v7ah",
    slug: "nexcolle-ultra-crank-12v-7ah",
    category: "performance",
    brand: "Nexcolle",
    title: "Nexcolle Ultra-Crank 12V 7Ah High-Performance AGM Battery",
    shortDesc: "High cold-crank amps battery engineered for 180cc-250cc performance sports bikes.",
    description:
      "Built for performance motorcycles demanding high electrical reserves for dual-channel ABS, EFI fuel pumps, and digital instrument clusters. Reinforced fiberglass mat separators prevent acid stratification and resist high engine bay heat.",
    price: 2450,
    originalPrice: 2950,
    discount: 17,
    image: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
    gallery: [
      "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
      "https://ik.imagekit.io/lv0h5ou9z/products/hero-rider.jpg",
    ],
    badge: "Nexcolle™",
    meta: "Performance Series",
    specs: ["VRLA AGM", "12V 7Ah", "190 CCA", "36M Guarantee"],
    specDetails: {
      Voltage: "12V",
      Capacity: "7Ah (C10)",
      CCA: "190 Amps",
      Technology: "VRLA / AGM Sealed",
      Terminal: "Heavy-Duty Brass Alloy",
      Dimensions: "150 x 87 x 94 mm",
      Weight: "2.65 kg",
    },
    oemTag: "Sports Ready",
    stock: 52,
    inStock: true,
    rating: 4.9,
    reviewsCount: 74,
    compatibleBikes: [
      "Bajaj Pulsar 200 NS / 220F",
      "TVS Apache RTR 200 4V",
      "KTM Duke 200 / 250",
      "Yamaha R15 V3 / V4",
      "Bajaj Dominar 250",
    ],
    warranty: "36 Months (24 Free Replacement + 12 Pro-Rata)",
    wholesaleTiers: [
      { minQty: 5, discountPercent: 10, pricePerUnit: 2205 },
      { minQty: 20, discountPercent: 18, pricePerUnit: 2009 },
      { minQty: 50, discountPercent: 25, pricePerUnit: 1837 },
    ],
  },
  {
    id: "nex-12v9ah",
    slug: "nexcolle-touring-master-12v-9ah",
    category: "cruiser",
    brand: "Nexcolle",
    title: "Nexcolle Touring-Master 12V 9Ah VRLA AGM Battery",
    shortDesc: "Extended endurance battery for 350cc cruisers and highway touring bikes.",
    description:
      "High-crank capacity and deep cyclic life specifically engineered to start high-displacement single-cylinder engines effortlessly. Withstands prolonged idling, heavy luggage auxiliary load, and severe engine vibration without internal plate damage.",
    price: 3100,
    originalPrice: 3650,
    discount: 15,
    image: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
    gallery: [
      "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
      "https://ik.imagekit.io/lv0h5ou9z/products/workshop.jpg",
    ],
    badge: "Nexcolle™",
    meta: "Cruiser Series",
    specs: ["VRLA AGM", "12V 9Ah", "220 CCA", "36M Guarantee"],
    specDetails: {
      Voltage: "12V",
      Capacity: "9Ah (C10)",
      CCA: "220 Amps",
      Technology: "VRLA / AGM Sealed",
      Terminal: "Heavy-Duty Brass Alloy",
      Dimensions: "135 x 75 x 139 mm",
      Weight: "3.2 kg",
    },
    oemTag: "Cruiser Spec",
    stock: 40,
    inStock: true,
    rating: 4.9,
    reviewsCount: 65,
    compatibleBikes: [
      "Royal Enfield Bullet 350 (Electric Start)",
      "Royal Enfield Classic 350",
      "Royal Enfield Meteor 350",
      "Honda H'ness CB350",
      "Jawa 42 / Classic",
    ],
    warranty: "36 Months (24 Free Replacement + 12 Pro-Rata)",
    wholesaleTiers: [
      { minQty: 5, discountPercent: 10, pricePerUnit: 2790 },
      { minQty: 20, discountPercent: 18, pricePerUnit: 2542 },
      { minQty: 50, discountPercent: 25, pricePerUnit: 2325 },
    ],
  },
  {
    id: "nex-12v14ah",
    slug: "nexcolle-max-torque-12v-14ah",
    category: "cruiser",
    brand: "Nexcolle",
    title: "Nexcolle Max-Torque 12V 14Ah Heavy-Duty Battery",
    shortDesc: "Maximum cold-cranking battery for 500cc-650cc twin-cylinder cruisers.",
    description:
      "The flagship Nexcolle power unit designed for heavy-displacement cruiser and adventure motorcycles. Featuring ultra-low internal resistance, rapid alternator recharge rate, and unmatched 260 CCA for lightning starts in all weather conditions.",
    price: 4200,
    originalPrice: 4900,
    discount: 14,
    image: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
    gallery: [
      "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
      "https://ik.imagekit.io/lv0h5ou9z/products/hero-rider.jpg",
    ],
    badge: "Nexcolle™",
    meta: "Cruiser Series",
    specs: ["VRLA AGM", "12V 14Ah", "260 CCA", "36M Guarantee"],
    specDetails: {
      Voltage: "12V",
      Capacity: "14Ah (C10)",
      CCA: "260 Amps",
      Technology: "VRLA / AGM Sealed Heavy-Duty",
      Terminal: "High-Amp Solid Brass",
      Dimensions: "150 x 87 x 145 mm",
      Weight: "4.4 kg",
    },
    oemTag: "Max Torque",
    stock: 28,
    inStock: true,
    rating: 5.0,
    reviewsCount: 39,
    compatibleBikes: [
      "Royal Enfield Interceptor 650",
      "Royal Enfield Continental GT 650",
      "Royal Enfield Super Meteor 650",
      "Royal Enfield Himalayan 411 / 450",
      "Harley-Davidson X440",
    ],
    warranty: "36 Months (24 Free Replacement + 12 Pro-Rata)",
    wholesaleTiers: [
      { minQty: 5, discountPercent: 10, pricePerUnit: 3780 },
      { minQty: 20, discountPercent: 18, pricePerUnit: 3444 },
      { minQty: 50, discountPercent: 25, pricePerUnit: 3150 },
    ],
  },
];
