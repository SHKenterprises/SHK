# Supabase Database Integration Guide for SHK Auto

This project is now fully wired to **Supabase** for storing all website data, including:
- **Products & Inventory**: (`products`, `categories`)
- **Orders & Checkout**: (`orders`)
- **Customer Profiles**: (`user_profiles`)
- **B2B Inquiries & RFQs**: (`inquiries`)
- **Customer Reviews**: (`reviews`)
- **Coupons & Slab Discounts**: (`coupons`)
- **Subscribers**: (`subscribers`)

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Database Schema in Supabase
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** in the left sidebar.
3. Click **New Query**.
4. Open the schema file [schema.sql](file:///c:/Users/User/Desktop/Nexa-solution/project4/S.H.K/supabase/schema.sql), copy its entire content, paste it into the query editor, and click **Run**.
   - This creates all 8 tables, indexes, Row Level Security policies, and seeds all initial products and categories.

### Step 2: Configure Environment Variables
Open your [.env.local](file:///c:/Users/User/Desktop/Nexa-solution/project4/S.H.K/.env.local) file and insert your Supabase project keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(You can find these in Supabase under **Project Settings &rarr; API**)*

### Step 3: Test & Verify
- **Place an order** on `/checkout`: Order automatically inserts into the `orders` table in Supabase.
- **Track an order** on `/track-order`: Directly searches Supabase by order number or customer phone.
- **Admin Dashboard** on `/admin`: Shows live orders, stock updates sync to `products`, inquiries sync to `inquiries`.
- **Contact / Quote Modal**: RFQs and inquiries sync directly to `inquiries`.
- **Sign Up / Profile**: Workshop & customer profiles sync to `user_profiles`.

---

## 🛡️ Hybrid Fallback Protection
Even if your Supabase database is still connecting or network is offline, the website uses a smart fallback layer to ensure pages never break or crash. Once valid credentials are provided in `.env.local`, live PostgreSQL synchronization activates automatically.
