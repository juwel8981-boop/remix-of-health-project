-- Create doctors table for doctor-specific information
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  registration_number TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience_years INTEGER,
  hospital_affiliation TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  documents_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(registration_number)
);

-- Enable RLS on doctors table
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Doctors can view their own profile
CREATE POLICY "Doctors can view their own profile"
ON public.doctors
FOR SELECT
USING (auth.uid() = user_id);

-- Doctors can update their own profile
CREATE POLICY "Doctors can update their own profile"
ON public.doctors
FOR UPDATE
USING (auth.uid() = user_id);

-- Authenticated users can insert their own doctor profile
CREATE POLICY "Users can create their own doctor profile"
ON public.doctors
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all doctors
CREATE POLICY "Admins can view all doctors"
ON public.doctors
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update all doctors (for verification)
CREATE POLICY "Admins can update all doctors"
ON public.doctors
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_doctors_updated_at
BEFORE UPDATE ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create patients table for patient-specific information
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  address TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on patients table
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Patients can view their own profile
CREATE POLICY "Patients can view their own profile"
ON public.patients
FOR SELECT
USING (auth.uid() = user_id);

-- Patients can update their own profile
CREATE POLICY "Patients can update their own profile"
ON public.patients
FOR UPDATE
USING (auth.uid() = user_id);

-- Authenticated users can insert their own patient profile
CREATE POLICY "Users can create their own patient profile"
ON public.patients
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all patients
CREATE POLICY "Admins can view all patients"
ON public.patients
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();