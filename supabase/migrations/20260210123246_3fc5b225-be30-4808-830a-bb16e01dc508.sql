-- Indexes for doctors table (frequent filters)
CREATE INDEX IF NOT EXISTS idx_doctors_verification_status ON public.doctors (verification_status);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors (user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_is_active ON public.doctors (is_active);
CREATE INDEX IF NOT EXISTS idx_doctors_is_featured ON public.doctors (is_featured, featured_rank);

-- Indexes for patients table
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients (user_id);

-- Indexes for health_posts table
CREATE INDEX IF NOT EXISTS idx_health_posts_status ON public.health_posts (status);
CREATE INDEX IF NOT EXISTS idx_health_posts_user_id ON public.health_posts (user_id);
CREATE INDEX IF NOT EXISTS idx_health_posts_created_at ON public.health_posts (created_at DESC);

-- Indexes for appointments table
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments (doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (appointment_date);

-- Indexes for doctor_reviews
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_doctor_id ON public.doctor_reviews (doctor_id, status);

-- Indexes for user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles (user_id, role);

-- Indexes for medications & health_tracking
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications (user_id);
CREATE INDEX IF NOT EXISTS idx_health_tracking_user_id ON public.health_tracking (user_id, tracked_date DESC);

-- Indexes for EHR records
CREATE INDEX IF NOT EXISTS idx_ehr_records_user_id ON public.ehr_records (user_id);

-- Indexes for doctor_chambers
CREATE INDEX IF NOT EXISTS idx_doctor_chambers_doctor_id ON public.doctor_chambers (doctor_id);