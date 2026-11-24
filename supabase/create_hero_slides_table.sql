-- HERO CAROUSEL SLIDES TABLE
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id TEXT PRIMARY KEY,
    badge TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    cta_text TEXT NOT NULL DEFAULT 'Explore Catalog',
    cta_link TEXT NOT NULL DEFAULT '/products',
    image TEXT,
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Draft'
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed initial slides if empty
INSERT INTO public.hero_slides (id, badge, title, subtitle, cta_text, cta_link, image, status, display_order)
VALUES
(
    'SLIDE-1',
    'OEM-GRADE ENGINEERING & SPARES',
    'Power Every Ride. Engineered to Last.',
    'Genuine Nexcolle™ high-CCA motorcycle batteries and FUJI™ precision engine components.',
    'Explore Catalog',
    '/products',
    '/images/hero-rider.jpg',
    'Active',
    1
),
(
    'SLIDE-2',
    'FUJI PRECISION ENGINE SPARES',
    'Japanese Metallurgy. Zero Cylinder Scuffing.',
    'FUJI hypereutectic pistons with micro-tin skirt coating and gas-nitrided compression rings.',
    'View FUJI Range',
    '/products?brand=FUJI',
    '/images/piston.jpg',
    'Active',
    2
),
(
    'SLIDE-3',
    'NEXCOLLE BATTERY SYSTEMS',
    'Instant 400+ Cold Cranking Amps in All Seasons.',
    'Nexcolle maintenance-free VRLA AGM batteries with calcium alloy plates.',
    'View Batteries',
    '/products?brand=Nexcolle',
    '/images/battery.jpg',
    'Active',
    3
)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) with full Anon access for Admin operations
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon full access for hero_slides" ON public.hero_slides;
CREATE POLICY "Anon full access for hero_slides" ON public.hero_slides FOR ALL USING (true);

