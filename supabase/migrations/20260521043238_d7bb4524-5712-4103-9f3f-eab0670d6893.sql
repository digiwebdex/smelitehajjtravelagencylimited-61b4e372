ALTER TABLE public.page_visits
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS screen_resolution TEXT,
  ADD COLUMN IF NOT EXISTS viewport_size TEXT,
  ADD COLUMN IF NOT EXISTS is_new_visitor BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT;

CREATE INDEX IF NOT EXISTS idx_page_visits_country_code ON public.page_visits(country_code);
CREATE INDEX IF NOT EXISTS idx_page_visits_session_id ON public.page_visits(session_id);