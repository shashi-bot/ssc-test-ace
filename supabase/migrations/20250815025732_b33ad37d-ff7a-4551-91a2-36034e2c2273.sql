-- Create enum types for better data integrity
CREATE TYPE public.exam_type AS ENUM ('SSC_CGL', 'SSC_CHSL', 'SSC_MTS');
CREATE TYPE public.test_type AS ENUM ('FULL_LENGTH', 'SECTIONAL', 'CHAPTER_WISE', 'PREVIOUS_YEAR', 'MINI_QUIZ');
CREATE TYPE public.section_type AS ENUM ('QUANTITATIVE_APTITUDE', 'REASONING', 'GENERAL_AWARENESS', 'ENGLISH');
CREATE TYPE public.difficulty_level AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE public.question_type AS ENUM ('MCQ_SINGLE', 'MCQ_MULTI', 'NUMERICAL');
CREATE TYPE public.language_preference AS ENUM ('ENGLISH', 'HINDI');
CREATE TYPE public.attempt_status AS ENUM ('NOT_ATTEMPTED', 'ANSWERED', 'MARKED_FOR_REVIEW', 'ANSWERED_AND_MARKED');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  exam_preference exam_type DEFAULT 'SSC_CGL',
  language_preference language_preference DEFAULT 'ENGLISH',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create topics table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section section_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tests table
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  test_type test_type NOT NULL,
  exam_type exam_type NOT NULL,
  section section_type, -- NULL for full-length tests
  topic_id UUID REFERENCES public.topics(id),
  duration_minutes INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text_english TEXT NOT NULL,
  question_text_hindi TEXT,
  question_type question_type DEFAULT 'MCQ_SINGLE',
  option_a_english TEXT,
  option_a_hindi TEXT,
  option_b_english TEXT,
  option_b_hindi TEXT,
  option_c_english TEXT,
  option_c_hindi TEXT,
  option_d_english TEXT,
  option_d_hindi TEXT,
  correct_answer TEXT NOT NULL, -- Stores 'A', 'B', 'C', 'D' or numerical value
  explanation_english TEXT,
  explanation_hindi TEXT,
  section section_type NOT NULL,
  topic_id UUID REFERENCES public.topics(id),
  difficulty difficulty_level DEFAULT 'MEDIUM',
  marks INTEGER DEFAULT 1,
  negative_marks DECIMAL DEFAULT 0.25,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create test_questions junction table
CREATE TABLE public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  question_order INTEGER NOT NULL,
  UNIQUE(test_id, question_id),
  UNIQUE(test_id, question_order)
);

-- Create test_attempts table
CREATE TABLE public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  duration_taken INTEGER, -- in minutes
  total_score DECIMAL DEFAULT 0,
  percentage DECIMAL DEFAULT 0,
  percentile DECIMAL,
  is_completed BOOLEAN DEFAULT false,
  language_used language_preference DEFAULT 'ENGLISH'
);

-- Create question_attempts table
CREATE TABLE public.question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_attempt_id UUID REFERENCES public.test_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer TEXT,
  attempt_status attempt_status DEFAULT 'NOT_ATTEMPTED',
  is_correct BOOLEAN,
  marks_awarded DECIMAL DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  UNIQUE(test_attempt_id, question_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for public content (topics, tests, questions)
CREATE POLICY "Anyone can view topics" ON public.topics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view active tests" ON public.tests
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Anyone can view questions" ON public.questions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view test questions" ON public.test_questions
  FOR SELECT TO authenticated USING (true);

-- Create RLS policies for test attempts
CREATE POLICY "Users can view their own test attempts" ON public.test_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test attempts" ON public.test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test attempts" ON public.test_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for question attempts
CREATE POLICY "Users can view their own question attempts" ON public.question_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.test_attempts ta 
      WHERE ta.id = test_attempt_id AND ta.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own question attempts" ON public.question_attempts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_attempts ta 
      WHERE ta.id = test_attempt_id AND ta.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own question attempts" ON public.question_attempts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.test_attempts ta 
      WHERE ta.id = test_attempt_id AND ta.user_id = auth.uid()
    )
  );

-- Create trigger function for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON public.tests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, phone)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), 
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample topics
INSERT INTO public.topics (name, section) VALUES
  ('Percentages', 'QUANTITATIVE_APTITUDE'),
  ('Profit and Loss', 'QUANTITATIVE_APTITUDE'),
  ('Simple Interest', 'QUANTITATIVE_APTITUDE'),
  ('Compound Interest', 'QUANTITATIVE_APTITUDE'),
  ('Time and Work', 'QUANTITATIVE_APTITUDE'),
  ('Time and Distance', 'QUANTITATIVE_APTITUDE'),
  ('Geometry', 'QUANTITATIVE_APTITUDE'),
  ('Algebra', 'QUANTITATIVE_APTITUDE'),
  ('Coding-Decoding', 'REASONING'),
  ('Blood Relations', 'REASONING'),
  ('Direction Sense', 'REASONING'),
  ('Analogy', 'REASONING'),
  ('Classification', 'REASONING'),
  ('Series', 'REASONING'),
  ('Logical Venn Diagrams', 'REASONING'),
  ('Syllogism', 'REASONING'),
  ('History', 'GENERAL_AWARENESS'),
  ('Geography', 'GENERAL_AWARENESS'),
  ('Politics', 'GENERAL_AWARENESS'),
  ('Economics', 'GENERAL_AWARENESS'),
  ('Science', 'GENERAL_AWARENESS'),
  ('Current Affairs', 'GENERAL_AWARENESS'),
  ('Grammar', 'ENGLISH'),
  ('Vocabulary', 'ENGLISH'),
  ('Reading Comprehension', 'ENGLISH'),
  ('Sentence Improvement', 'ENGLISH'),
  ('Error Detection', 'ENGLISH'),
  ('Fill in the Blanks', 'ENGLISH');