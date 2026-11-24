-- ==============================================================================
-- SHK AUTO - SUPABASE POSTGRESQL SCHEMA
-- Complete database schema for e-commerce store: products, orders, inquiries,
-- user profiles, reviews, categories, coupons, and subscribers.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT 'FUJI',
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    product_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    brand TEXT NOT NULL,
    title TEXT NOT NULL,
    short_desc TEXT,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    discount INTEGER DEFAULT 0,
    image TEXT NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb,
    badge TEXT,
    meta TEXT,
    specs JSONB DEFAULT '[]'::jsonb,
    spec_details JSONB DEFAULT '{}'::jsonb,
    oem_tag TEXT,
    stock INTEGER DEFAULT 50,
    in_stock BOOLEAN DEFAULT true,
    rating NUMERIC(2, 1) DEFAULT 4.9,
    reviews_count INTEGER DEFAULT 0,
    compatible_bikes JSONB DEFAULT '[]'::jsonb,
    warranty TEXT DEFAULT '12 Months Warranty',
    wholesale_tiers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    garage_name TEXT,
    gstin TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    delivery_method TEXT NOT NULL DEFAULT 'standard',
    payment_method TEXT NOT NULL DEFAULT 'upi',
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0,
    shipping_fee NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Processing', -- 'Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'
    tracking_number TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    account_type TEXT NOT NULL DEFAULT 'workshop', -- 'workshop', 'retailer', 'rider'
    workshop_name TEXT,
    gstin TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. INQUIRIES & B2B RFQS TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    customer_type TEXT DEFAULT 'Garage Reconditioner',
    product TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Quoted', 'Fulfilled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    verified BOOLEAN DEFAULT true,
    date TEXT,
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Approved', -- 'Pending', 'Approved', 'Rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_percent INTEGER NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    garage TEXT DEFAULT 'Workshop Garage',
    city TEXT DEFAULT 'Delhi',
    state TEXT DEFAULT 'Delhi',
    phone TEXT,
    email TEXT,
    tier TEXT DEFAULT 'Retail Mechanic',
    orders_count INTEGER DEFAULT 0,
    total_spend NUMERIC DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    joined_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products (brand);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access for Storefront Data
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (status = 'Approved');
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (active = true);
CREATE POLICY "Public can view customers" ON public.customers FOR SELECT USING (true);

-- Allow Public Inserts for Orders, Inquiries, Reviews & Subscriptions
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read their order by order_number" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create review" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);

-- Allow Profiles Access
CREATE POLICY "Users can view and manage their profile" ON public.user_profiles FOR ALL USING (true);

-- Allow Full Access with Anon/Service Role for Admin operations
CREATE POLICY "Anon full access for orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Anon full access for products" ON public.products FOR ALL USING (true);
CREATE POLICY "Anon full access for categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Anon full access for reviews" ON public.reviews FOR ALL USING (true);
CREATE POLICY "Anon full access for inquiries" ON public.inquiries FOR ALL USING (true);
CREATE POLICY "Anon full access for coupons" ON public.coupons FOR ALL USING (true);
CREATE POLICY "Anon full access for customers" ON public.customers FOR ALL USING (true);

-- 12. INITIAL SEED DATA FOR PRODUCTS
INSERT INTO public.products (id, slug, category, brand, title, short_desc, description, price, original_price, discount, image, gallery, badge, meta, specs, spec_details, oem_tag, stock, in_stock, rating, reviews_count, compatible_bikes, warranty, wholesale_tiers)
VALUES
(
    'nex-12v4ah',
    'nexcolle-pro-power-12v-4ah',
    'battery',
    'Nexcolle',
    'Nexcolle Pro-Power 12V 4Ah Maintenance-Free Battery',
    'VRLA AGM battery engineered for 100cc-125cc motorcycles & scooters.',
    'Engineered with ultra-dense calcium alloy lead grids and microporous AGM separators for exceptional high cold cranking amperage (CCA). 100% leak-proof, zero-maintenance factory sealed construction designed to absorb road vibrations and potholes across Indian riding conditions.',
    1650.00,
    1950.00,
    15,
    '/images/battery.jpg',
    '["/images/battery.jpg", "/images/hero-rider.jpg"]'::jsonb,
    'Nexcolle™',
    'Battery Systems',
    '["VRLA AGM", "12V 4Ah", "130 CCA", "Zero Maint"]'::jsonb,
    '{"Nominal Voltage": "12 Volts", "Capacity (10HR)": "4 Ampere-Hours", "Cold Cranking Amps": "130 CCA @ -18°C", "Electrolyte": "Absorbed Glass Mat (AGM)", "Terminal Type": "Corrosion-resistant Lead Post (M5)", "Weight": "1.48 kg", "Dimensions": "113 x 70 x 105 mm"}'::jsonb,
    'OEM Spec Hero Splendor / Honda Activa / Shine / Pulsar 125',
    42,
    true,
    4.9,
    128,
    '["Hero Splendor Plus / Pro / i3S", "Hero HF Deluxe / Dawn", "Honda Activa 3G / 4G / 5G / 6G", "Honda CB Shine 125 & SP125", "Bajaj Pulsar 125", "TVS Raider 125", "Suzuki Access 125"]'::jsonb,
    '36 Months (24 Free Replacement + 12 Pro-Rata)',
    '[{"minQty": 5, "discountPercent": 5, "pricePerUnit": 1568}, {"minQty": 10, "discountPercent": 10, "pricePerUnit": 1485}, {"minQty": 25, "discountPercent": 15, "pricePerUnit": 1402}]'::jsonb
),
(
    'nex-12v5ah',
    'nexcolle-heavy-duty-12v-5ah',
    'battery',
    'Nexcolle',
    'Nexcolle Heavy-Duty 12V 5Ah VRLA Motorcycle Battery',
    'High-CCA power source for 150cc-220cc commuter & sports bikes.',
    'Formulated specifically for high-compression single-cylinder engines requiring superior initial torque. Heavy-gauge fiberglass mats ensure uncompromised electrolyte saturation and zero acid stratification.',
    1850.00,
    2250.00,
    18,
    '/images/battery.jpg',
    '["/images/battery.jpg", "/images/hero-cnc-gear.jpg"]'::jsonb,
    'Nexcolle™',
    'Battery Systems',
    '["VRLA AGM", "12V 5Ah", "165 CCA", "Extra Heavy Duty"]'::jsonb,
    '{"Nominal Voltage": "12 Volts", "Capacity": "5 Ampere-Hours", "Cold Cranking Amps": "165 CCA", "Technology": "Sealed Valve Regulated Lead-Acid", "Weight": "1.82 kg", "Dimensions": "120 x 60 x 130 mm"}'::jsonb,
    'OEM Fitment Bajaj Pulsar 150/180 / Apache RTR / FZ',
    35,
    true,
    4.8,
    94,
    '["Bajaj Pulsar 150 / 180 / 220F", "TVS Apache RTR 160 4V / 180 / 200", "Yamaha FZ / FZS V2 & V3", "Honda Unicorn 150 / 160", "Hero Xpulse 200 4V", "Bajaj Avenger 160 / 220"]'::jsonb,
    '36 Months (24 Free Replacement + 12 Pro-Rata)',
    '[{"minQty": 5, "discountPercent": 6, "pricePerUnit": 1739}, {"minQty": 10, "discountPercent": 12, "pricePerUnit": 1628}, {"minQty": 25, "discountPercent": 18, "pricePerUnit": 1517}]'::jsonb
),
(
    'fuji-piston-100',
    'fuji-oem-piston-rings-assembly-100cc',
    'piston',
    'FUJI',
    'FUJI Precision Piston & Rings Assembly Kit (100cc-110cc)',
    'Cast alloy piston with micro-finished skirt and nitrided steel rings.',
    'Precision-engineered to exact Japanese JIS D4413 metallurgy standards. Forged from high-silicon aluminum AC8A alloy with MoS2 low-friction skirt coating to eliminate scuffing during the critical run-in period.',
    850.00,
    1050.00,
    19,
    '/images/piston.png',
    '["/images/piston.png", "/images/hero-cnc-gear.jpg"]'::jsonb,
    'FUJI™ OEM',
    'Piston Kits',
    '["Standard & 0.25/0.50", "Nitrided Rings", "JIS D4413"]'::jsonb,
    '{"Material": "High-Silicon AC8A Aluminum Alloy", "Bore Diameter": "50.00 mm (Std)", "Skirt Coating": "Molybdenum Disulfide (MoS2)", "Gudgeon Pin": "13 mm Case-hardened Chrome Alloy", "Piston Rings": "Top: Nitrided Steel; 2nd: Ductile Iron; Oil: 3-piece Chrome-faced"}'::jsonb,
    'Direct Replacement Hero Splendor / HF Deluxe / Passion Pro',
    58,
    true,
    4.9,
    215,
    '["Hero Splendor Plus / Pro", "Hero HF Deluxe / Dawn", "Hero Passion Pro / XTEC", "Hero Glamour 125 (Old)", "Honda CD 110 / Dream Yuga", "Bajaj Platina 100 / 110", "Bajaj CT 100 / 110X"]'::jsonb,
    '6 Months Engine Warranty against ovality & pin-play',
    '[{"minQty": 10, "discountPercent": 12, "pricePerUnit": 748}, {"minQty": 20, "discountPercent": 18, "pricePerUnit": 697}, {"minQty": 50, "discountPercent": 24, "pricePerUnit": 646}]'::jsonb
),
(
    'fuji-piston-150',
    'fuji-forged-piston-rings-assembly-150cc',
    'piston',
    'FUJI',
    'FUJI High-Compression Performance Piston Kit (150cc-180cc)',
    'High-heat forged piston kit with diamond-turned ring lands.',
    'Engineered for 150cc to 180cc engines operating at sustained 8,000+ RPM. Reinforced crown webbing and laser-cut oil return holes provide superior heat dissipation and zero ring-flutter at highway cruising.',
    1250.00,
    1550.00,
    19,
    '/images/piston.png',
    '["/images/piston.png", "/images/piston-fuji.jpg"]'::jsonb,
    'FUJI™ OEM',
    'Piston Kits',
    '["Low-Friction Skirt", "Reinforced Crown", "150-180cc"]'::jsonb,
    '{"Crown Profile": "Slight Dome High-Compression", "Bore": "57.00 mm (Std)", "Pin Diameter": "14 mm / 15 mm options", "Ring Thickness": "1.0 mm / 1.0 mm / 2.0 mm", "Coating": "Graphite Skirt Matrix"}'::jsonb,
    'Direct Replacement Bajaj Pulsar 150/180 & Apache RTR 160',
    29,
    true,
    4.9,
    167,
    '["Bajaj Pulsar 150 / 180", "TVS Apache RTR 160 / 180", "Honda Unicorn 150", "Yamaha FZ-S 150", "Suzuki Gixxer 155"]'::jsonb,
    '6 Months Manufacturer Fitment Warranty',
    '[{"minQty": 5, "discountPercent": 10, "pricePerUnit": 1125}, {"minQty": 10, "discountPercent": 16, "pricePerUnit": 1050}, {"minQty": 25, "discountPercent": 22, "pricePerUnit": 975}]'::jsonb
),
(
    'fuji-liner-100',
    'fuji-centrifugal-cast-cylinder-liner-sleeve',
    'liner',
    'FUJI',
    'FUJI Centrifugal-Cast Grey Iron Cylinder Liner Sleeve',
    'Micro-bored spun cast iron cylinder sleeve for precision reboring.',
    'Centrifugally spun cast iron sleeves with diamond-honed plateau crosshatching for optimal oil film retention and minimal blow-by. Formulated to resist thermal distortion up to 450°C.',
    650.00,
    800.00,
    19,
    '/images/cylinder-sleeve.jpg',
    '["/images/cylinder-sleeve.jpg", "/images/hero-cnc-gear.jpg"]'::jsonb,
    'FUJI™ OEM',
    'Cylinder Blocks',
    '["Centrifugal Cast", "High Thermal Cond", "Micro-Honed"]'::jsonb,
    '{"Material": "Centrifugal Spun Cast Iron FG220", "Tensile Strength": "240 MPa minimum", "Hardness": "200-240 BHN", "Inner Diameter": "50.00 mm (Semi-Finished)", "Outer Diameter": "55.00 mm", "Length": "98 mm"}'::jsonb,
    'Universal Reboring Sleeve for 100cc-110cc Two-Wheelers',
    64,
    true,
    4.9,
    88,
    '["Hero Splendor / HF Deluxe / Passion", "Honda Activa 100/110", "Bajaj Platina 100", "TVS Star City Plus", "Universal 50mm Re-sleeving"]'::jsonb,
    '1 Year Workmanship Guarantee',
    '[{"minQty": 10, "discountPercent": 15, "pricePerUnit": 552}, {"minQty": 25, "discountPercent": 20, "pricePerUnit": 520}, {"minQty": 50, "discountPercent": 25, "pricePerUnit": 487}]'::jsonb
),
(
    'fuji-valves-set',
    'fuji-bimetal-intake-exhaust-valves-set',
    'valves',
    'FUJI',
    'FUJI Bi-Metal Friction-Welded Engine Valves (Set of 2)',
    'Stellite-faced bi-metal intake & exhaust valves for 4-stroke engines.',
    'Friction-welded bi-metallic design combining austenitic steel valve heads for superior heat resistance with martensitic steel stems for exceptional wear resistance against rocker-arm friction.',
    420.00,
    520.00,
    19,
    '/images/valves.jpg',
    '["/images/valves.jpg", "/images/hero-cnc-gear.jpg"]'::jsonb,
    'FUJI™ OEM',
    'Valves & Guides',
    '["Bi-Metal 21-4N", "Stellite Faced", "Hard-Chromed Stem"]'::jsonb,
    '{"Intake Material": "SUH-3 Silchrome Steel", "Exhaust Material": "21-4N Austenitic Stainless Steel", "Facing": "Stellite #6 Cobalt Alloy on seat", "Stem Coating": "Hard Chrome 15-20 microns", "Hardness": "Stem tip 52-58 HRC"}'::jsonb,
    'OEM Fitment for Hero 100cc / Honda 110cc / Pulsar 150',
    92,
    true,
    4.9,
    142,
    '["Hero Splendor / HF Deluxe (2-Valve)", "Honda Activa 3G/4G/5G/6G", "Honda CB Shine 125", "Bajaj Pulsar 150 (Intake & Exhaust)", "TVS Apache RTR 160 2V"]'::jsonb,
    '6 Months Sealing & Wear Warranty',
    '[{"minQty": 10, "discountPercent": 12, "pricePerUnit": 370}, {"minQty": 25, "discountPercent": 18, "pricePerUnit": 344}, {"minQty": 50, "discountPercent": 25, "pricePerUnit": 315}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 13. SEED CATEGORIES
INSERT INTO public.categories (id, name, brand, slug, description, image, product_count)
VALUES
('battery', 'Batteries & Power Systems', 'Nexcolle', 'battery', 'Maintenance-Free VRLA AGM motorcycle batteries with 36-month warranty', '/images/battery.jpg', 2),
('piston', 'Forged & Cast Pistons', 'FUJI', 'piston', 'Japanese AC8A hypereutectic metallurgy piston kits with micro-tin skirt coating', '/images/piston.png', 2),
('liner', 'Centrifugal Cylinder Liners', 'FUJI', 'liner', 'Centrifugally cast grey iron sleeves with diamond plateau crosshatching', '/images/cylinder-sleeve.jpg', 1),
('valves', 'Precision Valve Sets', 'FUJI', 'valves', 'SUH-35 friction welded bimetallic valves with stellite-faced seats', '/images/valves.jpg', 1)
ON CONFLICT (id) DO NOTHING;

-- 14. SEED COUPONS
INSERT INTO public.coupons (id, code, discount_percent, min_order_amount, active)
VALUES
('cpn_first', 'SHKFIRST', 10, 1000.00, true),
('cpn_bulk', 'BULK10', 10, 5000.00, true),
('cpn_garage', 'GARAGE20', 20, 15000.00, true)
ON CONFLICT (id) DO NOTHING;

-- 15. SEED CUSTOMERS
INSERT INTO public.customers (id, name, garage, city, state, phone, email, tier, orders_count, total_spend, verified, joined_date)
VALUES 
('CUST-101', 'Rajesh Sharma', 'Apex Motors Workshop', 'Delhi', 'Delhi', '+91 98112 45890', 'rajesh@apexmotors.in', 'Gold Wholesale Partner', 14, 142000, true, '12 Jan 2024'),
('CUST-102', 'Vikram Patil', 'Sai Krupa Auto Garage', 'Pune', 'Maharashtra', '+91 94223 78102', 'vikram@saikrupaauto.com', 'Silver Garage', 8, 68500, true, '04 Mar 2024'),
('CUST-103', 'Suresh Babu', 'Royal Enfield Care', 'Bengaluru', 'Karnataka', '+91 98450 12399', 'suresh@recareblr.com', 'Retail Mechanic', 3, 24000, false, '19 Jun 2024'),
('CUST-104', 'Harpreet Singh', 'Punjab Auto Works', 'Ludhiana', 'Punjab', '+91 98765 43210', 'harpreet@punjabautoworks.in', 'Gold Wholesale Partner', 22, 215000, true, '15 Nov 2023'),
('CUST-105', 'Manoj Tiwari', 'Tiwari Spares & Service', 'Varanasi', 'Uttar Pradesh', '+91 94500 88211', 'manoj@tiwarispares.com', 'Silver Garage', 6, 49200, false, '28 Aug 2024')
ON CONFLICT (id) DO NOTHING;
