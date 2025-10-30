-- Create storage bucket for crop images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('crop-images', 'crop-images', true);

-- Storage policies for crop images
CREATE POLICY "Users can view crop images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'crop-images');

CREATE POLICY "Authenticated users can upload crop images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'crop-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their crop images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'crop-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their crop images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'crop-images' 
    AND auth.role() = 'authenticated'
  );