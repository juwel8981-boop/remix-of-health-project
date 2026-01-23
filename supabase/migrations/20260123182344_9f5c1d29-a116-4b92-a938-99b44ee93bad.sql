-- Change the default status for health_posts from 'pending' to 'approved'
ALTER TABLE public.health_posts ALTER COLUMN status SET DEFAULT 'approved';

-- Update any existing pending posts to approved (optional cleanup)
UPDATE public.health_posts SET status = 'approved' WHERE status = 'pending';