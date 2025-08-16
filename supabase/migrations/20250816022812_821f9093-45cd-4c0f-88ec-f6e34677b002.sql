-- Fix security issue: Hide correct answers from students during tests (revised approach)

-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;

-- Create a security definer function to check if user can see answers
CREATE OR REPLACE FUNCTION public.can_user_see_answers(question_uuid uuid)
RETURNS boolean AS $$
DECLARE
    has_completed_test boolean := false;
BEGIN
    -- If user is not authenticated, they can't see answers
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;
    
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

-- Create a function to get questions with conditional answer visibility
CREATE OR REPLACE FUNCTION public.get_question_for_user(question_uuid uuid)
RETURNS TABLE (
    id uuid,
    question_text_english text,
    question_text_hindi text,
    option_a_english text,
    option_a_hindi text,
    option_b_english text,
    option_b_hindi text,
    option_c_english text,
    option_c_hindi text,
    option_d_english text,
    option_d_hindi text,
    image_url text,
    question_type question_type,
    section exam_section,
    topic_id uuid,
    difficulty difficulty_level,
    marks integer,
    negative_marks numeric,
    created_at timestamptz,
    updated_at timestamptz,
    correct_answer text,
    explanation_english text,
    explanation_hindi text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.question_text_english,
        q.question_text_hindi,
        q.option_a_english,
        q.option_a_hindi,
        q.option_b_english,
        q.option_b_hindi,
        q.option_c_english,
        q.option_c_hindi,
        q.option_d_english,
        q.option_d_hindi,
        q.image_url,
        q.question_type,
        q.section,
        q.topic_id,
        q.difficulty,
        q.marks,
        q.negative_marks,
        q.created_at,
        q.updated_at,
        -- Only show correct answer if user has completed a test with this question
        CASE 
            WHEN public.can_user_see_answers(q.id) THEN q.correct_answer
            ELSE NULL
        END as correct_answer,
        -- Only show explanations if user has completed a test with this question
        CASE 
            WHEN public.can_user_see_answers(q.id) THEN q.explanation_english
            ELSE NULL
        END as explanation_english,
        CASE 
            WHEN public.can_user_see_answers(q.id) THEN q.explanation_hindi
            ELSE NULL
        END as explanation_hindi
    FROM public.questions q
    WHERE q.id = question_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get multiple questions for a test (without answers during active test)
CREATE OR REPLACE FUNCTION public.get_test_questions(test_uuid uuid)
RETURNS TABLE (
    id uuid,
    question_text_english text,
    question_text_hindi text,
    option_a_english text,
    option_a_hindi text,
    option_b_english text,
    option_b_hindi text,
    option_c_english text,
    option_c_hindi text,
    option_d_english text,
    option_d_hindi text,
    image_url text,
    question_type question_type,
    section exam_section,
    topic_id uuid,
    difficulty difficulty_level,
    marks integer,
    negative_marks numeric,
    question_order integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.question_text_english,
        q.question_text_hindi,
        q.option_a_english,
        q.option_a_hindi,
        q.option_b_english,
        q.option_b_hindi,
        q.option_c_english,
        q.option_c_hindi,
        q.option_d_english,
        q.option_d_hindi,
        q.image_url,
        q.question_type,
        q.section,
        q.topic_id,
        q.difficulty,
        q.marks,
        q.negative_marks,
        tq.question_order
    FROM public.questions q
    JOIN public.test_questions tq ON q.id = tq.question_id
    WHERE tq.test_id = test_uuid
    ORDER BY tq.question_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the questions table policy to restrict direct access
CREATE POLICY "No direct access to questions table" 
ON public.questions 
FOR SELECT 
USING (false);

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_question_for_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_test_questions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_question_for_user(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_test_questions(uuid) TO anon;