-- App settings (single row) and staff read/write via service role for writes.

CREATE TABLE IF NOT EXISTS public.app_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  org_name TEXT NOT NULL DEFAULT 'Hypatho Connects',
  support_phone TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

INSERT INTO public.app_settings (id, org_name)
VALUES (1, 'Hypatho Connects')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_settings: staff can read"
  ON public.app_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);
