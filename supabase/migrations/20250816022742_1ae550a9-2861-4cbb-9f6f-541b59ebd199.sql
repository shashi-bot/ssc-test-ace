-- Fix security issue: Hide correct answers from students during tests

-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;

-- Create a security definer function to check if user can see answers
CREATE OR REPLACE FUNCTION public.can_user_see_answers(question_uuid uuid)
RETURNS boolean AS $$
DECLARE
    has_completed_test boolean := false;
BEGIN
    -- Check if the user has completed any test containing this question
    SELECT EXISTS (
        SELECT 1 
        FROM test_attempts ta
        JOIN test_questions tq ON ta.test_id = tq.test_id
        WHERE tq.question_id = question_uuid
        AND ta.user_id = auth.uid()
        AND ta.is_completed = true
    ) INTO has_completed_test;
    
    RETURN has_completed_test;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a view for questions without correct answers (for during tests)
CREATE OR REPLACE VIEW public.questions_public AS
SELECT 
    id,
    question_text_english,
    question_text_hindi,
    option_a_english,
    option_a_hindi,
    option_b_english,
    option_b_hindi,
    option_c_english,
    option_c_hindi,
    option_d_english,
    option_d_hindi,
    image_url,
    question_type,
    section,
    topic_id,
    difficulty,
    marks,
    negative_marks,
    created_at,
    updated_at,
    -- Only show correct answer if user has completed a test with this question
    CASE 
        WHEN public.can_user_see_answers(id) THEN correct_answer
        ELSE NULL
    END as correct_answer,
    -- Only show explanations if user has completed a test with this question
    CASE 
        WHEN public.can_user_see_answers(id) THEN explanation_english
        ELSE NULL
    END as explanation_english,
    CASE 
        WHEN public.can_user_see_answers(id) THEN explanation_hindi
        ELSE NULL
    END as explanation_hindi
FROM public.questions;

-- Enable RLS on the view
ALTER VIEW public.questions_public SET (security_barrier = true);

-- Create new policy for questions table (restrict direct access)
CREATE POLICY "Only system can access questions directly" 
ON public.questions 
FOR SELECT 
USING (false); -- No direct access to questions table

-- Grant access to the public view
GRANT SELECT ON public.questions_public TO authenticated;
GRANT SELECT ON public.questions_public TO anon;

-- Create policy for the view
CREATE POLICY "Anyone can view public questions" 
ON public.questions_public 
FOR SELECT 
USING (true);