CREATE TABLE public.hero_service_tiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  icon TEXT NOT NULL DEFAULT 'hajj',
  image_url TEXT,
  href TEXT NOT NULL DEFAULT '#',
  color_class TEXT DEFAULT 'text-emerald-600',
  bg_class TEXT DEFAULT 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hero_service_tiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_service_tiles TO authenticated;
GRANT ALL ON public.hero_service_tiles TO service_role;

ALTER TABLE public.hero_service_tiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active tiles" ON public.hero_service_tiles FOR SELECT USING (is_active = true OR public.is_admin_or_viewer());
CREATE POLICY "Admins can manage tiles" ON public.hero_service_tiles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER trg_hero_service_tiles_updated_at BEFORE UPDATE ON public.hero_service_tiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.hero_service_tiles (title, subtitle, icon, href, color_class, bg_class, order_index) VALUES
  ('Hajj Packages', 'Sacred Pilgrimage', 'hajj', '#hajj', 'text-emerald-600', 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200', 1),
  ('Umrah Packages', 'Year-Round Journeys', 'umrah', '#umrah', 'text-blue-600', 'bg-blue-50 hover:bg-blue-100 border-blue-200', 2),
  ('Visa Services', 'Hassle-Free Processing', 'visa', '#visa', 'text-amber-600', 'bg-amber-50 hover:bg-amber-100 border-amber-200', 3);

ALTER TABLE public.footer_content ADD COLUMN IF NOT EXISTS contact_email_2 TEXT DEFAULT '';