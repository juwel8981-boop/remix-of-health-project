-- Create doctor_favorites table for heart/love feature
CREATE TABLE public.doctor_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, doctor_id)
);

-- Enable RLS on doctor_favorites
ALTER TABLE public.doctor_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for doctor_favorites
CREATE POLICY "Users can view their own favorites"
ON public.doctor_favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
ON public.doctor_favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
ON public.doctor_favorites FOR DELETE
USING (auth.uid() = user_id);

-- Create doctor_reviews table for rating system
CREATE TABLE public.doctor_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'approved',
  UNIQUE(user_id, doctor_id)
);

-- Enable RLS on doctor_reviews
ALTER TABLE public.doctor_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for doctor_reviews
CREATE POLICY "Anyone can view approved reviews"
ON public.doctor_reviews FOR SELECT
USING (status = 'approved' OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own reviews"
ON public.doctor_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.doctor_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.doctor_reviews FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
ON public.doctor_reviews FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on doctor_reviews
CREATE TRIGGER update_doctor_reviews_updated_at
BEFORE UPDATE ON public.doctor_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to get average rating for a doctor
CREATE OR REPLACE FUNCTION public.get_doctor_average_rating(doctor_uuid UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
  FROM public.doctor_reviews
  WHERE doctor_id = doctor_uuid AND status = 'approved';
$$ LANGUAGE sql STABLE;

-- Create a function to get review count for a doctor
CREATE OR REPLACE FUNCTION public.get_doctor_review_count(doctor_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::integer
  FROM public.doctor_reviews
  WHERE doctor_id = doctor_uuid AND status = 'approved';
$$ LANGUAGE sql STABLE;