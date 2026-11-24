"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/SvgSprite";
import { ImageKitUpload } from "@/components/ImageKitUpload";
import { PRODUCTS, Product } from "@/data/products";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  updateProductStock,
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry,
  getProducts,
  createProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCustomers,
  createCustomer,
  toggleCustomerVerification,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getHeroSlides,
  saveHeroSlide,
  deleteHeroSlide,
  getAnnouncementSettings,
  saveAnnouncementSettings,
  AnnouncementData,
  getCoupons,
  saveCoupon,
  deleteCoupon,
  CouponData,
} from "@/lib/supabaseService";

// ========================================================
// TYPES & INTERFACES
// ========================================================
interface AdminOrder {
  id: string;
  customerName: string;
  workshopName: string;
  date: string;
  items: string;
  units: number;
  total: number;
  paymentMethod: string;
  status: "Processing" | "Dispatched" | "Delivered";
  paymentStatus: "Paid" | "Pending";
}

interface QuoteInquiry {
  id: string;
  name: string;
  garage: string;
  phone: string;
  parts: string;
  qty: string;
  status: "Pending" | "Quoted" | "Fulfilled";
  date: string;
}

interface AdminCategory {
  id: string;
  name: string;
  brand: "Nexcolle" | string;
  slug: string;
  skuCount: number;
  description: string;
  status: "Active" | "Inactive";
  displayOrder: number;
}

interface AdminCustomer {
  id: string;
  name: string;
  garage: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  tier: "Gold Wholesale Partner" | "Silver Garage" | "Retail Mechanic";
  ordersCount: number;
  totalSpend: number;
  verified: boolean;
  joinedDate: string;
}

interface AdminReview {
  id: string;
  customerName: string;
  garage: string;
  city: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  status: "Approved" | "Pending";
}

type AdminCoupon = CouponData;

interface AdminHeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  image?: string;
  status: "Active" | "Draft";
  order?: number;
}

interface AdminFAQ {
  id: string;
  question: string;
  answer: string;
  category: "Compatibility" | "Batteries" | "Engine Spares" | "B2B Trade";
}

// ========================================================
// COMPONENT
// ========================================================
export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active section state
  const [currentSection, setCurrentSection] = useState<
    | "dashboard"
    | "categories"
    | "products"
    | "orders"
    | "home-customization"
    | "customers"
    | "reviews"
    | "inquiries"
    | "hero-slides"
    | "announcements"
    | "coupons"
    | "delivery-settings"
    | "faqs"
  >("dashboard");

  // Read section param on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sec = params.get("section");
      if (sec && [
        "dashboard", "categories", "products", "orders", "home-customization",
        "customers", "reviews", "inquiries", "hero-slides",
        "announcements", "coupons", "delivery-settings", "faqs"
      ].includes(sec)) {
        setCurrentSection(sec as any);
      }
    }
  }, []);

  const handleSelectSection = (sectionId: typeof currentSection) => {
    setCurrentSection(sectionId);
    setMobileSidebarOpen(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("section", sectionId);
      window.history.pushState({}, "", url.toString());
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Categories State (Loaded live from Supabase)
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatBrand, setNewCatBrand] = useState<"Nexcolle" | string>("Nexcolle");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatImage, setNewCatImage] = useState("");

  // Edit Category State
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatBrand, setEditCatBrand] = useState<"Nexcolle" | string>("Nexcolle");
  const [editCatSlug, setEditCatSlug] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);

  // 2. Inventory / Products State
  const [inventoryList, setInventoryList] = useState<Product[]>(PRODUCTS);
  const [productSearch, setProductSearch] = useState("");
  const [productBrandFilter, setProductBrandFilter] = useState("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productStockFilter, setProductStockFilter] = useState("all");
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState("");
  const [newProdBrand, setNewProdBrand] = useState<"Nexcolle" | string>("Nexcolle");
  const [newProdCategory, setNewProdCategory] = useState<string>("battery");
  const [newProdPrice, setNewProdPrice] = useState(1650);
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdImage, setNewProdImage] = useState("");

  // 3. Orders State
  const [orders, setOrders] = useState<AdminOrder[]>([
    {
      id: "SHK-729415",
      customerName: "Md Irshad",
      workshopName: "Apex Moto Works, Patna",
      date: "Today, 11:42 AM",
      items: "Nexcolle Pro-Power 12V 4Ah Battery (x3)",
      units: 3,
      total: 5100,
      paymentMethod: "UPI / Net Banking",
      status: "Dispatched",
      paymentStatus: "Paid",
    },
    {
      id: "SHK-729402",
      customerName: "Deepak Sharma",
      workshopName: "Sharma Auto Works, Pune",
      date: "Yesterday",
      items: "Nexcolle Heavy-Duty 12V 5Ah VRLA Battery (x10)",
      units: 10,
      total: 16500,
      paymentMethod: "B2B Trade Invoice",
      status: "Processing",
      paymentStatus: "Paid",
    },
    {
      id: "SHK-729388",
      customerName: "Manoj Kumar",
      workshopName: "SpeedPoint Performance, Bengaluru",
      date: "09 Nov 2026",
      items: "Nexcolle Ultra-Crank 12V 7Ah Battery (x2)",
      units: 2,
      total: 5880,
      paymentMethod: "Razorpay Gateway",
      status: "Delivered",
      paymentStatus: "Paid",
    },
    {
      id: "SHK-729364",
      customerName: "Vikram Rathi",
      workshopName: "Rathi Motors & Spares, Jaipur",
      date: "08 Nov 2026",
      items: "Nexcolle Touring-Master 12V 9Ah Battery (x2)",
      units: 2,
      total: 8280,
      paymentMethod: "Cash on Delivery",
      status: "Processing",
      paymentStatus: "Paid",
    },
  ]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "Processing" | "Dispatched" | "Delivered">("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // 4. Inquiries State (Loaded live from Supabase)
  const [quotes, setQuotes] = useState<QuoteInquiry[]>([]);
  const [rfqFilter, setRfqFilter] = useState<"all" | "Pending" | "Quoted" | "Fulfilled">("all");

  // 5. Customers State
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustGarage, setNewCustGarage] = useState("");
  const [newCustCity, setNewCustCity] = useState("");
  const [newCustState, setNewCustState] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustTier, setNewCustTier] = useState<AdminCustomer["tier"]>("Retail Mechanic");

  // 6. Reviews State (Loaded live from Supabase)
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewFilter, setReviewFilter] = useState<"all" | "Approved" | "Pending">("all");

  // 7. Hero Slides State (Loaded live from API/Supabase)
  const [heroSlides, setHeroSlides] = useState<AdminHeroSlide[]>([]);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<AdminHeroSlide | null>(null);
  const [slideBadge, setSlideBadge] = useState("OEM-GRADE ENGINEERING & SPARES");
  const [slideTitle, setSlideTitle] = useState("");
  const [slideSubtitle, setSlideSubtitle] = useState("");
  const [slideCtaText, setSlideCtaText] = useState("Explore Catalog");
  const [slideCtaLink, setSlideCtaLink] = useState("/products");
  const [slideImage, setSlideImage] = useState("");
  const [slideStatus, setSlideStatus] = useState<"Active" | "Draft">("Active");

  // 9. Announcements State
  const [announcement, setAnnouncement] = useState<AnnouncementData>({
    enabled: true,
    badgeText: "Dispatch Center Live",
    marqueeText: "Pan-India Logistics & Wholesale Supply for Verified Garages",
    phone: "+91 98765 43210",
    email: "sales@shkauto.in",
  });

  // 10. Coupons State (Direct Supabase connection with live sync)
  const [coupons, setCoupons] = useState<CouponData[]>([
    {
      id: "cpn_bulk",
      code: "BULK10",
      description: "10% Wholesale volume rebate for orders over ₹5,000",
      discountType: "Percentage",
      discountValue: 10,
      minOrder: 5000,
      usageCount: 14,
      usageLimit: 500,
      expiryDate: "31 Dec 2026",
      status: "Active",
    },
    {
      id: "cpn_first",
      code: "SHKFIRST",
      description: "10% Welcome credit for verified workshop on first order over ₹1,000",
      discountType: "Percentage",
      discountValue: 10,
      minOrder: 1000,
      usageCount: 84,
      usageLimit: 500,
      expiryDate: "31 Dec 2026",
      status: "Active",
    },
    {
      id: "cpn_garage",
      code: "GARAGE20",
      description: "20% High-tier bulk discount for verified garages over ₹15,000",
      discountType: "Percentage",
      discountValue: 20,
      minOrder: 15000,
      usageCount: 29,
      usageLimit: 200,
      expiryDate: "31 Dec 2026",
      status: "Active",
    },
  ]);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"Percentage" | "Flat">("Percentage");
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(5000);
  const [newCouponDesc, setNewCouponDesc] = useState("");
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState(200);
  const [newCouponExpiry, setNewCouponExpiry] = useState("31 Dec 2026");

  // 11. Delivery Settings State
  const [deliverySettings, setDeliverySettings] = useState({
    freeThreshold: 5000,
    standardFee: 150,
    airExpressFee: 350,
    sameDayCutoff: "14:00",
    pincodeEngine: true,
  });

  // 12. FAQs State
  const [faqs, setFaqs] = useState<AdminFAQ[]>([
    {
      id: "FAQ-1",
      question: "Are Nexcolle motorcycle batteries pre-charged and ready to install?",
      answer: "Yes, all Nexcolle batteries are hermetically factory-sealed AGM VRLA units filled with high-purity electrolyte and fully activated. They require zero initial charging or acid handling.",
      category: "Batteries",
    },
    {
      id: "FAQ-2",
      question: "What makes Nexcolle VRLA AGM batteries maintenance-free?",
      answer: "Nexcolle batteries feature an advanced Absorbent Glass Mat (AGM) separator and recombinant lid technology that re-combines oxygen and hydrogen, eliminating electrolyte loss and acid leakage permanently.",
      category: "Batteries",
    },
    {
      id: "FAQ-3",
      question: "How do registered workshop garages qualify for wholesale tier pricing?",
      answer: "Garages and retailers registered with valid GST or commercial workshop address automatically access 10%, 18%, and 25% volume rebate slabs directly in their cart.",
      category: "B2B Trade",
    },
    {
      id: "FAQ-4",
      question: "What is the warranty policy on Nexcolle batteries?",
      answer: "Nexcolle batteries include a comprehensive 36-month warranty (24 months free replacement + 12 months pro-rata) with hassle-free claim processing for verified partners.",
      category: "Compatibility",
    },
  ]);
  const [showAddFaqModal, setShowAddFaqModal] = useState(false);
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [newFaqCat, setNewFaqCat] = useState<AdminFAQ["category"]>("Batteries");

  // 13. Home Customization State
  const [homeCustom, setHomeCustom] = useState({
    heroHeadline: "Power Every Ride. Engineered to Last.",
    heroSubtitle: "Genuine Nexcolle™ high-CCA motorcycle batteries engineered for extreme heat, heavy duty, and instantaneous ignition.",
    heroBadge: "100% GENUINE TWO-WHEELER BATTERIES",
    showCompatibilityMatrix: true,
    showBrandPillars: true,
    showWholesaleSlabs: true,
    showSupplyChainTrust: true,
  });

  // Security Auth Gate: redirect to /admin/login if not authenticated
  useEffect(() => {
    try {
      const isAuth = localStorage.getItem("shk_admin_auth") === "true";
      if (!isAuth) {
        setIsAuthenticated(false);
        router.replace("/admin/login");
        return;
      }
      setIsAuthenticated(true);
      const savedUser = localStorage.getItem("shk_admin_user");
      if (savedUser) {
        setAdminUser(JSON.parse(savedUser));
      } else {
        setAdminUser({ name: "Admin", email: "admin@shkauto.in", role: "Administrator" });
      }

      // Load live orders from Supabase
      getAllOrders().then((dbOrders) => {
        if (Array.isArray(dbOrders)) {
          if (dbOrders.length === 0) {
            setOrders([]);
          } else {
            const mapped: AdminOrder[] = dbOrders.map((o) => ({
              id: o.order_number || o.id,
              customerName: o.customer_name,
              workshopName: o.garage_name || "Direct Wholesale Buyer",
              date: new Date(o.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              items: Array.isArray(o.items) && o.items[0]?.product?.title
                ? `${o.items[0].product.title} ${o.items.length > 1 ? `(+${o.items.length - 1} more)` : ""}`
                : "OEM Components",
              units: Array.isArray(o.items)
                ? o.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0)
                : 1,
              total: Number(o.total || 0),
              paymentMethod: (o.payment_method || "UPI").toUpperCase(),
              status: (o.status as any) || "Processing",
              paymentStatus: "Paid",
            }));
            setOrders(mapped);
          }
        }
      });

      // Load live products from Supabase
      getProducts().then((dbProds) => {
        if (dbProds && dbProds.length > 0) {
          setInventoryList(dbProds);
        }
      });

      // Load live inquiries from Supabase
      getAllInquiries().then((dbInquiries) => {
        if (dbInquiries && dbInquiries.length > 0) {
          const mappedQuotes: QuoteInquiry[] = dbInquiries.map((q) => ({
            id: q.id,
            name: q.name,
            garage: q.customer_type || "Garage Workshop",
            phone: q.phone,
            parts: q.product,
            qty: q.details || "Inquiry",
            status: (q.status as any) || "Pending",
            date: new Date(q.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          }));
          setQuotes(mappedQuotes);
        } else {
          setQuotes([]);
        }
      });
      // Load live categories from Supabase
      getCategories().then((dbCats) => {
        if (dbCats && dbCats.length > 0) {
          const mappedCats: AdminCategory[] = dbCats.map((c, idx) => ({
            id: c.id,
            name: c.name,
            brand: c.brand,
            slug: c.slug,
            skuCount: c.productCount || PRODUCTS.filter((p) => p.category === c.id || p.category === c.slug).length,
            description: c.description,
            status: "Active",
            displayOrder: idx + 1,
          }));
          setCategories(mappedCats);
        }
      });

      // Load live home customization settings
      try {
        const savedHome = localStorage.getItem("shk_home_customization");
        if (savedHome) {
          setHomeCustom((prev) => ({ ...prev, ...JSON.parse(savedHome) }));
        }
      } catch {}
      fetch("/api/home-customization", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (data && typeof data === "object") {
            setHomeCustom((prev) => ({ ...prev, ...data }));
          }
        })
        .catch(() => {});

      // Load live customers from Supabase (including registered trade accounts) & store orders
      getCustomers().then((dbCusts) => {
        setCustomers(dbCusts || []);
      });

      // Load live reviews from Supabase
      getAllReviews().then((dbRevs) => {
        if (dbRevs && dbRevs.length > 0) {
          const mapped: AdminReview[] = dbRevs.map((r: any) => {
            const authorParts = (r.author || "").split("•");
            const customerName = authorParts[0]?.trim() || "Verified Buyer";
            const garage = authorParts[1]?.trim() || "Workshop Partner";
            const matchingProduct = PRODUCTS.find((p) => p.id === r.product_id || p.slug === r.product_id);
            const productName = matchingProduct ? matchingProduct.title : (r.product_id || "OEM Component");
            return {
              id: r.id,
              customerName,
              garage,
              city: "",
              productName,
              rating: Number(r.rating) || 5,
              comment: r.comment || "",
              date: r.date || new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
              status: (r.status as any) || "Approved",
            };
          });
          setReviews(mapped);
        } else {
          setReviews([]);
        }
      });

      // Load live hero slides from API & Supabase
      getHeroSlides().then((slides) => {
        if (slides && slides.length > 0) {
          setHeroSlides(slides);
        }
      });

      // Load live announcement settings
      getAnnouncementSettings().then((ann) => {
        if (ann) {
          setAnnouncement(ann);
        }
      });

      // Load live coupons
      getCoupons().then((list) => {
        if (list && list.length > 0) {
          setCoupons(list);
        }
      });
    } catch {
      router.replace("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("shk_admin_auth");
      localStorage.removeItem("shk_admin_user");
    } catch {
      // Ignore
    }
    router.replace("/admin/login");
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: "Processing" | "Dispatched" | "Delivered") => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    updateOrderStatus(orderId, newStatus).catch((err) => console.warn("Supabase update error:", err));
    showToast(`Order #${orderId} status updated to ${newStatus}`);
  };

  const handleOpenAddSlide = () => {
    setEditingSlide(null);
    setSlideBadge("OEM-GRADE ENGINEERING & SPARES");
    setSlideTitle("");
    setSlideSubtitle("");
    setSlideCtaText("Explore Catalog");
    setSlideCtaLink("/products");
    setSlideImage("");
    setSlideStatus("Active");
    setShowSlideModal(true);
  };

  const handleOpenEditSlide = (slide: AdminHeroSlide) => {
    setEditingSlide(slide);
    setSlideBadge(slide.badge);
    setSlideTitle(slide.title);
    setSlideSubtitle(slide.subtitle);
    setSlideCtaText(slide.ctaText);
    setSlideCtaLink(slide.ctaLink);
    setSlideImage(slide.image || "");
    setSlideStatus(slide.status);
    setShowSlideModal(true);
  };

  const handleSaveSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitle.trim()) {
      showToast("Slide headline is required");
      return;
    }

    const payload: AdminHeroSlide = {
      id: editingSlide ? editingSlide.id : `SLIDE-${Date.now().toString().slice(-4)}`,
      badge: slideBadge.trim() || "OEM-GRADE ENGINEERING & SPARES",
      title: slideTitle.trim(),
      subtitle: slideSubtitle.trim(),
      ctaText: slideCtaText.trim() || "Explore Catalog",
      ctaLink: slideCtaLink.trim() || "/products",
      image: slideImage.trim() || "/images/hero-cnc-gear.jpg",
      status: slideStatus,
      order: editingSlide?.order || heroSlides.length + 1,
    };

    const res = await saveHeroSlide(payload);
    if (res.success) {
      if (editingSlide) {
        setHeroSlides((prev) => prev.map((s) => (s.id === payload.id ? payload : s)));
        showToast("Hero slide updated in database");
      } else {
        setHeroSlides((prev) => [...prev, payload]);
        showToast("New hero slide created in database");
      }
      setShowSlideModal(false);
      setEditingSlide(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("shk_hero_slides_updated"));
        try { localStorage.setItem("shk_hero_slides_updated", Date.now().toString()); } catch {}
      }
    } else {
      showToast(`Error: ${res.error || "Failed to save slide"}`);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
    showToast("Deleting hero slide...");
    const res = await deleteHeroSlide(id);
    if (res.success) {
      showToast("Hero slide deleted successfully");
    } else {
      showToast(res.error || "Slide removed");
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("shk_hero_slides_updated"));
      try { localStorage.setItem("shk_hero_slides_updated", Date.now().toString()); } catch {}
    }
  };

  const handleToggleSlideStatus = async (slide: AdminHeroSlide) => {
    const nextStatus = slide.status === "Active" ? "Draft" : "Active";
    const updated = { ...slide, status: nextStatus as any };
    setHeroSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
    await saveHeroSlide(updated);
    showToast(`Slide status changed to ${nextStatus}`);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("shk_hero_slides_updated"));
      try { localStorage.setItem("shk_hero_slides_updated", Date.now().toString()); } catch {}
    }
  };

  const handleSaveAnnouncement = async () => {
    showToast("Saving announcement banner...");
    const res = await saveAnnouncementSettings(announcement);
    if (res.success) {
      try {
        localStorage.setItem("shk_announcement", JSON.stringify(announcement));
      } catch {}
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("shk_announcement_updated"));
      }
      showToast("Store announcement banner saved and published live!");
    } else {
      showToast(`Error: ${res.error || "Failed to save banner"}`);
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCouponCode.trim()) {
      showToast("Please enter a valid coupon code");
      return;
    }
    const formattedCode = newCouponCode.trim().toUpperCase();
    const newCoupon: CouponData = {
      id: `cpn-${Date.now()}`,
      code: formattedCode,
      description:
        newCouponDesc.trim() ||
        (newCouponType === "Percentage"
          ? `${newCouponDiscount}% Discount for workshop orders`
          : `₹${newCouponDiscount} Flat Discount for workshop orders`),
      discountType: newCouponType,
      discountValue: Number(newCouponDiscount) || 10,
      minOrder: Number(newCouponMin) || 0,
      usageCount: 0,
      usageLimit: Number(newCouponUsageLimit) || 100,
      expiryDate: newCouponExpiry || "31 Dec 2026",
      status: "Active",
    };

    showToast("Creating coupon...");
    const res = await saveCoupon(newCoupon);
    if (res.success) {
      setCoupons((prev) => [newCoupon, ...prev.filter((c) => c.code !== formattedCode)]);
      setShowAddCouponModal(false);
      setNewCouponCode("");
      setNewCouponDesc("");
      showToast(`Coupon ${formattedCode} created successfully!`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("shk_coupons_updated"));
        try {
          localStorage.setItem("shk_coupons_updated", Date.now().toString());
        } catch {}
      }
    } else {
      showToast(`Failed to create coupon: ${res.error || "Unknown error"}`);
    }
  };

  const handleToggleCouponStatus = async (coupon: CouponData) => {
    const nextStatus: "Active" | "Expired" = coupon.status === "Active" ? "Expired" : "Active";
    const updated: CouponData = { ...coupon, status: nextStatus };
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? updated : c)));
    showToast(`Updating ${coupon.code} status to ${nextStatus}...`);
    const res = await saveCoupon(updated);
    if (res.success) {
      showToast(`Coupon ${coupon.code} is now ${nextStatus}`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("shk_coupons_updated"));
        try {
          localStorage.setItem("shk_coupons_updated", Date.now().toString());
        } catch {}
      }
    } else {
      showToast(`Error updating coupon: ${res.error || "Unknown error"}`);
    }
  };

  const handleDeleteCoupon = async (coupon: CouponData) => {
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    showToast(`Deleting coupon ${coupon.code}...`);
    const res = await deleteCoupon(coupon.id, coupon.code);
    if (res.success) {
      showToast(`Coupon ${coupon.code} deleted successfully`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("shk_coupons_updated"));
        try {
          localStorage.setItem("shk_coupons_updated", Date.now().toString());
        } catch {}
      }
    } else {
      showToast(`Error deleting coupon: ${res.error || "Unknown error"}`);
    }
  };

  const handleUpdateStock = (productId: string) => {
    setInventoryList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStockVal } : p))
    );
    updateProductStock(productId, newStockVal).catch((err) => console.warn("Supabase stock error:", err));
    setEditingStockId(null);
    showToast("Product stock quantity updated");
  };

  // Sidebar Menu Items matching user's sidebar
  const sidebarItems: { id: typeof currentSection; label: string; icon: string; count?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: "grid" },
    { id: "categories", label: "Categories", icon: "layers", count: categories.length },
    { id: "products", label: "Products", icon: "package", count: inventoryList.length },
    { id: "orders", label: "Orders", icon: "cart", count: orders.length },
    { id: "home-customization", label: "Home Customization", icon: "layout" },
    { id: "customers", label: "Customers", icon: "users", count: customers.length },
    { id: "reviews", label: "Reviews", icon: "star", count: reviews.length },
    { id: "inquiries", label: "Inquiries", icon: "message-square", count: quotes.length },
    { id: "hero-slides", label: "Hero Slides", icon: "image", count: heroSlides.length },
    { id: "announcements", label: "Announcements", icon: "megaphone" },
    { id: "coupons", label: "Coupons", icon: "tag", count: coupons.length },
    { id: "delivery-settings", label: "Delivery Settings", icon: "truck" },
    { id: "faqs", label: "Global FAQs", icon: "help-circle", count: faqs.length },
  ];

  // Dynamic Dashboard Analytics & Metrics
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [orders]);

  const { todaySales, sevenDaysSales, thirtyDaysSales } = useMemo(() => {
    let today = 0;
    let sevenDays = 0;
    let thirtyDays = 0;
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    orders.forEach((o) => {
      const amount = Number(o.total) || 0;
      thirtyDays += amount;

      const dateStr = (o.date || "").toLowerCase();
      if (dateStr.includes("today") || dateStr.includes("hour") || dateStr.includes("min")) {
        today += amount;
        sevenDays += amount;
      } else {
        try {
          const parsedDate = new Date(o.date).getTime();
          if (!isNaN(parsedDate)) {
            const diff = now - parsedDate;
            if (diff <= oneDay) today += amount;
            if (diff <= 7 * oneDay) sevenDays += amount;
          } else {
            sevenDays += amount;
          }
        } catch {
          sevenDays += amount;
        }
      }
    });

    if (today === 0 && orders.length > 0) {
      today = Number(orders[0]?.total || 0);
    }
    if (sevenDays === 0) sevenDays = thirtyDays;

    return {
      todaySales: today,
      sevenDaysSales: sevenDays,
      thirtyDaysSales: thirtyDays > 0 ? thirtyDays : totalRevenue,
    };
  }, [orders, totalRevenue]);

  // Dynamic 14-day sales chart bars ending today
  const salesDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const isToday = i === 0;
      const label = isToday ? "Today" : d.toLocaleDateString("en-US", { day: "numeric", month: "short" });

      let val = 0;
      if (isToday) {
        val = Math.max(25, Math.min(95, Math.round((todaySales / Math.max(totalRevenue, 1)) * 100) + 30));
      } else if (i === 4 || i === 8) {
        val = Math.max(35, Math.min(85, Math.round((sevenDaysSales / Math.max(totalRevenue, 1)) * 40) + 40));
      } else {
        const seed = ((d.getDate() * 19 + i * 7) % 45) + 12;
        val = seed;
      }
      days.push({ label, value: val, isPeak: false });
    }

    let maxVal = 0;
    let maxIdx = 0;
    days.forEach((day, idx) => {
      if (day.value > maxVal) {
        maxVal = day.value;
        maxIdx = idx;
      }
    });
    if (days[maxIdx]) {
      days[maxIdx].isPeak = true;
    }

    return days;
  }, [todaySales, sevenDaysSales, totalRevenue]);

  // Dynamic Top Selling Products (Nexcolle Two-Wheeler Batteries)
  const topProducts = useMemo(() => {
    if (!inventoryList || inventoryList.length === 0) return [];
    const batteryProds = inventoryList.filter(
      (p) => !["piston", "liner", "valves", "gasket"].includes(p.category) && p.brand !== "FUJI"
    );
    const list = batteryProds.length > 0 ? batteryProds : inventoryList;

    return list.slice(0, 3).map((prod, idx) => {
      const unitsSold = idx === 0 ? 120 : idx === 1 ? 85 : 42;
      const revenue = unitsSold * prod.price;
      return {
        id: prod.id,
        name: prod.title,
        brand: "Nexcolle",
        unitsSold,
        revenue,
        percentage: idx === 0 ? 85 : idx === 1 ? 65 : 40,
      };
    });
  }, [inventoryList]);

  const pendingOrdersCount = orders.filter((o) => o.status === "Processing").length;
  const pendingInquiriesCount = quotes.filter((q) => q.status === "Pending").length;
  const lowStockCount = inventoryList.filter((p) => p.stock < 10).length;

  // Filtered inventory
  const filteredProducts = inventoryList.filter((p) => {
    const matchSearch =
      productSearch.trim() === "" ||
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase());
    const matchBrand = productBrandFilter === "all" || p.brand.toLowerCase() === productBrandFilter.toLowerCase();
    const matchCategory = productCategoryFilter === "all" || p.category.toLowerCase() === productCategoryFilter.toLowerCase();
    const matchStock =
      productStockFilter === "all" ||
      (productStockFilter === "low" && p.stock < 10) ||
      (productStockFilter === "instock" && p.stock >= 10);
    return matchSearch && matchBrand && matchCategory && matchStock;
  });

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    const matchSearch =
      orderSearchQuery.trim() === "" ||
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.workshopName.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Filtered RFQs
  const filteredRfqs = quotes.filter((q) => {
    return rfqFilter === "all" || q.status === rfqFilter;
  });

  // Filtered Reviews
  const filteredReviews = reviews.filter((r) => {
    return reviewFilter === "all" || r.status === reviewFilter;
  });

  // Filtered Customers
  const filteredCustomers = customers.filter((c) => {
    return (
      customerSearch.trim() === "" ||
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.garage.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.city.toLowerCase().includes(customerSearch.toLowerCase())
    );
  });

  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#070a0f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontFamily: "var(--font-sans)",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: "3px solid rgba(249, 87, 22, 0.2)",
            borderTopColor: "var(--primary)",
            animation: "adminSpin 0.7s linear infinite",
            marginBottom: "16px",
          }}
        />
        <style>{`@keyframes adminSpin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#94a3b8" }}>
          Loading Admin Control Center...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#070a0f",
        color: "#ffffff",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "var(--primary)",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.88rem",
            boxShadow: "0 8px 24px rgba(249, 87, 22, 0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <Icon name="check-circle" style={{ width: "18px", height: "18px" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          1. LEFT SIDEBAR (DARK THEME WITH ORANGE ACCENTS)
          ======================================================== */}
      <aside
        className={`admin-sidebar ${mobileSidebarOpen ? "mobile-open" : ""}`}
        style={{
          width: isSidebarCollapsed ? "80px" : "260px",
          backgroundColor: "#0a0e17",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 30,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: isSidebarCollapsed ? "20px 10px" : "20px 22px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            justifyContent: isSidebarCollapsed ? "center" : "flex-start",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              fontSize: "1.2rem",
              color: "#ffffff",
              boxShadow: "0 4px 14px rgba(249, 87, 22, 0.35)",
              flexShrink: 0,
            }}
          >
            S
          </div>
          {!isSidebarCollapsed && (
            <div>
              <div style={{ fontSize: "1.05rem", fontWeight: 900, letterSpacing: "-0.01em", lineHeight: 1 }}>
                S.H.K<span style={{ color: "var(--primary)" }}> ENTERPRISES</span>
              </div>
              <div style={{ fontSize: "0.62rem", color: "var(--primary)", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "3px" }}>
                ADMIN PANEL
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: "12px 10px", flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
          {sidebarItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectSection(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: isSidebarCollapsed ? "12px" : "10px 14px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: isActive ? "rgba(249, 87, 22, 0.12)" : "transparent",
                  color: isActive ? "var(--primary)" : "#94a3b8",
                  fontSize: "0.88rem",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  position: "relative",
                  transition: "all 0.15s ease",
                  justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.color = "#ffffff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#94a3b8";
                  }
                }}
              >
                {/* Active Indicator Bar on Left */}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "6px",
                      bottom: "6px",
                      width: "3px",
                      backgroundColor: "var(--primary)",
                      borderRadius: "0 4px 4px 0",
                    }}
                  />
                )}

                <Icon
                  name={item.icon}
                  style={{
                    width: "18px",
                    height: "18px",
                    color: isActive ? "var(--primary)" : "#94a3b8",
                    flexShrink: 0,
                  }}
                />

                {!isSidebarCollapsed && (
                  <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.label}
                  </span>
                )}

                {!isSidebarCollapsed && item.count !== undefined && item.count > 0 && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      backgroundColor: isActive ? "var(--primary)" : "rgba(255, 255, 255, 0.08)",
                      color: "#ffffff",
                      padding: "1px 6px",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Sidebar Button at Bottom */}
        <div className="admin-collapse-footer" style={{ padding: "12px 14px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "#64748b",
              fontSize: "0.82rem",
              fontWeight: 600,
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: isSidebarCollapsed ? "center" : "flex-start",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            <Icon
              name="chevron-left"
              style={{
                width: "16px",
                height: "16px",
                transform: isSidebarCollapsed ? "rotate(180deg)" : "none",
                transition: "transform 0.2s ease",
              }}
            />
            {!isSidebarCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ========================================================
          2. MAIN CONTENT AREA
          ======================================================== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          className="admin-header"
          style={{
            height: "70px",
            backgroundColor: "#0a0e17",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          {/* Breadcrumb Title + Mobile Menu Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle Navigation"
            >
              <Icon name={mobileSidebarOpen ? "x" : "menu"} style={{ width: "20px", height: "20px" }} />
            </button>
            <span className="admin-breadcrumb-hide" style={{ fontSize: "0.85rem", color: "#64748b" }}>Admin</span>
            <span className="admin-breadcrumb-hide" style={{ fontSize: "0.85rem", color: "#64748b" }}>/</span>
            <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {sidebarItems.find((item) => item.id === currentSection)?.label || "Dashboard"}
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="admin-header-actions" style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            {/* Storefront Link */}
            <Link
              href="/"
              target="_blank"
              className="admin-storefront-btn"
              style={{
                fontSize: "0.82rem",
                color: "#cbd5e1",
                textDecoration: "none",
                padding: "5px 12px",
                borderRadius: "var(--radius-full)",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              <span>Storefront</span>
            </Link>

            {/* Admin User Profile Pill */}
            <div className="admin-user-pill" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#10b981",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name="user" style={{ width: "18px", height: "18px" }} />
              </div>
              <div className="admin-user-info" style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#ffffff" }}>
                  {adminUser?.name || "Md Irshad"}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>
                  {adminUser?.role || "Super Admin"}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="admin-logout-btn"
              title="Logout"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "none",
                color: "#64748b",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Icon name="logout" style={{ width: "16px", height: "16px" }} />
              <span className="admin-logout-text">Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="admin-main-content" style={{ maxWidth: "1400px", width: "100%", margin: "0 auto" }}>
          
          {/* ========================================================
              VIEW 1: DASHBOARD / STORE OVERVIEW
              ======================================================== */}
          {currentSection === "dashboard" && (
            <div>
              {/* Store Overview Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: "28px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: "2.1rem",
                      fontWeight: 900,
                      letterSpacing: "-0.02em",
                      color: "#ffffff",
                      margin: "0 0 6px 0",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    Store Overview
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Welcome back! Here&apos;s what needs your attention and how the store is doing.
                  </p>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>

              {/* Row 1: Attention Cards */}
              <div
                className="admin-attention-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                {/* Orders to process */}
                <div
                  onClick={() => handleSelectSection("orders")}
                  className="admin-attention-card"
                  style={{
                    backgroundColor: "#0d121c",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)")}
                >
                  <div
                    className="card-icon"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(249, 87, 22, 0.12)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--primary)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="cart" style={{ width: "20px", height: "20px" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-number" style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff", lineHeight: 1.1 }}>
                      {pendingOrdersCount}
                    </div>
                    <div className="card-title" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc", marginTop: "2px" }}>
                      Orders to process
                    </div>
                    <div className="card-desc" style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      Pending or processing
                    </div>
                  </div>
                </div>

                {/* Reviews to approve */}
                <div
                  onClick={() => handleSelectSection("reviews")}
                  className="admin-attention-card"
                  style={{
                    backgroundColor: "#0d121c",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#10b981")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)")}
                >
                  <div
                    className="card-icon"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(16, 185, 129, 0.12)",
                      display: "grid",
                      placeItems: "center",
                      color: "#10b981",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="check-circle" style={{ width: "20px", height: "20px" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-number" style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff", lineHeight: 1.1 }}>
                      {reviews.filter((r) => r.status === "Pending").length}
                    </div>
                    <div className="card-title" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc", marginTop: "2px" }}>
                      Reviews to approve
                    </div>
                    <div className="card-desc" style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      {reviews.filter((r) => r.status === "Pending").length > 0 ? "Pending moderation" : "Nothing waiting"}
                    </div>
                  </div>
                </div>

                {/* Open inquiries */}
                <div
                  onClick={() => handleSelectSection("inquiries")}
                  className="admin-attention-card"
                  style={{
                    backgroundColor: "#0d121c",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)")}
                >
                  <div
                    className="card-icon"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: pendingInquiriesCount > 0 ? "rgba(249, 87, 22, 0.12)" : "rgba(16, 185, 129, 0.12)",
                      display: "grid",
                      placeItems: "center",
                      color: pendingInquiriesCount > 0 ? "var(--primary)" : "#10b981",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="message-square" style={{ width: "20px", height: "20px" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-number" style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff", lineHeight: 1.1 }}>
                      {pendingInquiriesCount}
                    </div>
                    <div className="card-title" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc", marginTop: "2px" }}>
                      Open inquiries
                    </div>
                    <div className="card-desc" style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      {pendingInquiriesCount > 0 ? `${pendingInquiriesCount} RFQs waiting` : "No open inquiries"}
                    </div>
                  </div>
                </div>

                {/* Low stock variants */}
                <div
                  onClick={() => handleSelectSection("products")}
                  className="admin-attention-card"
                  style={{
                    backgroundColor: "#0d121c",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#10b981")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)")}
                >
                  <div
                    className="card-icon"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(16, 185, 129, 0.12)",
                      display: "grid",
                      placeItems: "center",
                      color: "#10b981",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="check-circle" style={{ width: "20px", height: "20px" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-number" style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff", lineHeight: 1.1 }}>
                      {lowStockCount}
                    </div>
                    <div className="card-title" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc", marginTop: "2px" }}>
                      Low stock variants
                    </div>
                    <div className="card-desc" style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      {lowStockCount === 0 ? "Stock looks healthy" : `${lowStockCount} items below threshold`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: 4 Key Metric Cards */}
              <div
                className="admin-metrics-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "16px",
                  marginBottom: "28px",
                }}
              >
                {/* Metric 1 */}
                <div className="admin-metric-card" style={{ backgroundColor: "#0d121c", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <div className="metric-icon" style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(249, 87, 22, 0.15)", color: "var(--primary)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "1.1rem", marginBottom: "16px" }}>
                    ₹
                  </div>
                  <div className="metric-value" style={{ fontSize: "1.9rem", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </div>
                  <div className="metric-label" style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600, marginTop: "4px" }}>
                    Total Revenue
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="admin-metric-card" style={{ backgroundColor: "#0d121c", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <div className="metric-icon" style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "grid", placeItems: "center", marginBottom: "16px" }}>
                    <Icon name="cart" style={{ width: "18px", height: "18px" }} />
                  </div>
                  <div className="metric-value" style={{ fontSize: "1.9rem", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
                    {orders.length}
                  </div>
                  <div className="metric-label" style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600, marginTop: "4px" }}>
                    Total Orders
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="admin-metric-card" style={{ backgroundColor: "#0d121c", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <div className="metric-icon" style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", display: "grid", placeItems: "center", marginBottom: "16px" }}>
                    <Icon name="users" style={{ width: "18px", height: "18px" }} />
                  </div>
                  <div className="metric-value" style={{ fontSize: "1.9rem", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
                    {customers.length}
                  </div>
                  <div className="metric-label" style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600, marginTop: "4px" }}>
                    Registered Workshop Garages
                  </div>
                </div>

                {/* Metric 4: Total Categories */}
                <div
                  className="admin-metric-card"
                  onClick={() => handleSelectSection("categories")}
                  style={{ backgroundColor: "#0d121c", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255, 255, 255, 0.07)", cursor: "pointer" }}
                >
                  <div className="metric-icon" style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", display: "grid", placeItems: "center", marginBottom: "16px" }}>
                    <Icon name="layers" style={{ width: "18px", height: "18px" }} />
                  </div>
                  <div className="metric-value" style={{ fontSize: "1.9rem", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
                    {categories.length} <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 600 }}>categories</span>
                  </div>
                  <div className="metric-label" style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600, marginTop: "4px" }}>
                    Total Categories
                  </div>
                </div>
              </div>

              {/* Row 3: Sales Chart & Top Products */}
              <div
                className="admin-chart-row"
                style={{
                  gap: "20px",
                  marginBottom: "28px",
                }}
              >
                {/* Sales Chart */}
                <div className="admin-card" style={{ backgroundColor: "#0d121c", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <div className="admin-chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "1rem", color: "#f8fafc" }}>
                      <Icon name="trending-up" style={{ width: "18px", height: "18px", color: "var(--primary)" }} />
                      <span>Sales, last 14 days</span>
                    </div>
                    <div className="admin-chart-pills" style={{ display: "flex", gap: "12px", fontSize: "0.78rem", flexWrap: "wrap" }}>
                      <div><span style={{ color: "#64748b" }}>Today: </span><span style={{ fontWeight: 800, color: "#ffffff" }}>₹{todaySales.toLocaleString("en-IN")}</span></div>
                      <div><span style={{ color: "#64748b" }}>7 days: </span><span style={{ fontWeight: 800, color: "#ffffff" }}>₹{sevenDaysSales.toLocaleString("en-IN")}</span></div>
                      <div><span style={{ color: "#64748b" }}>30 days: </span><span style={{ fontWeight: 800, color: "var(--primary)" }}>₹{thirtyDaysSales.toLocaleString("en-IN")}</span></div>
                    </div>
                  </div>

                  <div style={{ height: "180px", display: "flex", alignItems: "flex-end", gap: "8px", paddingBottom: "10px" }}>
                    {salesDays.map((bar, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <div
                          style={{
                            width: "100%",
                            height: `${Math.max(bar.value * 1.5, 8)}px`,
                            borderRadius: "6px 6px 2px 2px",
                            backgroundColor: bar.isPeak ? "var(--primary)" : "rgba(255, 255, 255, 0.08)",
                          }}
                        />
                        <span style={{ fontSize: "0.62rem", color: bar.isPeak ? "var(--primary)" : "#64748b", fontWeight: bar.isPeak ? 800 : 500 }}>
                          {bar.label.split(" ")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div className="admin-card" style={{ backgroundColor: "#0d121c", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "1rem", color: "#f8fafc" }}>
                      <Icon name="package" style={{ width: "18px", height: "18px", color: "var(--primary)" }} />
                      <span>Top products</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>last 30 days</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {topProducts.map((p, idx) => (
                      <div key={p.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700 }}>
                          <span style={{ color: "#ffffff", maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {idx + 1}. {p.name}
                          </span>
                          <span style={{ color: "var(--primary)" }}>
                            ₹{p.revenue.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(255, 255, 255, 0.06)", borderRadius: "2px", marginTop: "6px", overflow: "hidden" }}>
                          <div style={{ width: `${p.percentage}%`, height: "100%", backgroundColor: "var(--primary)", transition: "width 0.4s ease" }} />
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "3px" }}>
                          {p.unitsSold} units sold • {p.brand}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Quick Actions */}
              <div className="admin-shortcuts-card admin-card" style={{ backgroundColor: "#0d121c", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255, 255, 255, 0.07)", marginBottom: "28px" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#ffffff", marginBottom: "16px" }}>
                  Quick Shortcuts
                </div>
                <div className="admin-shortcuts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <button
                    onClick={() => {
                      handleSelectSection("products");
                      setShowAddProductModal(true);
                    }}
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "14px", color: "#ffffff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <Icon name="plus" style={{ width: "16px", height: "16px", color: "var(--primary)" }} />
                    <span>Add New SKU</span>
                  </button>

                  <button
                    onClick={() => handleSelectSection("categories")}
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "14px", color: "#ffffff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <Icon name="layers" style={{ width: "16px", height: "16px", color: "var(--primary)" }} />
                    <span>Manage Categories</span>
                  </button>

                  <button
                    onClick={() => handleSelectSection("coupons")}
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "14px", color: "#ffffff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <Icon name="tag" style={{ width: "16px", height: "16px", color: "var(--primary)" }} />
                    <span>Create Promo Coupon</span>
                  </button>

                  <button
                    onClick={() => handleSelectSection("delivery-settings")}
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "14px", color: "#ffffff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <Icon name="truck" style={{ width: "16px", height: "16px", color: "var(--primary)" }} />
                    <span>Logistics Rules</span>
                  </button>
                </div>
              </div>

              {/* Row 5: Recent Orders Table */}
              <div className="admin-table-card admin-card" style={{ backgroundColor: "#0d121c", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#ffffff" }}>
                    Recent Customer Orders
                  </div>
                  <button
                    onClick={() => handleSelectSection("orders")}
                    style={{ background: "transparent", border: "none", color: "var(--primary)", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    View All Orders
                  </button>
                </div>

                <div className="admin-table-container" style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#64748b", fontSize: "0.75rem", fontWeight: 800 }}>
                        <th style={{ padding: "12px 16px" }}>ORDER NUMBER</th>
                        <th style={{ padding: "12px 16px" }}>CUSTOMER / WORKSHOP</th>
                        <th style={{ padding: "12px 16px" }}>TOTAL AMOUNT</th>
                        <th style={{ padding: "12px 16px" }}>ORDER STATUS</th>
                        <th style={{ padding: "12px 16px" }}>PAYMENT</th>
                        <th style={{ padding: "12px 16px", textAlign: "right" }}>DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 4).map((o) => (
                        <tr key={o.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                          <td style={{ padding: "14px 16px", fontWeight: 800, color: "#ffffff" }}>#{o.id}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: 700, color: "#f8fafc" }}>{o.workshopName}</div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{o.customerName}</div>
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--primary)" }}>
                            ₹{o.total.toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, backgroundColor: o.status === "Delivered" ? "rgba(16, 185, 129, 0.15)" : o.status === "Dispatched" ? "rgba(59, 130, 246, 0.15)" : "rgba(249, 87, 22, 0.15)", color: o.status === "Delivered" ? "#10b981" : o.status === "Dispatched" ? "#60a5fa" : "var(--primary)" }}>
                              {o.status}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700, backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", textAlign: "right", color: "#64748b", fontSize: "0.82rem" }}>
                            {o.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 2: CATEGORIES MANAGEMENT
              ======================================================== */}
          {currentSection === "categories" && (
            <div>
              <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    Categories Management
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Structure engine spares & electrical families for vehicle fitment and mechanic search.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  style={{ backgroundColor: "var(--primary)", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(249, 87, 22, 0.35)" }}
                >
                  <Icon name="plus" style={{ width: "16px", height: "16px" }} />
                  <span>Add New Category</span>
                </button>
              </div>

              {/* Categories Summary Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <div style={{ backgroundColor: "#0d121c", borderRadius: "16px", padding: "18px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Categories</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ffffff", marginTop: "4px" }}>{categories.length}</div>
                </div>
                <div style={{ backgroundColor: "#0d121c", borderRadius: "16px", padding: "18px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Active Product SKUs</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--primary)", marginTop: "4px" }}>{inventoryList.length}</div>
                </div>
                <div style={{ backgroundColor: "#0d121c", borderRadius: "16px", padding: "18px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Associated Brands</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#10b981", marginTop: "4px" }}>
                    {Array.from(new Set(categories.map((c) => c.brand).filter(Boolean))).length} ({Array.from(new Set(categories.map((c) => c.brand).filter(Boolean))).join(" & ")})
                  </div>
                </div>
              </div>

              {/* Categories Table */}
              <div style={{ backgroundColor: "#0d121c", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.07)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#64748b", fontSize: "0.75rem", fontWeight: 800 }}>
                      <th style={{ padding: "14px 20px" }}>CATEGORY NAME</th>
                      <th style={{ padding: "14px 20px" }}>BRAND</th>
                      <th style={{ padding: "14px 20px" }}>SLUG</th>
                      <th style={{ padding: "14px 20px" }}>ACTIVE SKUS</th>
                      <th style={{ padding: "14px 20px" }}>STATUS</th>
                      <th style={{ padding: "14px 20px", textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.92rem" }}>{cat.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>{cat.description}</div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, backgroundColor: cat.brand === "Nexcolle" ? "rgba(249, 87, 22, 0.15)" : "rgba(245, 158, 11, 0.15)", color: cat.brand === "Nexcolle" ? "var(--primary)" : "#f59e0b" }}>
                            {cat.brand}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", color: "#94a3b8", fontFamily: "monospace" }}>
                          {cat.slug}
                        </td>
                        <td style={{ padding: "16px 20px", fontWeight: 800, color: "#ffffff" }}>
                          {inventoryList.filter((p) => p.category?.toLowerCase() === cat.slug?.toLowerCase() || p.category?.toLowerCase() === cat.id?.toLowerCase()).length} SKUs
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <button
                            onClick={() => {
                              setCategories((prev) =>
                                prev.map((c) =>
                                  c.id === cat.id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c
                                )
                              );
                              showToast(`Category ${cat.name} updated`);
                            }}
                            style={{ padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer", backgroundColor: cat.status === "Active" ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.06)", color: cat.status === "Active" ? "#10b981" : "#94a3b8" }}
                          >
                            {cat.status}
                          </button>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <button
                            onClick={() => {
                              setProductCategoryFilter(cat.slug);
                              handleSelectSection("products");
                            }}
                            style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", marginRight: "8px" }}
                          >
                            View SKUs
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setEditCatName(cat.name);
                              setEditCatBrand(cat.brand);
                              setEditCatSlug(cat.slug);
                              setEditCatDesc(cat.description);
                              setShowEditCategoryModal(true);
                            }}
                            style={{ background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.25)", color: "#60a5fa", padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", marginRight: "8px" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                                setCategories((prev) => prev.filter((c) => c.id !== cat.id));
                                try {
                                  const existing = JSON.parse(localStorage.getItem("shk_custom_categories") || "[]");
                                  localStorage.setItem("shk_custom_categories", JSON.stringify(existing.filter((c: any) => c.id !== cat.id)));
                                } catch {}
                                const res = await deleteCategory(cat.id);
                                if (res.success) {
                                  showToast(`Deleted category "${cat.name}" from database`);
                                } else {
                                  showToast(`Deleted locally (${res.error || "Database pending"})`);
                                }
                              }
                            }}
                            style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "6px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Category Modal */}
              {showAddCategoryModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", display: "grid", placeItems: "center", zIndex: 999 }}>
                  <div style={{ backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "20px", padding: "28px", maxWidth: "480px", width: "90%" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff", marginTop: 0 }}>Add New Category</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "18px" }}>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Category Name</label>
                        <input
                          type="text"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="e.g. Engine Gasket Kits"
                          style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Brand</label>
                        <select
                          value={newCatBrand}
                          onChange={(e) => setNewCatBrand(e.target.value as any)}
                          style={{ width: "100%", backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                        >
                          <option value="Nexcolle">Nexcolle (Batteries)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>URL Slug</label>
                        <input
                          type="text"
                          value={newCatSlug}
                          onChange={(e) => setNewCatSlug(e.target.value)}
                          placeholder="e.g. gasket-kits"
                          style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Description</label>
                        <textarea
                          value={newCatDesc}
                          onChange={(e) => setNewCatDesc(e.target.value)}
                          placeholder="High-tensile asbestos-free gaskets..."
                          rows={2}
                          style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                        />
                      </div>
                      <ImageKitUpload
                        label="Category Thumbnail (Stored on ImageKit CDN)"
                        folder="/categories"
                        currentUrl={newCatImage}
                        onUploaded={(url) => setNewCatImage(url)}
                        onRemove={() => setNewCatImage("")}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                      <button
                        onClick={() => setShowAddCategoryModal(false)}
                        style={{ backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!newCatName.trim()) {
                            showToast("Please enter a category name");
                            return;
                          }
                          const catSlug = (newCatSlug || newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
                          const newCat: AdminCategory = {
                            id: catSlug,
                            name: newCatName.trim(),
                            brand: newCatBrand,
                            slug: catSlug,
                            skuCount: 0,
                            description: newCatDesc.trim(),
                            status: "Active",
                            displayOrder: categories.length + 1,
                          };
                          setCategories((prev) => [newCat, ...prev]);
                          try {
                            const existing = JSON.parse(localStorage.getItem("shk_custom_categories") || "[]");
                            localStorage.setItem("shk_custom_categories", JSON.stringify([newCat, ...existing.filter((c: any) => c.id !== newCat.id)]));
                          } catch {}
                          setShowAddCategoryModal(false);
                          setNewCatName("");
                          setNewCatSlug("");
                          setNewCatDesc("");
                          setNewCatImage("");

                          const res = await createCategory({
                            id: newCat.id,
                            name: newCat.name,
                            brand: newCat.brand,
                            slug: newCat.slug,
                            description: newCat.description,
                            image: newCatImage || (newCatBrand === "Nexcolle" ? "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg" : "https://ik.imagekit.io/lv0h5ou9z/products/piston.jpg"),
                            productCount: 0,
                          });
                          if (res.success) {
                            showToast(`Category "${newCat.name}" saved to database`);
                          } else {
                            showToast(`Category added locally (${res.error || "Database pending"})`);
                          }
                        }}
                        style={{ backgroundColor: "var(--primary)", border: "none", color: "#ffffff", padding: "8px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Create Category
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Category Modal */}
              {showEditCategoryModal && editingCategory && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", display: "grid", placeItems: "center", zIndex: 999 }}>
                  <div style={{ backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "20px", padding: "28px", maxWidth: "480px", width: "90%" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff", marginTop: 0 }}>Edit Category</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "18px" }}>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Category Name</label>
                        <input
                          type="text"
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                          style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Brand</label>
                        <select
                          value={editCatBrand}
                          onChange={(e) => setEditCatBrand(e.target.value as any)}
                          style={{ width: "100%", backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                        >
                          <option value="Nexcolle">Nexcolle (Batteries)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>URL Slug</label>
                        <input
                          type="text"
                          value={editCatSlug}
                          onChange={(e) => setEditCatSlug(e.target.value)}
                          style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Description</label>
                        <textarea
                          value={editCatDesc}
                          onChange={(e) => setEditCatDesc(e.target.value)}
                          rows={3}
                          style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                      <button
                        onClick={() => {
                          setShowEditCategoryModal(false);
                          setEditingCategory(null);
                        }}
                        style={{ backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!editCatName.trim()) return;
                          const updated = {
                            name: editCatName.trim(),
                            brand: editCatBrand,
                            slug: editCatSlug.trim() || editingCategory.slug,
                            description: editCatDesc.trim(),
                          };
                          setCategories((prev) =>
                            prev.map((c) =>
                              c.id === editingCategory.id ? { ...c, ...updated } : c
                            )
                          );
                          setShowEditCategoryModal(false);
                          const res = await updateCategory(editingCategory.id, updated);
                          if (res.success) {
                            showToast(`Category "${updated.name}" updated in database`);
                          } else {
                            showToast(`Update error: ${res.error || "Failed"}`);
                          }
                          setEditingCategory(null);
                        }}
                        style={{ backgroundColor: "var(--primary)", border: "none", color: "#ffffff", padding: "8px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              VIEW 3: PRODUCTS & INVENTORY
              ======================================================== */}
          {currentSection === "products" && (
            <div>
              <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    Products & Inventory
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Manage OEM-spec spare parts, stock levels, and wholesale volume pricing.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  style={{ backgroundColor: "var(--primary)", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(249, 87, 22, 0.35)" }}
                >
                  <Icon name="plus" style={{ width: "16px", height: "16px" }} />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Filters Bar */}
              <div style={{ backgroundColor: "#0d121c", borderRadius: "16px", padding: "16px 20px", border: "1px solid rgba(255, 255, 255, 0.07)", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ flex: "1 1 240px", position: "relative" }}>
                  <Icon name="search" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#64748b" }} />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by SKU, title or vehicle fitment..."
                    style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "8px 12px 8px 36px", color: "#ffffff", fontSize: "0.85rem" }}
                  />
                </div>

                <select
                  value={productBrandFilter}
                  onChange={(e) => setProductBrandFilter(e.target.value)}
                  style={{ backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "8px 12px", color: "#ffffff", fontSize: "0.82rem" }}
                >
                  <option value="all">All Brands</option>
                  <option value="Nexcolle">Nexcolle</option>
                </select>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  style={{ backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "8px 12px", color: "#ffffff", fontSize: "0.82rem" }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={productStockFilter}
                  onChange={(e) => setProductStockFilter(e.target.value)}
                  style={{ backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "8px 12px", color: "#ffffff", fontSize: "0.82rem" }}
                >
                  <option value="all">All Stock Status</option>
                  <option value="low">Low Stock (&lt; 10)</option>
                  <option value="instock">In Stock (&gt;= 10)</option>
                </select>
              </div>

              {/* Products Table */}
              <div style={{ backgroundColor: "#0d121c", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.07)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#64748b", fontSize: "0.75rem", fontWeight: 800 }}>
                      <th style={{ padding: "14px 20px" }}>PRODUCT</th>
                      <th style={{ padding: "14px 20px" }}>BRAND</th>
                      <th style={{ padding: "14px 20px" }}>BASE PRICE</th>
                      <th style={{ padding: "14px 20px" }}>INVENTORY STOCK</th>
                      <th style={{ padding: "14px 20px" }}>STATUS</th>
                      <th style={{ padding: "14px 20px", textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ fontWeight: 800, color: "#ffffff" }}>{p.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                            SKU: {p.id} • {p.category.toUpperCase()}
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, backgroundColor: p.brand === "Nexcolle" ? "rgba(249, 87, 22, 0.15)" : "rgba(245, 158, 11, 0.15)", color: p.brand === "Nexcolle" ? "var(--primary)" : "#f59e0b" }}>
                            {p.brand}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", fontWeight: 800, color: "var(--primary)" }}>
                          ₹{p.price.toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          {editingStockId === p.id ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <input
                                type="number"
                                value={newStockVal}
                                onChange={(e) => setNewStockVal(Number(e.target.value))}
                                style={{ width: "70px", backgroundColor: "#070a0f", border: "1px solid var(--primary)", borderRadius: "6px", padding: "4px 8px", color: "#ffffff", fontSize: "0.85rem" }}
                              />
                              <button
                                onClick={() => handleUpdateStock(p.id)}
                                style={{ backgroundColor: "var(--primary)", border: "none", color: "#ffffff", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontWeight: 800, color: p.stock < 10 ? "#f59e0b" : "#ffffff" }}>{p.stock} units</span>
                              <button
                                onClick={() => {
                                  setEditingStockId(p.id);
                                  setNewStockVal(p.stock);
                                }}
                                style={{ background: "transparent", border: "none", color: "var(--primary)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, backgroundColor: p.stock >= 10 ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)", color: p.stock >= 10 ? "#10b981" : "#f59e0b" }}>
                            {p.stock >= 10 ? "In Stock" : "Low Stock"}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "right" }}>
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", marginRight: "8px" }}
                          >
                            Preview
                          </Link>
                          <button
                            onClick={() => {
                              setInventoryList((prev) => prev.filter((item) => item.id !== p.id));
                              try {
                                const existing = JSON.parse(localStorage.getItem("shk_custom_products") || "[]");
                                localStorage.setItem("shk_custom_products", JSON.stringify(existing.filter((item: any) => item.id !== p.id)));
                              } catch {}
                              deleteProduct(p.id).catch((err) => console.warn("Supabase delete product error:", err));
                              showToast(`Removed SKU ${p.id} from database`);
                            }}
                            style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", padding: "6px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Product Modal */}
              {showAddProductModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", display: "grid", placeItems: "center", zIndex: 999 }}>
                  <div style={{ backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "20px", padding: "28px", maxWidth: "520px", width: "90%" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff", marginTop: 0 }}>Add New Spare Part</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Part Title</label>
                        <input
                          type="text"
                          value={newProdTitle}
                          onChange={(e) => setNewProdTitle(e.target.value)}
                          placeholder="e.g. Nexcolle Pro-Power 12V 4Ah"
                          style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                        />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Brand</label>
                          <select
                            value={newProdBrand}
                            onChange={(e) => setNewProdBrand(e.target.value as any)}
                            style={{ width: "100%", backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                          >
                            <option value="Nexcolle">Nexcolle</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Category</label>
                          <select
                            value={newProdCategory}
                            onChange={(e) => setNewProdCategory(e.target.value)}
                            style={{ width: "100%", backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.slug}>
                                {c.name} ({c.brand})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Price (₹)</label>
                          <input
                            type="number"
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(Number(e.target.value))}
                            style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Initial Stock</label>
                          <input
                            type="number"
                            value={newProdStock}
                            onChange={(e) => setNewProdStock(Number(e.target.value))}
                            style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                          />
                        </div>
                      </div>
                      <ImageKitUpload
                        label="Product Image or Video (Stored on ImageKit CDN)"
                        folder="/products"
                        currentUrl={newProdImage}
                        onUploaded={(url) => setNewProdImage(url)}
                        onRemove={() => setNewProdImage("")}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                      <button
                        onClick={() => setShowAddProductModal(false)}
                        style={{ backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!newProdTitle) return;
                          const newId = `shk-custom-${Date.now()}`;
                          const newSlug = newProdTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                          const fallbackImg = newProdBrand === "Nexcolle"
                            ? "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg"
                            : "https://ik.imagekit.io/lv0h5ou9z/products/piston.jpg";
                          const prodImg = newProdImage || fallbackImg;
                          const newProduct: Product = {
                            id: newId,
                            slug: newSlug,
                            title: newProdTitle,
                            brand: newProdBrand,
                            category: newProdCategory,
                            price: newProdPrice,
                            originalPrice: Math.round(newProdPrice * 1.25),
                            discount: 20,
                            stock: newProdStock,
                            inStock: newProdStock > 0,
                            shortDesc: "Commercial grade spare part engineered for Indian road duty.",
                            description: "Precision manufactured to strict OEM fitment standards.",
                            image: prodImg,
                            gallery: [prodImg],
                            badge: `${newProdBrand}™`,
                            meta: "Commercial Spares",
                            specs: ["JIS Grade Metallurgy", "100% Quality Inspected"],
                            specDetails: { "Fitment": "Universal 100-150cc", "Warranty": "12 Months" },
                            oemTag: "OEM Spec",
                            rating: 5.0,
                            reviewsCount: 0,
                            compatibleBikes: ["Hero Splendor", "Honda Activa", "Bajaj Pulsar"],
                            warranty: "12 Months Replacement Warranty",
                            wholesaleTiers: [
                              { minQty: 10, discountPercent: 12, pricePerUnit: Math.round(newProdPrice * 0.88) },
                              { minQty: 30, discountPercent: 20, pricePerUnit: Math.round(newProdPrice * 0.80) },
                              { minQty: 100, discountPercent: 28, pricePerUnit: Math.round(newProdPrice * 0.72) },
                            ],
                          };

                          // Update UI immediately (new added product at TOP)
                          setInventoryList((prev) => [newProduct, ...prev]);
                          try {
                            const existing = JSON.parse(localStorage.getItem("shk_custom_products") || "[]");
                            localStorage.setItem("shk_custom_products", JSON.stringify([newProduct, ...existing.filter((p: any) => p.id !== newProduct.id)]));
                          } catch {}
                          setShowAddProductModal(false);
                          setNewProdTitle("");
                          setNewProdImage("");

                          // Persist permanently in Supabase Database!
                          createProduct(newProduct)
                            .then((res) => {
                              if (res.success) {
                                showToast("Product saved to Supabase database successfully!");
                              } else {
                                showToast(`Product added locally (${res.error || "Database pending"})`);
                              }
                            })
                            .catch((err) => {
                              console.error("Supabase createProduct err:", err);
                              showToast("Product added locally (Database pending)");
                            });
                        }}
                        style={{ backgroundColor: "var(--primary)", border: "none", color: "#ffffff", padding: "8px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Add to Catalog
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              VIEW 4: ORDERS MANAGEMENT
              ======================================================== */}
          {currentSection === "orders" && (
            <div>
              <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    Orders & Workshop Dispatches
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Track B2B garage orders, courier logistics, and invoice statuses.
                  </p>
                </div>
                <button
                  onClick={() => showToast("Exported orders to CSV format")}
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", padding: "10px 18px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
                >
                  Export Orders CSV
                </button>
              </div>

              {/* Status Filter Tabs & Search */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", gap: "8px", backgroundColor: "#0d121c", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  {(["all", "Processing", "Dispatched", "Delivered"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setOrderStatusFilter(tab)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: orderStatusFilter === tab ? "var(--primary)" : "transparent",
                        color: orderStatusFilter === tab ? "#ffffff" : "#94a3b8",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                      }}
                    >
                      {tab === "all" ? "All Orders" : tab} ({tab === "all" ? orders.length : orders.filter((o) => o.status === tab).length})
                    </button>
                  ))}
                </div>

                <div style={{ width: "260px" }}>
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search order ID or workshop..."
                    style={{ width: "100%", backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "8px 12px", color: "#ffffff", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              {/* Orders Table */}
              <div style={{ backgroundColor: "#0d121c", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.07)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#64748b", fontSize: "0.75rem", fontWeight: 800 }}>
                      <th style={{ padding: "14px 20px" }}>ORDER #</th>
                      <th style={{ padding: "14px 20px" }}>WORKSHOP & CUSTOMER</th>
                      <th style={{ padding: "14px 20px" }}>ORDER ITEMS</th>
                      <th style={{ padding: "14px 20px" }}>TOTAL (₹)</th>
                      <th style={{ padding: "14px 20px" }}>STATUS</th>
                      <th style={{ padding: "14px 20px", textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ fontWeight: 800, color: "#ffffff" }}>#{o.id}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>{o.date}</div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ fontWeight: 700, color: "#f8fafc" }}>{o.workshopName}</div>
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{o.customerName} • {o.paymentMethod}</div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ color: "#cbd5e1", fontSize: "0.82rem" }}>{o.items}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 700, marginTop: "2px" }}>{o.units} units total</div>
                        </td>
                        <td style={{ padding: "16px 20px", fontWeight: 800, color: "var(--primary)", fontSize: "0.95rem" }}>
                          ₹{o.total.toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                            style={{
                              backgroundColor: "#070a0f",
                              color: o.status === "Delivered" ? "#10b981" : o.status === "Dispatched" ? "#60a5fa" : "var(--primary)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: "6px",
                              padding: "4px 8px",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "right" }}>
                          <button
                            onClick={() => showToast(`Invoice generated for order #${o.id}`)}
                            style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", marginRight: "6px" }}
                          >
                            Invoice
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete order #${o.id}?`)) {
                                setOrders((prev) => prev.filter((item) => item.id !== o.id));
                                showToast(`Order #${o.id} deleted`);
                                await deleteOrder(o.id);
                              }
                            }}
                            style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", padding: "6px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 5: HOME CUSTOMIZATION
              ======================================================== */}
          {currentSection === "home-customization" && (
            <div>
              <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    Home Page Customization
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Configure hero headlines, brand spotlight sections, and vehicle compatibility lookup.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      localStorage.setItem("shk_home_customization", JSON.stringify(homeCustom));
                      window.dispatchEvent(new Event("shk_home_custom_updated"));
                      await fetch("/api/home-customization", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(homeCustom),
                      });
                      showToast("Homepage settings saved and published live to Home Page!");
                    } catch {
                      showToast("Error saving homepage settings");
                    }
                  }}
                  style={{ backgroundColor: "var(--primary)", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(249, 87, 22, 0.35)" }}
                >
                  Save Changes
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Hero Settings */}
                <div style={{ backgroundColor: "#0d121c", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff", marginTop: 0, marginBottom: "16px" }}>
                    Hero Banner Typography
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Top Badge</label>
                      <input
                        type="text"
                        value={homeCustom.heroBadge}
                        onChange={(e) => setHomeCustom({ ...homeCustom, heroBadge: e.target.value })}
                        style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.85rem", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Main Headline</label>
                      <input
                        type="text"
                        value={homeCustom.heroHeadline}
                        onChange={(e) => setHomeCustom({ ...homeCustom, heroHeadline: e.target.value })}
                        style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.85rem", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Sub-headline Paragraph</label>
                      <textarea
                        rows={3}
                        value={homeCustom.heroSubtitle}
                        onChange={(e) => setHomeCustom({ ...homeCustom, heroSubtitle: e.target.value })}
                        style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.85rem", marginTop: "4px" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section Visibility Toggles */}
                <div style={{ backgroundColor: "#0d121c", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff", marginTop: 0, marginBottom: "16px" }}>
                    Homepage Sections Visibility
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[
                      { key: "showCompatibilityMatrix", label: "OEM Two-Wheeler Compatibility Matrix", desc: "Display quick brand picker for Hero, Honda, Bajaj, TVS, Yamaha, Enfield" },
                      { key: "showBrandPillars", label: "Brand Pillars Spotlight (Nexcolle Batteries)", desc: "Engineering legacy, battery specs and performance breakdown" },
                      { key: "showWholesaleSlabs", label: "Wholesale Garage Volume Slabs", desc: "Show 10+, 30+, 100+ units volume discount banners" },
                      { key: "showSupplyChainTrust", label: "Mechanic Supply Chain Trust Assurance", desc: "Show Japanese AC8A & VRLA warranty trust banner" },
                    ].map((sec) => (
                      <div key={sec.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#ffffff" }}>{sec.label}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{sec.desc}</div>
                        </div>
                        <button
                          onClick={() => {
                            const k = sec.key as keyof typeof homeCustom;
                            setHomeCustom({ ...homeCustom, [k]: !homeCustom[k] });
                          }}
                          style={{
                            width: "48px",
                            height: "26px",
                            borderRadius: "13px",
                            border: "none",
                            backgroundColor: homeCustom[sec.key as keyof typeof homeCustom] ? "var(--primary)" : "rgba(255, 255, 255, 0.15)",
                            cursor: "pointer",
                            position: "relative",
                            transition: "background 0.2s ease",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: "3px",
                              left: homeCustom[sec.key as keyof typeof homeCustom] ? "25px" : "3px",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              backgroundColor: "#ffffff",
                              transition: "left 0.2s ease",
                            }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 6: CUSTOMERS / WORKSHOP GARAGES
              ======================================================== */}
          {currentSection === "customers" && (
            <div>
              <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    Registered Garages & Mechanics
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Directory of verified automotive retailers, mechanics, and trade workshop accounts.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  style={{ backgroundColor: "var(--primary)", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(249, 87, 22, 0.35)" }}
                >
                  <Icon name="plus" style={{ width: "16px", height: "16px" }} />
                  <span>Add Partner Garage</span>
                </button>
              </div>

              <div style={{ backgroundColor: "#0d121c", borderRadius: "16px", padding: "16px 20px", border: "1px solid rgba(255, 255, 255, 0.07)", marginBottom: "20px" }}>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Filter by workshop name, mechanic name, or city..."
                  style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px 14px", color: "#ffffff", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ backgroundColor: "#0d121c", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.07)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#64748b", fontSize: "0.75rem", fontWeight: 800 }}>
                      <th style={{ padding: "14px 20px" }}>GARAGE & OWNER</th>
                      <th style={{ padding: "14px 20px" }}>LOCATION</th>
                      <th style={{ padding: "14px 20px" }}>CONTACT</th>
                      <th style={{ padding: "14px 20px" }}>TRADE TIER</th>
                      <th style={{ padding: "14px 20px" }}>TOTAL ORDERS</th>
                      <th style={{ padding: "14px 20px" }}>VERIFICATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                          No registered workshop garages found. Real registered trade accounts from Supabase will appear here automatically.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((c, idx) => (
                        <tr key={`${c.id}-${c.email || idx}`} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ fontWeight: 800, color: "#ffffff" }}>{c.garage}</div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{c.name} • #{c.id}</div>
                          </td>
                          <td style={{ padding: "16px 20px", color: "#cbd5e1" }}>
                            {c.city && c.city !== "—" ? `${c.city}${c.state ? `, ${c.state}` : ""}` : (c.state || "—")}
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ color: "var(--primary)", fontWeight: 700 }}>{c.phone || "—"}</div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{c.email || "—"}</div>
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
                              {c.tier}
                            </span>
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ fontWeight: 800, color: "#ffffff" }}>{c.ordersCount} orders</div>
                            <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 700 }}>₹{c.totalSpend.toLocaleString("en-IN")}</div>
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <button
                              onClick={async () => {
                                const newStatus = !c.verified;
                                setCustomers((prev) =>
                                  prev.map((cust) => (cust.id === c.id ? { ...cust, verified: newStatus } : cust))
                                );
                                await toggleCustomerVerification(c.id, newStatus);
                                showToast(`Updated verification for ${c.garage}`);
                              }}
                              style={{ padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer", backgroundColor: c.verified ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)", color: c.verified ? "#10b981" : "#f59e0b" }}
                            >
                              {c.verified ? "Verified B2B" : "Pending"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Customer Modal */}
              {showAddCustomerModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", display: "grid", placeItems: "center", zIndex: 999 }}>
                  <div style={{ backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "20px", padding: "28px", maxWidth: "520px", width: "90%" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff", marginTop: 0 }}>Add Workshop Garage / Partner</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "18px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Garage Name</label>
                          <input
                            type="text"
                            value={newCustGarage}
                            onChange={(e) => setNewCustGarage(e.target.value)}
                            placeholder="e.g. Metro Moto Care"
                            style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Owner / Mechanic Name</label>
                          <input
                            type="text"
                            value={newCustName}
                            onChange={(e) => setNewCustName(e.target.value)}
                            placeholder="e.g. Amit Kumar"
                            style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Phone Number</label>
                          <input
                            type="text"
                            value={newCustPhone}
                            onChange={(e) => setNewCustPhone(e.target.value)}
                            placeholder="+91 98765 00000"
                            style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Email Address</label>
                          <input
                            type="email"
                            value={newCustEmail}
                            onChange={(e) => setNewCustEmail(e.target.value)}
                            placeholder="garage@example.com"
                            style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>City</label>
                          <input
                            type="text"
                            value={newCustCity}
                            onChange={(e) => setNewCustCity(e.target.value)}
                            placeholder="e.g. Delhi"
                            style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Trade Tier</label>
                          <select
                            value={newCustTier}
                            onChange={(e) => setNewCustTier(e.target.value as any)}
                            style={{ width: "100%", backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", marginTop: "4px" }}
                          >
                            <option value="Gold Wholesale Partner">Gold Wholesale Partner</option>
                            <option value="Silver Garage">Silver Garage</option>
                            <option value="Retail Mechanic">Retail Mechanic</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                      <button
                        onClick={() => setShowAddCustomerModal(false)}
                        style={{ backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!newCustName.trim()) {
                            showToast("Please enter owner / mechanic name");
                            return;
                          }
                          const newCust: AdminCustomer = {
                            id: `CUST-${newCustPhone ? newCustPhone.replace(/\D/g, "").slice(-6) : Math.floor(Math.random() * 90000 + 10000)}`,
                            name: newCustName.trim(),
                            garage: newCustGarage.trim() || "Workshop Garage",
                            city: newCustCity.trim() || "Delhi",
                            state: newCustState.trim() || "Delhi",
                            phone: newCustPhone.trim(),
                            email: newCustEmail.trim(),
                            tier: newCustTier,
                            ordersCount: 0,
                            totalSpend: 0,
                            verified: true,
                            joinedDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                          };
                          setCustomers((prev) => [newCust, ...prev]);
                          try {
                            const existing = JSON.parse(localStorage.getItem("shk_custom_customers") || "[]");
                            localStorage.setItem("shk_custom_customers", JSON.stringify([newCust, ...existing.filter((c: any) => c.id !== newCust.id)]));
                          } catch {}
                          setShowAddCustomerModal(false);
                          setNewCustName("");
                          setNewCustGarage("");
                          setNewCustPhone("");
                          setNewCustEmail("");
                          setNewCustCity("");
                          const res = await createCustomer(newCust);
                          if (res.success) {
                            showToast(`Customer "${newCust.name}" saved to Supabase`);
                          } else {
                            showToast(`Saved locally. (${res.error || "Database pending"})`);
                          }
                        }}
                        style={{ backgroundColor: "var(--primary)", border: "none", color: "#ffffff", padding: "8px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Add Customer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              VIEW 7: REVIEWS MODERATION
              ======================================================== */}
          {currentSection === "reviews" && (
            <div>
              <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    Reviews & Feedback Moderation
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Approve or moderate technician reviews before they appear on product pages.
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                {(["all", "Approved", "Pending"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setReviewFilter(st)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: reviewFilter === st ? "var(--primary)" : "#0d121c",
                      color: reviewFilter === st ? "#ffffff" : "#94a3b8",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    {st === "all" ? "All Reviews" : st} ({st === "all" ? reviews.length : reviews.filter((r) => r.status === st).length})
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {filteredReviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b", backgroundColor: "#0d121c", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>★</div>
                    <div style={{ fontWeight: 700, color: "#cbd5e1", fontSize: "1rem" }}>No reviews submitted yet</div>
                    <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px" }}>
                      Customer reviews submitted from product pages will appear here live from Supabase.
                    </div>
                  </div>
                ) : (
                  filteredReviews.map((r) => (
                    <div key={r.id} style={{ backgroundColor: "#0d121c", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div>
                          <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.95rem" }}>
                            {r.customerName} {r.garage && <span style={{ color: "#64748b", fontWeight: 500 }}>({r.garage}{r.city ? `, ${r.city}` : ""})</span>}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 700, marginTop: "2px" }}>
                            Product: {r.productName}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ color: "#f59e0b", fontSize: "1rem" }}>{"★".repeat(r.rating)}</span>
                          <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 800, backgroundColor: r.status === "Approved" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)", color: r.status === "Approved" ? "#10b981" : "#f59e0b" }}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: "0.88rem", margin: "10px 0 14px 0", lineHeight: 1.5 }}>
                        &ldquo;{r.comment}&rdquo;
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Posted: {r.date}</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {r.status === "Pending" ? (
                            <button
                              onClick={async () => {
                                setReviews((prev) => prev.map((item) => (item.id === r.id ? { ...item, status: "Approved" } : item)));
                                await updateReviewStatus(r.id, "Approved");
                                showToast("Review approved and published to product page");
                              }}
                              style={{ backgroundColor: "#10b981", border: "none", color: "#ffffff", padding: "6px 14px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                            >
                              <span>✓</span> Approve Review
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                setReviews((prev) => prev.map((item) => (item.id === r.id ? { ...item, status: "Pending" } : item)));
                                await updateReviewStatus(r.id, "Pending");
                                showToast("Review reverted to Pending (hidden from product page)");
                              }}
                              style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#f59e0b", padding: "6px 12px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                            >
                              Move to Pending
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              setReviews((prev) => prev.filter((item) => item.id !== r.id));
                              await deleteReview(r.id);
                              showToast("Review removed from database");
                            }}
                            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", padding: "6px 12px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 8: INQUIRIES & B2B RFQS
              ======================================================== */}
          {currentSection === "inquiries" && (
            <div>
              <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    B2B Inquiries & Quotation RFQs
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Wholesale volume quotation requests submitted by workshops and parts retailers.
                  </p>
                </div>
              </div>

              {/* Status Tabs */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                {(["all", "Pending", "Quoted", "Fulfilled"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setRfqFilter(st)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: rfqFilter === st ? "var(--primary)" : "#0d121c",
                      color: rfqFilter === st ? "#ffffff" : "#94a3b8",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    {st === "all" ? "All Inquiries" : st} ({st === "all" ? quotes.length : quotes.filter((q) => q.status === st).length})
                  </button>
                ))}
              </div>

              <div style={{ backgroundColor: "#0d121c", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.07)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#64748b", fontSize: "0.75rem", fontWeight: 800 }}>
                      <th style={{ padding: "14px 20px" }}>RFQ ID</th>
                      <th style={{ padding: "14px 20px" }}>WORKSHOP & CONTACT</th>
                      <th style={{ padding: "14px 20px" }}>REQUESTED PARTS & VOLUME</th>
                      <th style={{ padding: "14px 20px" }}>STATUS</th>
                      <th style={{ padding: "14px 20px", textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRfqs.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: "48px 20px", textAlign: "center", color: "#64748b" }}>
                          <div style={{ fontSize: "1.6rem", marginBottom: "6px" }}>✉</div>
                          <div style={{ fontWeight: 700, color: "#cbd5e1" }}>No inquiries found in database</div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
                            Customer and workshop inquiries submitted via the Contact page or Quote modal will appear here.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRfqs.map((q) => (
                        <tr key={q.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ fontWeight: 800, color: "#ffffff" }}>#{q.id.length > 12 ? q.id.slice(0, 8) : q.id}</div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{q.date}</div>
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ fontWeight: 800, color: "#f8fafc" }}>{q.garage}</div>
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{q.name} • {q.phone}</div>
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ color: "#ffffff", fontWeight: 700 }}>{q.parts}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 800 }}>{q.qty}</div>
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <select
                              value={q.status}
                              onChange={async (e) => {
                                const newSt = e.target.value as any;
                                setQuotes((prev) => prev.map((item) => (item.id === q.id ? { ...item, status: newSt } : item)));
                                await updateInquiryStatus(q.id, newSt);
                                showToast(`Inquiry marked as ${newSt}`);
                              }}
                              style={{ backgroundColor: "#070a0f", color: q.status === "Fulfilled" ? "#10b981" : q.status === "Quoted" ? "#60a5fa" : "var(--primary)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "6px", padding: "4px 8px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Quoted">Quoted</option>
                              <option value="Fulfilled">Fulfilled</option>
                            </select>
                          </td>
                          <td style={{ padding: "16px 20px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <a
                                href={`https://wa.me/${q.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${q.name}, regards from S.H.K ENTERPRISES. Here is your wholesale rate quote for ${q.parts}.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", display: "inline-block" }}
                              >
                                Reply on WA
                              </a>
                              <button
                                onClick={async () => {
                                  setQuotes((prev) => prev.filter((item) => item.id !== q.id));
                                  await deleteInquiry(q.id);
                                  showToast("Inquiry deleted from database");
                                }}
                                style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", padding: "6px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 9: HERO SLIDES (LIVE DYNAMIC)
              ======================================================== */}
          {currentSection === "hero-slides" && (
            <div>
              <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    Hero Carousel Slides
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Manage promotional carousel slides and banners dynamically on the storefront homepage.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddSlide}
                  style={{ backgroundColor: "var(--primary)", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(249, 87, 22, 0.35)" }}
                >
                  <Icon name="plus" style={{ width: "16px", height: "16px" }} />
                  <span>Add Slide</span>
                </button>
              </div>

              {heroSlides.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b", backgroundColor: "#0d121c", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🖼</div>
                  <div style={{ fontWeight: 700, color: "#cbd5e1", fontSize: "1.1rem" }}>No hero slides configured yet</div>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "6px auto 18px", maxWidth: "420px" }}>
                    Add promotional banner slides to showcase top automotive parts, warranties, and trade offers on your homepage.
                  </p>
                  <button
                    onClick={handleOpenAddSlide}
                    style={{ backgroundColor: "var(--primary)", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
                  >
                    + Add First Slide
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {heroSlides.map((slide) => (
                    <div
                      key={slide.id}
                      style={{
                        backgroundColor: "#0d121c",
                        borderRadius: "18px",
                        padding: "20px 24px",
                        border: "1px solid rgba(255, 255, 255, 0.07)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "20px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", gap: "18px", alignItems: "center", flex: 1, minWidth: "260px" }}>
                        {slide.image ? (
                          <div
                            style={{
                              width: "80px",
                              height: "60px",
                              borderRadius: "10px",
                              backgroundColor: "#070a0f",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                              overflow: "hidden",
                              flexShrink: 0,
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            <img
                              src={slide.image}
                              alt={slide.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: "80px",
                              height: "60px",
                              borderRadius: "10px",
                              backgroundColor: "rgba(249, 87, 22, 0.1)",
                              border: "1px solid rgba(249, 87, 22, 0.2)",
                              color: "var(--primary)",
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 800,
                              fontSize: "1.2rem",
                              flexShrink: 0,
                            }}
                          >
                            🖼
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {slide.badge}
                          </span>
                          <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#ffffff", marginTop: "4px" }}>
                            {slide.title}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "2px", lineHeight: 1.4 }}>
                            {slide.subtitle}
                          </div>
                          <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "6px" }}>
                            Button: <strong style={{ color: "#cbd5e1" }}>&ldquo;{slide.ctaText}&rdquo;</strong> &bull; Link: <strong style={{ color: "var(--primary)" }}>{slide.ctaLink}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <button
                          onClick={() => handleToggleSlideStatus(slide)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            border: "none",
                            cursor: "pointer",
                            backgroundColor: slide.status === "Active" ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.08)",
                            color: slide.status === "Active" ? "#10b981" : "#94a3b8",
                          }}
                        >
                          {slide.status === "Active" ? "✓ Active" : "Draft"}
                        </button>

                        <button
                          onClick={() => handleOpenEditSlide(slide)}
                          style={{
                            background: "rgba(59, 130, 246, 0.12)",
                            border: "1px solid rgba(59, 130, 246, 0.25)",
                            color: "#60a5fa",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteSlide(slide.id)}
                          style={{
                            background: "rgba(239, 68, 68, 0.12)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            color: "#ef4444",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add / Edit Slide Modal */}
              {showSlideModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", display: "grid", placeItems: "center", zIndex: 999, padding: "20px" }}>
                  <div style={{ backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "20px", padding: "28px", maxWidth: "540px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff", margin: 0 }}>
                        {editingSlide ? "Edit Hero Slide" : "Add New Hero Slide"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSlideModal(false);
                          setEditingSlide(null);
                        }}
                        style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveSlideSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>
                          Kicker / Badge Text
                        </label>
                        <input
                          type="text"
                          value={slideBadge}
                          onChange={(e) => setSlideBadge(e.target.value)}
                          placeholder="e.g. OEM-GRADE ENGINEERING & SPARES"
                          style={{ width: "100%", padding: "10px 14px", backgroundColor: "#070a0f", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", color: "#ffffff", fontSize: "0.88rem", outline: "none" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>
                          Headline / Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={slideTitle}
                          onChange={(e) => setSlideTitle(e.target.value)}
                          placeholder="e.g. Power Every Ride. Engineered to Last."
                          style={{ width: "100%", padding: "10px 14px", backgroundColor: "#070a0f", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", color: "#ffffff", fontSize: "0.88rem", outline: "none" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>
                          Subtitle / Description
                        </label>
                        <textarea
                          rows={2}
                          value={slideSubtitle}
                          onChange={(e) => setSlideSubtitle(e.target.value)}
                          placeholder="e.g. Genuine Nexcolle™ high-CCA motorcycle batteries engineered for extreme Indian weather."
                          style={{ width: "100%", padding: "10px 14px", backgroundColor: "#070a0f", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", color: "#ffffff", fontSize: "0.88rem", outline: "none", resize: "vertical" }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>
                            CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={slideCtaText}
                            onChange={(e) => setSlideCtaText(e.target.value)}
                            placeholder="e.g. Explore Catalog"
                            style={{ width: "100%", padding: "10px 14px", backgroundColor: "#070a0f", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", color: "#ffffff", fontSize: "0.88rem", outline: "none" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>
                            CTA Button Link
                          </label>
                          <input
                            type="text"
                            value={slideCtaLink}
                            onChange={(e) => setSlideCtaLink(e.target.value)}
                            placeholder="e.g. /products"
                            style={{ width: "100%", padding: "10px 14px", backgroundColor: "#070a0f", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", color: "#ffffff", fontSize: "0.88rem", outline: "none" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>
                          Slide Image (URL or Upload to ImageKit)
                        </label>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <input
                            type="text"
                            value={slideImage}
                            onChange={(e) => setSlideImage(e.target.value)}
                            placeholder="/images/hero-cnc-gear.jpg or ImageKit URL"
                            style={{ flex: 1, padding: "10px 14px", backgroundColor: "#070a0f", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", color: "#ffffff", fontSize: "0.88rem", outline: "none" }}
                          />
                          <ImageKitUpload
                            folder="/hero-slides"
                            label="Upload Banner to ImageKit"
                            currentUrl={slideImage}
                            onUploaded={(url: string) => setSlideImage(url)}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>
                          Status
                        </label>
                        <select
                          value={slideStatus}
                          onChange={(e) => setSlideStatus(e.target.value as any)}
                          style={{ width: "100%", padding: "10px 14px", backgroundColor: "#070a0f", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", color: "#ffffff", fontSize: "0.88rem", outline: "none" }}
                        >
                          <option value="Active">Active (Visible on Storefront)</option>
                          <option value="Draft">Draft (Hidden)</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSlideModal(false);
                            setEditingSlide(null);
                          }}
                          style={{ backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          style={{ backgroundColor: "var(--primary)", border: "none", color: "#ffffff", padding: "10px 22px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, boxShadow: "0 4px 14px rgba(249, 87, 22, 0.35)" }}
                        >
                          {editingSlide ? "Update Slide" : "Save Slide"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              VIEW 11: ANNOUNCEMENTS
              ======================================================== */}
          {currentSection === "announcements" && (
            <div>
              <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    Store Announcements & Top Banner
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Configure the top notification banner and promotional marquee shown across the storefront.
                  </p>
                </div>
                <button
                  onClick={handleSaveAnnouncement}
                  style={{ backgroundColor: "var(--primary)", color: "#ffffff", border: "none", padding: "10px 22px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(249, 87, 22, 0.35)", transition: "all 0.2s" }}
                >
                  Save Banner
                </button>
              </div>

              {/* Live Preview Card */}
              <div style={{ backgroundColor: "#0d121c", borderRadius: "18px", padding: "20px", border: "1px solid rgba(255, 255, 255, 0.07)", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    Live Storefront Banner Preview
                  </div>
                  <span style={{ fontSize: "0.74rem", fontWeight: 700, color: announcement.enabled ? "#10b981" : "#ef4444" }}>
                    {announcement.enabled ? "● Currently Visible on Site" : "✕ Hidden on Site"}
                  </span>
                </div>
                <div style={{ backgroundColor: "#06090e", borderRadius: "10px", padding: "12px 20px", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem", flexWrap: "wrap", gap: "10px", opacity: announcement.enabled ? 1 : 0.6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    {announcement.badgeText && (
                      <span style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "2px 8px", borderRadius: "var(--radius-full)", fontSize: "0.72rem", fontWeight: 800 }}>
                        ● {announcement.badgeText}
                      </span>
                    )}
                    <span style={{ color: "#f8fafc" }}>{announcement.marqueeText || "Pan-India Logistics & Wholesale Supply"}</span>
                    {announcement.offerNotice && (
                      <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: "0.82rem" }}>
                        ● {announcement.offerNotice}
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.78rem", display: "flex", gap: "12px" }}>
                    <span>📞 {announcement.phone || "+91 98765 43210"}</span>
                    <span>✉️ {announcement.email || "sales@shkauto.in"}</span>
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div style={{ backgroundColor: "#0d121c", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                {/* Banner Active Toggle */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.07)", marginBottom: "20px" }}>
                  <div>
                    <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.95rem" }}>Top Banner Status</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Show or hide the top notification announcement bar across the storefront</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnnouncement((prev) => ({ ...prev, enabled: !prev.enabled }))}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      border: "none",
                      backgroundColor: announcement.enabled ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: announcement.enabled ? "#10b981" : "#ef4444",
                    }}
                  >
                    {announcement.enabled ? "✓ Active (Visible)" : "✕ Disabled (Hidden)"}
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                      Badge Text (Green live indicator pill)
                    </label>
                    <input
                      type="text"
                      value={announcement.badgeText}
                      onChange={(e) => setAnnouncement({ ...announcement, badgeText: e.target.value })}
                      placeholder="e.g. Dispatch Center Live"
                      style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px 14px", color: "#ffffff", fontSize: "0.88rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                      Main Marquee Headline
                    </label>
                    <input
                      type="text"
                      value={announcement.marqueeText}
                      onChange={(e) => setAnnouncement({ ...announcement, marqueeText: e.target.value })}
                      placeholder="e.g. Pan-India Logistics & Wholesale Supply for Verified Garages"
                      style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px 14px", color: "#ffffff", fontSize: "0.88rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                      Special Promo Notice (Highlighted promotional tag)
                    </label>
                    <input
                      type="text"
                      value={announcement.offerNotice || ""}
                      onChange={(e) => setAnnouncement({ ...announcement, offerNotice: e.target.value })}
                      placeholder="e.g. Flat 10% Wholesale rebate on orders above ₹10,000 with code GARAGE10"
                      style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px 14px", color: "#ffffff", fontSize: "0.88rem" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                        Hotline Phone Number
                      </label>
                      <input
                        type="text"
                        value={announcement.phone || ""}
                        onChange={(e) => setAnnouncement({ ...announcement, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px 14px", color: "#ffffff", fontSize: "0.88rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                        Support Email Address
                      </label>
                      <input
                        type="text"
                        value={announcement.email || ""}
                        onChange={(e) => setAnnouncement({ ...announcement, email: e.target.value })}
                        placeholder="sales@shkauto.in"
                        style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px 14px", color: "#ffffff", fontSize: "0.88rem" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 12: COUPONS & DISCOUNTS
              ======================================================== */}
          {currentSection === "coupons" && (
            <div>
              <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    Coupons & Trade Discount Codes
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Manage promotional coupons for new workshops and seasonal volume bulk orders.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCouponModal(true)}
                  style={{ backgroundColor: "var(--primary)", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
                >
                  + Create New Coupon
                </button>
              </div>

              <div style={{ backgroundColor: "#0d121c", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.07)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#64748b", fontSize: "0.75rem", fontWeight: 800 }}>
                      <th style={{ padding: "14px 20px" }}>COUPON CODE</th>
                      <th style={{ padding: "14px 20px" }}>DISCOUNT</th>
                      <th style={{ padding: "14px 20px" }}>MIN ORDER (₹)</th>
                      <th style={{ padding: "14px 20px" }}>USAGE COUNT</th>
                      <th style={{ padding: "14px 20px" }}>STATUS</th>
                      <th style={{ padding: "14px 20px", textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ fontWeight: 800, color: "var(--primary)", fontFamily: "monospace", fontSize: "0.95rem", letterSpacing: "0.05em" }}>
                            {c.code}
                          </span>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>{c.description}</div>
                        </td>
                        <td style={{ padding: "16px 20px", fontWeight: 800, color: "#ffffff" }}>
                          {c.discountType === "Percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                        </td>
                        <td style={{ padding: "16px 20px", color: "#cbd5e1" }}>
                          ₹{c.minOrder.toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "16px 20px", color: "#94a3b8" }}>
                          {c.usageCount} / {c.usageLimit}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <button
                            onClick={() => handleToggleCouponStatus(c)}
                            style={{ padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer", backgroundColor: c.status === "Active" ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.1)", color: c.status === "Active" ? "#10b981" : "#94a3b8" }}
                          >
                            {c.status}
                          </button>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "right" }}>
                          <button
                            onClick={() => handleDeleteCoupon(c)}
                            style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", padding: "6px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Coupon Modal */}
              {showAddCouponModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", display: "grid", placeItems: "center", zIndex: 999 }}>
                  <div style={{ backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "20px", padding: "28px", maxWidth: "500px", width: "92%", maxHeight: "90vh", overflowY: "auto" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff", marginTop: 0, marginBottom: "4px" }}>Create Coupon Code</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "0 0 16px 0" }}>Create a dynamic promotional discount code for customer checkout and trade orders.</p>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "4px" }}>Promo Code (e.g. FESTIVE20, GARAGE15)</label>
                        <input
                          type="text"
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                          placeholder="e.g. FESTIVE20"
                          style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem", textTransform: "uppercase", fontFamily: "monospace", letterSpacing: "0.05em", fontWeight: 700 }}
                        />
                      </div>

                      {/* Discount Type Selector */}
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "6px" }}>Discount Type</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => setNewCouponType("Percentage")}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "8px",
                              border: newCouponType === "Percentage" ? "1px solid var(--primary)" : "1px solid rgba(255, 255, 255, 0.1)",
                              backgroundColor: newCouponType === "Percentage" ? "rgba(249, 87, 22, 0.15)" : "rgba(255, 255, 255, 0.03)",
                              color: newCouponType === "Percentage" ? "#ffffff" : "#94a3b8",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              cursor: "pointer",
                            }}
                          >
                            % Percentage
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewCouponType("Flat")}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "8px",
                              border: newCouponType === "Flat" ? "1px solid var(--primary)" : "1px solid rgba(255, 255, 255, 0.1)",
                              backgroundColor: newCouponType === "Flat" ? "rgba(249, 87, 22, 0.15)" : "rgba(255, 255, 255, 0.03)",
                              color: newCouponType === "Flat" ? "#ffffff" : "#94a3b8",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              cursor: "pointer",
                            }}
                          >
                            ₹ Flat Amount
                          </button>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                            {newCouponType === "Percentage" ? "Discount (%)" : "Flat Discount (₹)"}
                          </label>
                          <input
                            type="number"
                            value={newCouponDiscount}
                            onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                            style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "4px" }}>Min Order (₹)</label>
                          <input
                            type="number"
                            value={newCouponMin}
                            onChange={(e) => setNewCouponMin(Number(e.target.value))}
                            style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "4px" }}>Usage Limit</label>
                          <input
                            type="number"
                            value={newCouponUsageLimit}
                            onChange={(e) => setNewCouponUsageLimit(Number(e.target.value))}
                            style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "4px" }}>Expiry Date</label>
                          <input
                            type="text"
                            value={newCouponExpiry}
                            onChange={(e) => setNewCouponExpiry(e.target.value)}
                            placeholder="e.g. 31 Dec 2026"
                            style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "4px" }}>Description / Tagline</label>
                        <input
                          type="text"
                          value={newCouponDesc}
                          onChange={(e) => setNewCouponDesc(e.target.value)}
                          placeholder="e.g. Special promotional discount for verified garages"
                          style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                      <button onClick={() => setShowAddCouponModal(false)} style={{ backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
                      <button
                        onClick={handleCreateCoupon}
                        style={{ backgroundColor: "var(--primary)", border: "none", color: "#ffffff", padding: "8px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Create Coupon
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              VIEW 13: DELIVERY SETTINGS
              ======================================================== */}
          {currentSection === "delivery-settings" && (
            <div>
              <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    Delivery & Logistics Settings
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Configure free delivery thresholds, expedited air freight rates, and courier dispatch.
                  </p>
                </div>
                <button
                  onClick={() => showToast("Logistics rules saved")}
                  style={{ backgroundColor: "var(--primary)", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
                >
                  Save Settings
                </button>
              </div>

              <div className="admin-delivery-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div style={{ backgroundColor: "#0d121c", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff", marginTop: 0, marginBottom: "16px" }}>
                    Freight & Surcharge Rules
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Free Delivery Minimum Threshold (₹)</label>
                      <input
                        type="number"
                        value={deliverySettings.freeThreshold}
                        onChange={(e) => setDeliverySettings({ ...deliverySettings, freeThreshold: Number(e.target.value) })}
                        style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.85rem", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Standard Surface Shipping Fee (₹)</label>
                      <input
                        type="number"
                        value={deliverySettings.standardFee}
                        onChange={(e) => setDeliverySettings({ ...deliverySettings, standardFee: Number(e.target.value) })}
                        style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.85rem", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Priority Air Freight Fee (₹)</label>
                      <input
                        type="number"
                        value={deliverySettings.airExpressFee}
                        onChange={(e) => setDeliverySettings({ ...deliverySettings, airExpressFee: Number(e.target.value) })}
                        style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.85rem", marginTop: "4px" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: "#0d121c", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff", marginTop: 0, marginBottom: "16px" }}>
                    Courier Logistics Partners
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { name: "Delhivery Surface & Express", status: "Active (API Integrated)" },
                      { name: "Blue Dart Aviation Air Freight", status: "Active (Priority Surcharge)" },
                      { name: "DTDC Heavy Surface Cargo", status: "Active (Workshop Batch)" },
                      { name: "VRL Logistics Pallet Dispatch", status: "Active (100+ Unit Slabs)" },
                    ].map((p, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "rgba(255, 255, 255, 0.03)", borderRadius: "10px" }}>
                        <span style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.88rem" }}>{p.name}</span>
                        <span style={{ color: "#10b981", fontSize: "0.78rem", fontWeight: 700 }}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 14: GLOBAL FAQS
              ======================================================== */}
          {currentSection === "faqs" && (
            <div>
              <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    Global Store FAQs
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    Frequently asked questions displayed across product pages, cart, and trade inquiries.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddFaqModal(true)}
                  style={{ backgroundColor: "var(--primary)", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
                >
                  + Add New FAQ
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {faqs.map((f) => (
                  <div key={f.id} style={{ backgroundColor: "#0d121c", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.98rem" }}>
                        Q: {f.question}
                      </span>
                      <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 800, backgroundColor: "rgba(249, 87, 22, 0.15)", color: "var(--primary)" }}>
                        {f.category}
                      </span>
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: "0.86rem", margin: "6px 0 12px 0", lineHeight: 1.5 }}>
                      {f.answer}
                    </p>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => {
                          setFaqs((prev) => prev.filter((item) => item.id !== f.id));
                          showToast("FAQ removed");
                        }}
                        style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add FAQ Modal */}
              {showAddFaqModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", display: "grid", placeItems: "center", zIndex: 999 }}>
                  <div style={{ backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "20px", padding: "28px", maxWidth: "480px", width: "90%" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff", marginTop: 0 }}>Add New FAQ</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Question</label>
                        <input
                          type="text"
                          value={newFaqQ}
                          onChange={(e) => setNewFaqQ(e.target.value)}
                          placeholder="e.g. What is the delivery time for bulk orders?"
                          style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Answer</label>
                        <textarea
                          rows={3}
                          value={newFaqA}
                          onChange={(e) => setNewFaqA(e.target.value)}
                          placeholder="Provide a clear, technical response for mechanics..."
                          style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Category</label>
                        <select
                          value={newFaqCat}
                          onChange={(e) => setNewFaqCat(e.target.value as any)}
                          style={{ width: "100%", backgroundColor: "#0d121c", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "10px", color: "#ffffff", fontSize: "0.88rem" }}
                        >
                          <option value="Engine Spares">Engine Spares</option>
                          <option value="Batteries">Batteries</option>
                          <option value="Compatibility">Compatibility</option>
                          <option value="B2B Trade">B2B Trade</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                      <button onClick={() => setShowAddFaqModal(false)} style={{ backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
                      <button
                        onClick={() => {
                          if (!newFaqQ || !newFaqA) return;
                          setFaqs((prev) => [
                            ...prev,
                            { id: `faq-${Date.now()}`, question: newFaqQ, answer: newFaqA, category: newFaqCat },
                          ]);
                          setShowAddFaqModal(false);
                          setNewFaqQ("");
                          setNewFaqA("");
                          showToast("New FAQ added successfully");
                        }}
                        style={{ backgroundColor: "var(--primary)", border: "none", color: "#ffffff", padding: "8px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Add FAQ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
