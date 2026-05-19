ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

-- Initialize order_index: Hajj first (by created_at), then Umrah
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (
    ORDER BY CASE WHEN type::text = 'hajj' THEN 0 ELSE 1 END, created_at ASC
  ) AS rn
  FROM public.packages
)
UPDATE public.packages p
SET order_index = ordered.rn
FROM ordered
WHERE p.id = ordered.id;

CREATE INDEX IF NOT EXISTS idx_packages_order_index ON public.packages(type, order_index);