-- Create a table for doctor chambers
CREATE TABLE public.doctor_chambers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  days TEXT[] DEFAULT '{}',
  timing TEXT,
  appointment_fee TEXT,
  serial_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.doctor_chambers ENABLE ROW LEVEL SECURITY;

-- Create policies for chamber access
CREATE POLICY "Anyone can view chambers" 
ON public.doctor_chambers 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage chambers" 
ON public.doctor_chambers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Doctors can manage their own chambers" 
ON public.doctor_chambers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.doctors 
    WHERE (doctors.id::text = doctor_chambers.doctor_id OR doctors.user_id::text = doctor_chambers.doctor_id)
    AND doctors.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_doctor_chambers_updated_at
BEFORE UPDATE ON public.doctor_chambers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();