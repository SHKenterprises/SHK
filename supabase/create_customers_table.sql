-- ==============================================================================
-- SHK AUTO - CREATE CUSTOMERS TABLE IN SUPABASE (ERROR-FREE VERSION)
-- Run this in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. Create Customers Table
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) & Clean Policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on customers" ON public.customers;
CREATE POLICY "Allow public read access on customers" 
ON public.customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on customers" ON public.customers;
CREATE POLICY "Allow public insert on customers" 
ON public.customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on customers" ON public.customers;
CREATE POLICY "Allow public update on customers" 
ON public.customers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on customers" ON public.customers;
CREATE POLICY "Allow public delete on customers" 
ON public.customers FOR DELETE USING (true);

-- 3. Insert Initial Workshop Garage Partners
INSERT INTO public.customers (id, name, garage, city, state, phone, email, tier, orders_count, total_spend, verified, joined_date)
VALUES 
('CUST-101', 'Rajesh Sharma', 'Apex Motors Workshop', 'Delhi', 'Delhi', '+91 98112 45890', 'rajesh@apexmotors.in', 'Gold Wholesale Partner', 14, 142000, true, '12 Jan 2024'),
('CUST-102', 'Vikram Patil', 'Sai Krupa Auto Garage', 'Pune', 'Maharashtra', '+91 94223 78102', 'vikram@saikrupaauto.com', 'Silver Garage', 8, 68500, true, '04 Mar 2024'),
('CUST-103', 'Suresh Babu', 'Royal Enfield Care', 'Bengaluru', 'Karnataka', '+91 98450 12399', 'suresh@recareblr.com', 'Retail Mechanic', 3, 24000, false, '19 Jun 2024'),
('CUST-104', 'Harpreet Singh', 'Punjab Auto Works', 'Ludhiana', 'Punjab', '+91 98765 43210', 'harpreet@punjabautoworks.in', 'Gold Wholesale Partner', 22, 215000, true, '15 Nov 2023'),
('CUST-105', 'Manoj Tiwari', 'Tiwari Spares & Service', 'Varanasi', 'Uttar Pradesh', '+91 94500 88211', 'manoj@tiwarispares.com', 'Silver Garage', 6, 49200, false, '28 Aug 2024')
ON CONFLICT (id) DO NOTHING;

-- 4. Backfill Real Customers From Existing Store Orders Table
INSERT INTO public.customers (id, name, garage, city, state, phone, email, tier, orders_count, total_spend, verified, joined_date)
SELECT 
    'CUST-' || SUBSTRING(MD5(customer_name || '_' || COALESCE(customer_phone, '')), 1, 10) AS id,
    customer_name AS name,
    COALESCE(MAX(garage_name), 'Direct Wholesale Workshop') AS garage,
    COALESCE(MAX(city), 'Delhi') AS city,
    COALESCE(MAX(state), 'Delhi') AS state,
    customer_phone AS phone,
    MAX(customer_email) AS email,
    CASE 
        WHEN SUM(total) >= 100000 THEN 'Gold Wholesale Partner'
        WHEN SUM(total) >= 40000 THEN 'Silver Garage'
        ELSE 'Retail Mechanic'
    END AS tier,
    COUNT(*)::INTEGER AS orders_count,
    SUM(total) AS total_spend,
    true AS verified,
    TO_CHAR(MIN(created_at), 'DD Mon YYYY') AS joined_date
FROM public.orders
WHERE customer_name IS NOT NULL
GROUP BY customer_name, customer_phone
ON CONFLICT (id) DO NOTHING;
