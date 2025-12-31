-- Allow anyone to view approved doctors (for public Find Doctors page)
CREATE POLICY "Anyone can view approved doctors" 
ON public.doctors 
FOR SELECT 
USING (verification_status = 'approved');

-- Allow admins to delete doctors
CREATE POLICY "Admins can delete doctors" 
ON public.doctors 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));