-- Create hospitals table
CREATE TABLE public.hospitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Private',
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  rating NUMERIC DEFAULT 0,
  beds INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  image_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diagnostics table
CREATE TABLE public.diagnostics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  rating NUMERIC DEFAULT 0,
  services JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  image_url TEXT,
  open_hours TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on hospitals
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Enable RLS on diagnostics
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospitals
CREATE POLICY "Anyone can view approved hospitals"
ON public.hospitals FOR SELECT
USING (status = 'approved' OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage hospitals"
ON public.hospitals FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for diagnostics
CREATE POLICY "Anyone can view approved diagnostics"
ON public.diagnostics FOR SELECT
USING (status = 'approved' OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage diagnostics"
ON public.diagnostics FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_hospitals_updated_at
BEFORE UPDATE ON public.hospitals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diagnostics_updated_at
BEFORE UPDATE ON public.diagnostics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();