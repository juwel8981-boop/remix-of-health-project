-- Create storage bucket for health feed images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('health-posts', 'health-posts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for health posts bucket
CREATE POLICY "Anyone can view health post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'health-posts');

CREATE POLICY "Authenticated users can upload health post images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'health-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own health post images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'health-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own health post images"
ON storage.objects FOR DELETE
USING (bucket_id = 'health-posts' AND auth.uid()::text = (storage.foldername(name))[1]);