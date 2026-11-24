/**
 * ==============================================================================
 * SHK AUTO - SUPABASE DATA ACCESS & SERVICE LAYER
 * ==============================================================================
 * Provides strongly-typed CRUD functions for all site operations.
 * If Supabase credentials are configured, it reads & writes to Supabase PostgreSQL.
 * If Supabase is still connecting or offline, it gracefully falls back to local data.
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import { Product, PRODUCTS } from "@/data/products";

// ------------------------------------------------------------------------------
// 1. PRODUCTS SERVICE
// ------------------------------------------------------------------------------

/**
 * Map database snake_case row to camelCase Product interface
 */
function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    brand: row.brand,
    title: row.title,
    shortDesc: row.short_desc || "",
    description: row.description || "",
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    discount: Number(row.discount || 0),
    image: row.image,
    gallery: Array.isArray(row.gallery) ? row.gallery : [row.image],
    badge: row.badge || "",
    meta: row.meta || "",
    specs: Array.isArray(row.specs) ? row.specs : [],
    specDetails: row.spec_details || {},
    oemTag: row.oem_tag || "",
    stock: Number(row.stock || 0),
    inStock: Boolean(row.in_stock),
    rating: Number(row.rating || 4.9),
    reviewsCount: Number(row.reviews_count || 0),
    compatibleBikes: Array.isArray(row.compatible_bikes) ? row.compatible_bikes : [],
    warranty: row.warranty || "12 Months Warranty",
    wholesaleTiers: Array.isArray(row.wholesale_tiers) ? row.wholesale_tiers : [],
  };
}

/**
 * Fetch all products from Supabase (or fallback to static PRODUCTS)
 */
export async function getProducts(): Promise<Product[]> {
  let list = PRODUCTS;

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      list = data.map(mapRowToProduct);
    } else if (error) {
      console.warn("Supabase getProducts warning:", error.message);
    }
  }

  // Prepend any newly added custom products at the TOP
  if (typeof window !== "undefined") {
    try {
      const local = JSON.parse(localStorage.getItem("shk_custom_products") || "[]");
      if (Array.isArray(local) && local.length > 0) {
        const existingIds = new Set(list.map((p) => p.id));
        const fresh = local.filter((p: any) => !existingIds.has(p.id));
        list = [...fresh, ...list];
      }
    } catch {}
  }

  return list;
}

/**
 * Fetch a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return PRODUCTS.find((p) => p.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return PRODUCTS.find((p) => p.slug === slug) || null;
  }

  return mapRowToProduct(data);
}

/**
 * Update product stock in Supabase
 */
export async function updateProductStock(
  productId: string,
  newStock: number
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const p = PRODUCTS.find((x) => x.id === productId);
    if (p) {
      p.stock = newStock;
      p.inStock = newStock > 0;
    }
    return { success: true };
  }

  const { error } = await supabase
    .from("products")
    .update({
      stock: newStock,
      in_stock: newStock > 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Create a new product in Supabase
 */
export async function createProduct(
  product: Product
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!isSupabaseConfigured()) {
    PRODUCTS.unshift(product);
    return { success: true, data: product };
  }

  const payload = {
    id: product.id,
    slug: product.slug,
    category: product.category,
    brand: product.brand,
    title: product.title,
    short_desc: product.shortDesc || null,
    description: product.description || null,
    price: product.price,
    original_price: product.originalPrice,
    discount: product.discount || 0,
    image: product.image,
    gallery: product.gallery || [product.image],
    badge: product.badge || null,
    meta: product.meta || null,
    specs: product.specs || [],
    spec_details: product.specDetails || {},
    oem_tag: product.oemTag || null,
    stock: product.stock,
    in_stock: product.stock > 0,
    rating: product.rating || 5.0,
    reviews_count: product.reviewsCount || 0,
    compatible_bikes: product.compatibleBikes || [],
    warranty: product.warranty || "12 Months Warranty",
    wholesale_tiers: product.wholesaleTiers || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("products").insert(payload);

  if (error) {
    console.error("Supabase createProduct error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/**
 * Delete a product from Supabase
 */
export async function deleteProduct(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const idx = PRODUCTS.findIndex((p) => p.id === productId);
    if (idx !== -1) PRODUCTS.splice(idx, 1);
    return { success: true };
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    console.error("Supabase deleteProduct error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ------------------------------------------------------------------------------
// 2. ORDERS SERVICE
// ------------------------------------------------------------------------------

export interface OrderInput {
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  garageName?: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  deliveryMethod: "standard" | "express";
  paymentMethod: "upi" | "card" | "cod";
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  items: any[];
  notes?: string;
}

export interface SupabaseOrder extends OrderInput {
  id: string;
  status: "Pending" | "Processing" | "Dispatched" | "Delivered" | "Cancelled";
  trackingNumber?: string;
  createdAt: string;
}

/**
 * Create a new order in Supabase
 */
export async function createOrder(
  input: OrderInput
): Promise<{ success: boolean; data?: any; error?: string }> {
  // Always save backup to localStorage
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(`shk_order_${input.orderNumber}`, JSON.stringify(input));
      localStorage.setItem("shk_latest_order", input.orderNumber);
      const existing = localStorage.getItem("shk_all_orders");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift({
        id: input.orderNumber,
        order_number: input.orderNumber,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        garage_name: input.garageName || "Direct Wholesale Buyer",
        total: input.total,
        status: "Processing",
        payment_method: input.paymentMethod || "UPI",
        items: input.items,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem("shk_all_orders", JSON.stringify(list));
    }
  } catch {
    // Ignore
  }

  if (!isSupabaseConfigured()) {
    return { success: true, data: { order_number: input.orderNumber } };
  }

  const payload = {
    order_number: input.orderNumber,
    user_id: input.userId || null,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone,
    garage_name: input.garageName || null,
    gstin: input.gstin || null,
    address: input.address,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    delivery_method: input.deliveryMethod,
    payment_method: input.paymentMethod,
    subtotal: input.subtotal,
    discount: input.discount,
    shipping_fee: input.shippingFee,
    total: input.total,
    status: "Processing",
    items: input.items,
    notes: input.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("orders").insert(payload);

  if (error) {
    console.error("Supabase createOrder error:", error.message);
    return { success: false, error: error.message };
  }

  // Auto-record / update customer in customers table
  try {
    const custId = `CUST-${input.customerPhone ? input.customerPhone.replace(/\D/g, "").slice(-6) : Date.now()}`;
    supabase
      .from("customers")
      .insert({
        id: custId,
        name: input.customerName,
        garage: input.garageName || "Workshop Garage",
        city: input.city || "Delhi",
        state: input.state || "Delhi",
        phone: input.customerPhone,
        email: input.customerEmail,
        tier: "Retail Mechanic",
        orders_count: 1,
        total_spend: input.total,
        verified: true,
        joined_date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        created_at: new Date().toISOString(),
      })
      .then(() => {})
      .catch(() => {});
  } catch {}

  return { success: true, data };
}

/**
 * Fetch an order by order number or customer phone (for order tracking)
 */
export async function getOrderByNumber(
  orderNumber: string,
  phone?: string
): Promise<any | null> {
  // Check local storage first
  try {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(`shk_order_${orderNumber}`);
      if (cached) return JSON.parse(cached);
    }
  } catch {
    // Ignore
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  let query = supabase.from("orders").select("*").eq("order_number", orderNumber);
  if (phone) {
    query = query.eq("customer_phone", phone);
  }

  const { data, error } = await query.single();
  if (error || !data) return null;

  return data;
}

/**
 * Fetch all orders for Admin Dashboard
 */
export async function getAllOrders(): Promise<any[]> {
  let localOrders: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("shk_all_orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) localOrders = parsed;
      }
    } catch {}
  }

  if (!isSupabaseConfigured()) {
    return localOrders;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return localOrders;
  }
  return data;
}

/**
 * Update order status (Admin)
 */
export async function updateOrderStatus(
  orderNumber: string,
  status: string,
  trackingNumber?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (trackingNumber) {
    updateData.tracking_number = trackingNumber;
  }

  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("order_number", orderNumber);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Delete order from Supabase & local storage
 */
export async function deleteOrder(
  orderNumber: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("shk_all_orders");
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) {
          localStorage.setItem(
            "shk_all_orders",
            JSON.stringify(list.filter((o: any) => o.order_number !== orderNumber && o.id !== orderNumber))
          );
        }
      }
    } catch {}
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("order_number", orderNumber);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ------------------------------------------------------------------------------
// 3. INQUIRIES & B2B RFQS SERVICE
// ------------------------------------------------------------------------------

export interface InquiryInput {
  name: string;
  phone: string;
  email?: string;
  customerType?: string;
  product: string;
  details?: string;
}

/**
 * Save an inquiry / RFQ to Supabase
 */
export async function createInquiry(
  input: InquiryInput
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const { error } = await supabase.from("inquiries").insert({
    name: input.name,
    phone: input.phone,
    email: input.email || null,
    customer_type: input.customerType || "Garage Reconditioner",
    product: input.product,
    details: input.details || null,
    status: "Pending",
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Supabase createInquiry error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Fetch all inquiries for Admin Dashboard
 */
export async function getAllInquiries(): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

/**
 * Update inquiry status
 */
export async function updateInquiryStatus(
  id: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: true };

  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Delete inquiry from Supabase
 */
export async function deleteInquiry(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: true };

  const { error } = await supabase
    .from("inquiries")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ------------------------------------------------------------------------------
// 4. REVIEWS SERVICE
// ------------------------------------------------------------------------------

export interface ReviewInput {
  productId: string;
  author: string;
  rating: number;
  comment: string;
  status?: "Pending" | "Approved" | "Rejected";
}

/**
 * Submit a customer review (Defaults to 'Pending' so Admin must approve before showing on product page)
 */
export async function submitReview(
  input: ReviewInput
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: true };

  const { error } = await supabase.from("reviews").insert({
    product_id: input.productId,
    author: input.author,
    rating: input.rating,
    comment: input.comment,
    verified: true,
    status: input.status || "Pending", // Strictly 'Pending' until approved by Admin
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    created_at: new Date().toISOString(),
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Fetch approved reviews for a product (for storefront)
 * Filters by status = 'Approved' and matches either productId or slug
 */
export async function getProductReviews(productId: string, slug?: string): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("status", "Approved")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.filter((r: any) => {
    if (!r.product_id) return false;
    const pid = String(r.product_id).trim().toLowerCase();
    const targetId = String(productId).trim().toLowerCase();
    const targetSlug = slug ? String(slug).trim().toLowerCase() : "";
    return pid === targetId || (targetSlug !== "" && pid === targetSlug);
  });
}

/**
 * Fetch all reviews from Supabase (for Admin moderation)
 */
export async function getAllReviews(): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

/**
 * Update review status (Approved / Pending / Rejected)
 */
export async function updateReviewStatus(
  id: string,
  status: "Approved" | "Pending" | "Rejected"
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: true };

  const { error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Delete a review from Supabase
 */
export async function deleteReview(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: true };

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ------------------------------------------------------------------------------
// 5. USER PROFILES SERVICE
// ------------------------------------------------------------------------------

export interface UserProfileData {
  userId?: string;
  name: string;
  email: string;
  phone: string;
  accountType: "workshop" | "retailer" | "rider";
  workshopName?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

/**
 * Save or update user profile in Supabase
 */
export async function saveUserProfile(
  profile: UserProfileData
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: true };

  const payload = {
    user_id: profile.userId || null,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    account_type: profile.accountType,
    workshop_name: profile.workshopName || null,
    gstin: profile.gstin || null,
    address: profile.address || null,
    city: profile.city || null,
    state: profile.state || null,
    pincode: profile.pincode || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("user_profiles").insert(payload);
  if (error) {
    // If conflict on email, update instead
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update(payload)
      .eq("email", profile.email);
    if (updateError) return { success: false, error: updateError.message };
  }

  // Clear stale local storage customer cache if in browser
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("shk_custom_customers");
    } catch {}
  }

  return { success: true };
}

// ------------------------------------------------------------------------------
// 6. SUBSCRIBERS SERVICE
// ------------------------------------------------------------------------------

export async function addSubscriber(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: true };

  const { error } = await supabase.from("subscribers").insert({
    email,
    created_at: new Date().toISOString(),
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Fetch all subscribers from Supabase (for Admin)
 */
export async function getAllSubscribers(): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

// ------------------------------------------------------------------------------
// 7. COUPONS SERVICE
// ------------------------------------------------------------------------------

export interface CouponData {
  id: string;
  code: string;
  description: string;
  discountType: "Percentage" | "Flat";
  discountValue: number;
  minOrder: number;
  usageCount: number;
  usageLimit: number;
  expiryDate: string;
  status: "Active" | "Expired";
}

export const DEFAULT_COUPONS_DATA: CouponData[] = [
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
];

export function mapRowToCoupon(row: any): CouponData {
  const discountPercent = Number(row.discount_percent ?? row.discountValue ?? 10);
  const minOrder = Number(row.min_order_amount ?? row.minOrder ?? 0);
  const active = typeof row.active === "boolean" ? row.active : row.status !== "Expired";
  const code = (row.code || "").toUpperCase();

  return {
    id: row.id || `cpn_${code.toLowerCase()}`,
    code,
    description:
      row.description ||
      `${discountPercent}% wholesale discount on orders above ₹${minOrder.toLocaleString("en-IN")}`,
    discountType: row.discountType === "Flat" ? "Flat" : "Percentage",
    discountValue: discountPercent,
    minOrder: minOrder,
    usageCount: Number(row.usage_count ?? row.usageCount ?? 0),
    usageLimit: Number(row.usage_limit ?? row.usageLimit ?? 500),
    expiryDate: row.expiry_date || row.expiryDate || "31 Dec 2026",
    status: active ? "Active" : "Expired",
  };
}

export async function getCoupons(): Promise<CouponData[]> {
  // 1. Fetch directly from Supabase table `coupons` if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map(mapRowToCoupon);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("shk_coupons", JSON.stringify(mapped));
          } catch {}
        }
        return mapped;
      }
    } catch (err) {
      console.warn("Supabase getCoupons error:", err);
    }
  }

  // 2. Fetch from /api/coupons endpoint
  try {
    const res = await fetch("/api/coupons", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapRowToCoupon);
      }
    }
  } catch (err) {
    console.warn("Failed to fetch coupons from /api/coupons:", err);
  }

  // 3. Fallback to localStorage or DEFAULT_COUPONS_DATA
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("shk_coupons");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(mapRowToCoupon);
      }
    } catch {}
  }

  return DEFAULT_COUPONS_DATA;
}

export async function saveCoupon(
  coupon: Partial<CouponData>
): Promise<{ success: boolean; coupon?: CouponData; error?: string }> {
  const code = (coupon.code || "").toUpperCase().trim();
  const id = coupon.id || `cpn_${code.toLowerCase()}`;
  const discountPercent = Number(coupon.discountValue ?? 10);
  const minOrder = Number(coupon.minOrder ?? 0);
  const active = coupon.status !== "Expired";

  // 1. Direct Supabase write
  if (isSupabaseConfigured()) {
    try {
      const payload: any = {
        id,
        code,
        discount_percent: discountPercent,
        min_order_amount: minOrder,
        active,
        created_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("coupons").upsert(payload);
      if (error) {
        console.warn("Supabase saveCoupon warning:", error.message);
      }
    } catch (err) {
      console.warn("Supabase saveCoupon error:", err);
    }
  }

  // 2. Local API & storage write
  const finalCoupon: CouponData = {
    id,
    code,
    description: coupon.description || `${discountPercent}% Discount on orders above ₹${minOrder.toLocaleString("en-IN")}`,
    discountType: coupon.discountType || "Percentage",
    discountValue: discountPercent,
    minOrder,
    usageCount: Number(coupon.usageCount ?? 0),
    usageLimit: Number(coupon.usageLimit ?? 500),
    expiryDate: coupon.expiryDate || "31 Dec 2026",
    status: active ? "Active" : "Expired",
  };

  try {
    await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalCoupon),
    });
  } catch (err: any) {
    console.warn("API save coupon error:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("shk_coupons");
      const list: CouponData[] = cached ? JSON.parse(cached) : [];
      const idx = list.findIndex((c) => c.id === id || c.code === code);
      if (idx >= 0) list[idx] = finalCoupon;
      else list.unshift(finalCoupon);
      localStorage.setItem("shk_coupons", JSON.stringify(list));
    } catch {}
  }

  return { success: true, coupon: finalCoupon };
}

export async function deleteCoupon(
  id: string,
  code?: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Direct Supabase delete
  if (isSupabaseConfigured()) {
    try {
      if (id) {
        await supabase.from("coupons").delete().eq("id", id);
      }
      if (code) {
        await supabase.from("coupons").delete().eq("code", code.toUpperCase());
      }
    } catch (err) {
      console.warn("Supabase delete coupon error:", err);
    }
  }

  // 2. Local API delete
  try {
    await fetch(`/api/coupons?id=${encodeURIComponent(id)}${code ? `&code=${encodeURIComponent(code)}` : ""}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("API delete coupon error:", err);
  }

  // 3. LocalStorage delete
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("shk_coupons");
      if (cached) {
        const list: CouponData[] = JSON.parse(cached);
        const filtered = list.filter((c) => c.id !== id && (!code || c.code !== code.toUpperCase()));
        localStorage.setItem("shk_coupons", JSON.stringify(filtered));
      }
    } catch {}
  }

  return { success: true };
}

export async function getActiveCoupons(): Promise<any[]> {
  const all = await getCoupons();
  return all.filter((c) => c.status === "Active");
}

// ------------------------------------------------------------------------------
// 8. CATEGORIES SERVICE
// ------------------------------------------------------------------------------

export interface CategoryItem {
  id: string;
  name: string;
  brand: "Nexcolle" | string;
  slug: string;
  description: string;
  image?: string;
  productCount?: number;
}

/**
 * Fetch all categories from Supabase (fallback to defaults if needed)
 */
export async function getCategories(): Promise<CategoryItem[]> {
  const fallbackCategories: CategoryItem[] = [
    {
      id: "battery",
      name: "All Two-Wheeler Batteries",
      brand: "Nexcolle",
      slug: "battery",
      description: "100% Genuine Nexcolle™ Maintenance-Free VRLA AGM motorcycle batteries with 36-month warranty",
      image: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
    },
    {
      id: "commuter",
      name: "Commuter Series (2.5Ah - 4Ah)",
      brand: "Nexcolle",
      slug: "commuter",
      description: "High-reliability VRLA batteries for 100cc-125cc commuter bikes and scooters",
      image: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
    },
    {
      id: "performance",
      name: "Performance & Sports (5Ah - 7Ah)",
      brand: "Nexcolle",
      slug: "performance",
      description: "High-CCA batteries engineered for 150cc-250cc performance motorcycles",
      image: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
    },
    {
      id: "cruiser",
      name: "Cruiser & Heavy (9Ah - 14Ah)",
      brand: "Nexcolle",
      slug: "cruiser",
      description: "Heavy-duty power systems for 350cc+ cruisers and high-load touring bikes",
      image: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
    },
  ];

  let list = fallbackCategories;

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      list = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        brand: (c.brand as "Nexcolle") || "Nexcolle",
        slug: c.slug || c.id,
        description: c.description || "",
        image: c.image || "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
        productCount: c.product_count || 0,
      }));
    }
  }

  // Prepend any newly added custom categories at the TOP
  if (typeof window !== "undefined") {
    try {
      const local = JSON.parse(localStorage.getItem("shk_custom_categories") || "[]");
      if (Array.isArray(local) && local.length > 0) {
        const existingIds = new Set(list.map((c) => c.id));
        const fresh = local
          .filter((c: any) => !existingIds.has(c.id))
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            brand: (c.brand as "Nexcolle") || "Nexcolle",
            slug: c.slug || c.id,
            description: c.description || "",
            image: c.image || "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
            productCount: c.skuCount || c.productCount || 0,
          }));
        list = [...fresh, ...list];
      }
    } catch {}
  }

  return list;
}

/**
 * Create a new category in Supabase
 */
export async function createCategory(
  cat: CategoryItem
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: cat };
  }

  const payload = {
    id: cat.id,
    name: cat.name,
    brand: cat.brand,
    slug: cat.slug,
    description: cat.description || null,
    image: cat.image || null,
    product_count: cat.productCount || 0,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("categories").insert(payload);

  if (error) {
    console.error("Supabase createCategory error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/**
 * Update an existing category in Supabase
 */
export async function updateCategory(
  id: string,
  updates: Partial<CategoryItem>
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: updates };
  }

  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.brand !== undefined) payload.brand = updates.brand;
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.image !== undefined) payload.image = updates.image;
  if (updates.productCount !== undefined) payload.product_count = updates.productCount;

  const { data, error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("Supabase updateCategory error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/**
 * Delete a category from Supabase
 */
export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    console.error("Supabase deleteCategory error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ------------------------------------------------------------------------------
// 8. CUSTOMERS SERVICE
// ------------------------------------------------------------------------------

export interface CustomerItem {
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

/**
 * Fetch all customers from Supabase (merging public.customers and real orders)
 */
export async function getCustomers(): Promise<CustomerItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  // 1. Fetch registered trade accounts from public.user_profiles (storefront registrations)
  const { data: dbProfiles } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. Fetch custom partner garages from public.customers (exclude template dummy seed records)
  const { data: dbCusts } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  // 3. Fetch real orders from public.orders to merge buyers & calculate order volume
  const { data: dbOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const results: CustomerItem[] = [];
  const usedIds = new Set<string>();
  const processedEmails = new Set<string>();
  const processedPhones10 = new Set<string>();

  // Mock template seed IDs and names to strictly ignore
  const MOCK_SEED_IDS = new Set(["CUST-101", "CUST-102", "CUST-103", "CUST-104", "CUST-105"]);
  const MOCK_SEED_EMAILS = new Set([
    "rajesh@apexmotors.in",
    "vikram@saikrupaauto.com",
    "suresh@recareblr.com",
    "harpreet@punjabautoworks.in",
    "manoj@tiwarispares.com",
  ]);
  const MOCK_SEED_NAMES = new Set([
    "rajesh sharma",
    "vikram patil",
    "suresh babu",
    "harpreet singh",
    "manoj tiwari",
  ]);

  // Helper to ensure guaranteed unique ID
  const generateUniqueId = (prefixBase: string): string => {
    let candidate = prefixBase;
    let disambig = 1;
    while (usedIds.has(candidate)) {
      disambig++;
      candidate = `${prefixBase}-${disambig}`;
    }
    usedIds.add(candidate);
    return candidate;
  };

  // A. Add real registered trade accounts from user_profiles FIRST (PRIMARY SOURCE OF TRUTH)
  if (dbProfiles && Array.isArray(dbProfiles) && dbProfiles.length > 0) {
    for (const p of dbProfiles) {
      const emailKey = (p.email || "").toLowerCase().trim();
      const phone10 = (p.phone || "").replace(/\D/g, "").slice(-10);

      if (emailKey && processedEmails.has(emailKey)) continue;
      if (emailKey) processedEmails.add(emailKey);
      if (phone10) processedPhones10.add(phone10);

      const idSeed = p.id
        ? p.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()
        : (phone10 ? phone10.slice(-6) : Math.floor(100000 + Math.random() * 900000).toString());
      const custId = generateUniqueId(`CUST-${idSeed}`);

      // Real user garage / trade name or fallback to owner name (no hardcoded defaults)
      const garageName = p.workshop_name?.trim() || (p.name ? `${p.name} (Workshop)` : "Trade Partner");
      const cityName = p.city?.trim() || "—";
      const stateName = p.state?.trim() || "";

      results.push({
        id: custId,
        name: p.name || "Trade Customer",
        garage: garageName,
        city: cityName,
        state: stateName,
        phone: p.phone ? (p.phone.startsWith("+91") ? p.phone : `+91 ${p.phone}`) : "",
        email: p.email || "",
        tier: p.account_type === "workshop" ? "Gold Wholesale Partner" : "Retail Mechanic",
        ordersCount: 0,
        totalSpend: 0,
        verified: true,
        joinedDate: p.created_at
          ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
          : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      });
    }
  }

  // B. Merge existing public.customers (strictly filter out mock/sample template garages)
  if (dbCusts && Array.isArray(dbCusts) && dbCusts.length > 0) {
    for (const c of dbCusts) {
      if (MOCK_SEED_IDS.has(c.id)) continue;
      const emailKey = (c.email || "").toLowerCase().trim();
      const nameKey = (c.name || "").toLowerCase().trim();
      if (emailKey && MOCK_SEED_EMAILS.has(emailKey)) continue;
      if (nameKey && MOCK_SEED_NAMES.has(nameKey)) continue;

      const phone10 = (c.phone || "").replace(/\D/g, "").slice(-10);

      // Check if this matches a user_profiles account already added
      const existing = results.find(
        (r) =>
          (phone10 && r.phone.replace(/\D/g, "").slice(-10) === phone10) ||
          (emailKey && r.email.toLowerCase() === emailKey) ||
          (nameKey && r.name.toLowerCase() === nameKey)
      );

      if (existing) {
        existing.ordersCount = Math.max(existing.ordersCount, Number(c.orders_count || 0));
        existing.totalSpend = Math.max(existing.totalSpend, Number(c.total_spend || 0));
        if (c.garage && c.garage !== "Workshop Garage") existing.garage = c.garage;
        if (c.city && c.city !== "Delhi" && existing.city === "—") existing.city = c.city;
        if (c.state && c.state !== "Delhi" && !existing.state) existing.state = c.state;
      } else {
        // If this phone already belongs to an active registered profile, skip any duplicate ghost row
        if (phone10 && processedPhones10.has(phone10)) {
          continue;
        }

        const custId = generateUniqueId(c.id || `CUST-${phone10 ? phone10.slice(-6) : Math.floor(100000 + Math.random() * 900000)}`);
        if (emailKey) processedEmails.add(emailKey);
        if (phone10) processedPhones10.add(phone10);

        results.push({
          id: custId,
          name: c.name,
          garage: c.garage || c.name || "Trade Partner",
          city: c.city || "—",
          state: c.state || "",
          phone: c.phone || "",
          email: c.email || "",
          tier: (c.tier as any) || "Retail Mechanic",
          ordersCount: Number(c.orders_count || 0),
          totalSpend: Number(c.total_spend || 0),
          verified: Boolean(c.verified),
          joinedDate: c.joined_date || new Date(c.created_at || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        });
      }
    }
  }

  // C. Merge real orders from Supabase (to calculate total orders and spend)
  if (dbOrders && Array.isArray(dbOrders) && dbOrders.length > 0) {
    const orderCustomerMap = new Map<string, {
      name: string;
      email: string;
      phone: string;
      garage: string;
      city: string;
      state: string;
      ordersCount: number;
      totalSpend: number;
      firstDate: string;
    }>();

    for (const o of dbOrders) {
      const key = (o.customer_phone || o.customer_email || o.customer_name || "").toLowerCase().trim();
      if (!key) continue;
      const existing = orderCustomerMap.get(key);
      const spend = Number(o.total || 0);
      const dateStr = new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpend += spend;
      } else {
        orderCustomerMap.set(key, {
          name: o.customer_name || "Customer",
          email: o.customer_email || "",
          phone: o.customer_phone || "",
          garage: o.garage_name || "Direct Wholesale Workshop",
          city: o.city || "—",
          state: o.state || "",
          ordersCount: 1,
          totalSpend: spend,
          firstDate: dateStr,
        });
      }
    }

    orderCustomerMap.forEach((val) => {
      const valPhone10 = val.phone.replace(/\D/g, "").slice(-10);
      const valEmail = val.email.toLowerCase().trim();
      const valName = val.name.toLowerCase().trim();

      const alreadyInList = results.find(
        (r) =>
          (valPhone10 && r.phone.replace(/\D/g, "").slice(-10) === valPhone10) ||
          (valEmail && r.email.toLowerCase() === valEmail) ||
          (valName && r.name.toLowerCase() === valName)
      );

      if (alreadyInList) {
        alreadyInList.ordersCount = Math.max(alreadyInList.ordersCount, val.ordersCount);
        alreadyInList.totalSpend = Math.max(alreadyInList.totalSpend, val.totalSpend);
      } else {
        const tier =
          val.totalSpend >= 100000
            ? "Gold Wholesale Partner"
            : val.totalSpend >= 40000
            ? "Silver Garage"
            : "Retail Mechanic";
        const valPhone = val.phone.replace(/\D/g, "");
        const custId = generateUniqueId(`CUST-${valPhone ? valPhone.slice(-6) : Math.floor(100000 + Math.random() * 900000)}`);
        results.unshift({
          id: custId,
          name: val.name,
          garage: val.garage,
          city: val.city,
          state: val.state,
          phone: val.phone,
          email: val.email,
          tier,
          ordersCount: val.ordersCount,
          totalSpend: val.totalSpend,
          verified: true,
          joinedDate: val.firstDate,
        });
      }
    });
  }

  // Final fail-safe guarantee: absolute uniqueness for all IDs
  const finalSeenIds = new Set<string>();
  const finalResults = results.map((c, idx) => {
    let safeId = c.id || `CUST-${idx + 1}`;
    let counter = 1;
    while (finalSeenIds.has(safeId)) {
      counter++;
      safeId = `${c.id || "CUST"}-${counter}`;
    }
    finalSeenIds.add(safeId);
    return { ...c, id: safeId };
  });

  return finalResults;
}

/**
 * Create a new customer in Supabase
 */
export async function createCustomer(
  cust: CustomerItem
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: cust };
  }

  const payload = {
    id: cust.id,
    name: cust.name,
    garage: cust.garage || null,
    city: cust.city || "Delhi",
    state: cust.state || "Delhi",
    phone: cust.phone || null,
    email: cust.email || null,
    tier: cust.tier || "Retail Mechanic",
    orders_count: cust.ordersCount || 0,
    total_spend: cust.totalSpend || 0,
    verified: cust.verified || false,
    joined_date: cust.joinedDate || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("customers").insert(payload);
  if (error) {
    console.error("Supabase createCustomer error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/**
 * Toggle customer verification status in Supabase
 */
export async function toggleCustomerVerification(
  id: string,
  verified: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: true };

  const { error } = await supabase
    .from("customers")
    .update({ verified, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.warn("Supabase toggleCustomerVerification warning:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ------------------------------------------------------------------------------
// 8. HERO CAROUSEL SLIDES SERVICE
// ------------------------------------------------------------------------------

export interface HeroSlideItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image?: string;
  status: "Active" | "Draft";
  order?: number;
}

/**
 * Fetch all hero slides (dynamically from API & Supabase)
 */
export async function getHeroSlides(): Promise<HeroSlideItem[]> {
  try {
    const res = await fetch("/api/hero-slides", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn("fetch /api/hero-slides error:", err);
  }

  // Fallback to Supabase directly if table exists
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("display_order", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((s: any) => ({
          id: s.id,
          badge: s.badge,
          title: s.title,
          subtitle: s.subtitle,
          ctaText: s.cta_text || "Explore Catalog",
          ctaLink: s.cta_link || "/products",
          image: s.image,
          status: s.status || "Active",
          order: s.display_order || 1,
        }));
      }
    } catch {}
  }

  return [];
}

/**
 * Save or update a hero slide
 */
export async function saveHeroSlide(
  slide: HeroSlideItem
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch("/api/hero-slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slide),
    });
    if (res.ok) {
      const data = await res.json();
      // Also sync to Supabase if table exists
      if (isSupabaseConfigured()) {
        try {
          await (supabase.from("hero_slides") as any).upsert({
            id: slide.id,
            badge: slide.badge,
            title: slide.title,
            subtitle: slide.subtitle,
            cta_text: slide.ctaText,
            cta_link: slide.ctaLink,
            image: slide.image || null,
            status: slide.status,
            display_order: slide.order || 1,
          });
        } catch {}
      }
      return { success: true, data };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
  return { success: false, error: "Failed to save slide" };
}

/**
 * Delete a hero slide
 */
export async function deleteHeroSlide(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/hero-slides?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("hero_slides").delete().eq("id", id);
      } catch (err) {
        console.warn("Direct Supabase delete error:", err);
      }
    }

    if (res.ok) {
      return { success: true };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
  return { success: false, error: "Failed to delete slide" };
}

// ------------------------------------------------------------------------------
// 10. ANNOUNCEMENTS & TOP BANNER SERVICE
// ------------------------------------------------------------------------------

export interface AnnouncementData {
  enabled: boolean;
  badgeText: string;
  marqueeText: string;
  offerCode?: string;
  offerNotice?: string;
  phone?: string;
  email?: string;
}

export const DEFAULT_ANNOUNCEMENT_DATA: AnnouncementData = {
  enabled: true,
  badgeText: "Dispatch Center Live",
  marqueeText: "Pan-India Logistics & Wholesale Supply for Verified Garages",
  phone: "+91 98765 43210",
  email: "sales@shkauto.in",
};

/**
 * Fetch announcement settings
 */
export async function getAnnouncementSettings(): Promise<AnnouncementData> {
  try {
    const res = await fetch("/api/announcements", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return { ...DEFAULT_ANNOUNCEMENT_DATA, ...data };
    }
  } catch (err) {
    console.warn("fetch /api/announcements error:", err);
  }
  return DEFAULT_ANNOUNCEMENT_DATA;
}

/**
 * Save announcement settings
 */
export async function saveAnnouncementSettings(
  data: Partial<AnnouncementData>
): Promise<{ success: boolean; data?: AnnouncementData; error?: string }> {
  try {
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const result = await res.json();
      return { success: true, data: result.data };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
  return { success: false, error: "Failed to save announcement" };
}
