-- Add is_active column to doctors table for activate/deactivate functionality
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add featured columns for featured doctors with ranking
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS featured_rank integer DEFAULT NULL;

-- Create index for featured doctors queries
CREATE INDEX IF NOT EXISTS idx_doctors_featured ON public.doctors (is_featured, featured_rank) WHERE is_featured = true;