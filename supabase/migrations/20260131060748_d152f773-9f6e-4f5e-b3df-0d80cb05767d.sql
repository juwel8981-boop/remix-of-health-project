-- Fix search_path for get_doctor_average_rating function
CREATE OR REPLACE FUNCTION public.get_doctor_average_rating(doctor_uuid UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
  FROM public.doctor_reviews
  WHERE doctor_id = doctor_uuid AND status = 'approved';
$$ LANGUAGE sql STABLE SET search_path = public;

-- Fix search_path for get_doctor_review_count function
CREATE OR REPLACE FUNCTION public.get_doctor_review_count(doctor_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::integer
  FROM public.doctor_reviews
  WHERE doctor_id = doctor_uuid AND status = 'approved';
$$ LANGUAGE sql STABLE SET search_path = public;