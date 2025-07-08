-- Enable RLS on questions table if not already enabled
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read questions
CREATE POLICY "All authenticated users can view questions" 
ON public.questions 
FOR SELECT 
TO authenticated 
USING (true);