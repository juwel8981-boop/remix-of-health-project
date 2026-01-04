-- Create storage bucket for EHR files with 100MB limit per patient
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('ehr-records', 'ehr-records', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Create EHR records table to track uploaded files
CREATE TABLE IF NOT EXISTS public.ehr_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL,
  record_type TEXT NOT NULL,
  doctor_name TEXT,
  record_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ehr_records
ALTER TABLE public.ehr_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own EHR records
CREATE POLICY "Users can view their own EHR records"
ON public.ehr_records
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own EHR records
CREATE POLICY "Users can insert their own EHR records"
ON public.ehr_records
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own EHR records
CREATE POLICY "Users can update their own EHR records"
ON public.ehr_records
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own EHR records
CREATE POLICY "Users can delete their own EHR records"
ON public.ehr_records
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_ehr_records_updated_at
BEFORE UPDATE ON public.ehr_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for ehr-records bucket
CREATE POLICY "Users can view their own EHR files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ehr-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own EHR files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'ehr-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own EHR files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'ehr-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own EHR files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'ehr-records' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  chamber_id UUID REFERENCES public.doctor_chambers(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Patients can view their own appointments
CREATE POLICY "Patients can view their own appointments"
ON public.appointments
FOR SELECT
USING (auth.uid() = patient_id);

-- Doctors can view appointments for them
CREATE POLICY "Doctors can view their appointments"
ON public.appointments
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.user_id = auth.uid()
));

-- Patients can create appointments
CREATE POLICY "Patients can create appointments"
ON public.appointments
FOR INSERT
WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own appointments
CREATE POLICY "Patients can update their appointments"
ON public.appointments
FOR UPDATE
USING (auth.uid() = patient_id);

-- Doctors can update appointments for them
CREATE POLICY "Doctors can update their appointments"
ON public.appointments
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.user_id = auth.uid()
));

-- Patients can delete/cancel their appointments
CREATE POLICY "Patients can delete their appointments"
ON public.appointments
FOR DELETE
USING (auth.uid() = patient_id);

-- Create trigger for updating updated_at on appointments
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();