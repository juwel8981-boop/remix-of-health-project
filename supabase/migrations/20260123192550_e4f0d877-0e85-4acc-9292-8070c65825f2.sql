-- Create health_tracking table for logging daily health metrics
CREATE TABLE public.health_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  weight NUMERIC,
  height NUMERIC,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  blood_sugar NUMERIC,
  notes TEXT,
  tracked_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only view their own health tracking data
CREATE POLICY "Users can view their own health tracking"
ON public.health_tracking FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own health tracking entries
CREATE POLICY "Users can create their own health tracking"
ON public.health_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own health tracking entries
CREATE POLICY "Users can update their own health tracking"
ON public.health_tracking FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own health tracking entries
CREATE POLICY "Users can delete their own health tracking"
ON public.health_tracking FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_health_tracking_updated_at
BEFORE UPDATE ON public.health_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();