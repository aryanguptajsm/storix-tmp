-- Create the storage bucket for product images and store logos/banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
-- Allow public access to read files
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'product-images' );

-- Allow authenticated users to upload files
CREATE POLICY "Auth Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Auth Update" 
ON storage.objects FOR UPDATE 
USING ( 
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own files
CREATE POLICY "Auth Delete" 
ON storage.objects FOR DELETE 
USING ( 
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
