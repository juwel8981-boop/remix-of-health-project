-- Enable realtime for appointments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- Enable realtime for patients table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;

-- Enable realtime for doctor_reviews table
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_reviews;