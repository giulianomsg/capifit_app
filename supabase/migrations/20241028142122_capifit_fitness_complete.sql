-- Location: supabase/migrations/20241028142122_capifit_fitness_complete.sql
-- Schema Analysis: Fresh Supabase project - no existing schema
-- Integration Type: Complete fitness trainer application with authentication
-- Dependencies: New complete schema for fitness training platform

-- 1. ENUMS AND TYPES
CREATE TYPE public.user_role AS ENUM ('admin', 'trainer', 'client');
CREATE TYPE public.subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'pending');
CREATE TYPE public.workout_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE public.exercise_category AS ENUM ('strength', 'cardio', 'flexibility', 'balance', 'sports', 'rehabilitation');
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE public.assessment_type AS ENUM ('initial', 'progress', 'final', 'periodic');
CREATE TYPE public.notification_type AS ENUM ('system', 'workout', 'assessment', 'payment', 'message');
CREATE TYPE public.payment_method AS ENUM ('card', 'pix', 'boleto', 'mercado_pago', 'pagseguro');
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- 2. CORE TABLES (No foreign keys)

-- User profiles (Critical intermediary table)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'client'::public.user_role,
    phone TEXT,
    date_of_birth DATE,
    avatar_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trainer credentials and specializations
CREATE TABLE public.trainer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    credentials TEXT[],
    specializations TEXT[],
    years_experience INTEGER DEFAULT 0,
    certification_documents TEXT[],
    hourly_rate DECIMAL(10,2),
    availability_schedule JSONB,
    social_media JSONB,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Client profiles and health information
CREATE TABLE public.client_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    fitness_level public.difficulty_level DEFAULT 'beginner'::public.difficulty_level,
    health_conditions TEXT[],
    fitness_goals TEXT[],
    preferred_workout_days TEXT[],
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_clearance BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Exercise library
CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category public.exercise_category NOT NULL,
    difficulty public.difficulty_level DEFAULT 'beginner'::public.difficulty_level,
    muscle_groups TEXT[],
    equipment_needed TEXT[],
    instructions TEXT[],
    video_url TEXT,
    image_urls TEXT[],
    duration_minutes INTEGER,
    calories_per_minute DECIMAL(4,2),
    safety_tips TEXT[],
    variations TEXT[],
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Workout plans
CREATE TABLE public.workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_weeks INTEGER DEFAULT 4,
    difficulty public.difficulty_level DEFAULT 'beginner'::public.difficulty_level,
    goals TEXT[],
    status public.workout_status DEFAULT 'draft'::public.workout_status,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Workout exercises (junction table)
CREATE TABLE public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    sets INTEGER DEFAULT 1,
    reps INTEGER,
    duration_seconds INTEGER,
    rest_seconds INTEGER DEFAULT 60,
    weight_kg DECIMAL(6,2),
    distance_meters INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Workout sessions (actual execution)
CREATE TABLE public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
    session_notes TEXT,
    trainer_feedback TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Physical assessments
CREATE TABLE public.physical_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    assessment_type public.assessment_type DEFAULT 'initial'::public.assessment_type,
    assessment_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    measurements JSONB, -- chest, waist, hips, arms, etc.
    fitness_tests JSONB, -- push-ups, sit-ups, flexibility tests, etc.  
    photos TEXT[], -- progress photos
    notes TEXT,
    recommendations TEXT[],
    next_assessment_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Nutrition plans (basic)
CREATE TABLE public.nutrition_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    daily_calories INTEGER,
    macros JSONB, -- protein, carbs, fats percentages
    meal_plan JSONB, -- structured meal plan
    restrictions TEXT[], -- allergies, dietary restrictions
    supplements TEXT[],
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Client subscriptions
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    billing_cycle INTEGER DEFAULT 1, -- months
    status public.subscription_status DEFAULT 'pending'::public.subscription_status,
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT true,
    payment_method public.payment_method,
    last_payment_date DATE,
    next_payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions
CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method public.payment_method NOT NULL,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
    transaction_id TEXT, -- external payment ID
    gateway_response JSONB,
    processed_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Communication messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    parent_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    attachments TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Notifications system
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type public.notification_type DEFAULT 'system'::public.notification_type,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Email templates and logs
CREATE TABLE public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables TEXT[], -- template variables like {name}, {date}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'sent',
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    metadata JSONB
);

-- 3. INDEXES
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_trainer_profiles_user_id ON public.trainer_profiles(user_id);
CREATE INDEX idx_client_profiles_user_id ON public.client_profiles(user_id);
CREATE INDEX idx_exercises_category ON public.exercises(category);
CREATE INDEX idx_exercises_difficulty ON public.exercises(difficulty);
CREATE INDEX idx_workout_plans_trainer_id ON public.workout_plans(trainer_id);
CREATE INDEX idx_workout_plans_client_id ON public.workout_plans(client_id);
CREATE INDEX idx_workout_exercises_workout_plan_id ON public.workout_exercises(workout_plan_id);
CREATE INDEX idx_workout_sessions_client_id ON public.workout_sessions(client_id);
CREATE INDEX idx_workout_sessions_scheduled_date ON public.workout_sessions(scheduled_date);
CREATE INDEX idx_physical_assessments_client_id ON public.physical_assessments(client_id);
CREATE INDEX idx_subscriptions_client_id ON public.subscriptions(client_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_email_logs_recipient_email ON public.email_logs(recipient_email);

-- 4. FUNCTIONS (MUST BE BEFORE RLS POLICIES)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::public.user_role
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Email notification function
CREATE OR REPLACE FUNCTION public.send_email_notification(
  recipient_email TEXT,
  template_name TEXT,
  template_variables JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  template_record RECORD;
  final_subject TEXT;
  final_content TEXT;
BEGIN
  -- Get template
  SELECT * INTO template_record 
  FROM public.email_templates 
  WHERE name = template_name AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Email template % not found', template_name;
  END IF;
  
  -- Replace variables in subject and content
  final_subject := template_record.subject;
  final_content := template_record.html_content;
  
  -- Log email (actual sending handled by external service)
  INSERT INTO public.email_logs (
    recipient_email, 
    sender_email, 
    subject, 
    template_id, 
    status, 
    metadata
  ) VALUES (
    recipient_email,
    'noreply@capifit.com',
    final_subject,
    template_record.id,
    'queued',
    template_variables
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 5. ENABLE RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES
-- Pattern 1: Core user table - Simple ownership
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for profiles
CREATE POLICY "users_manage_own_trainer_profiles"
ON public.trainer_profiles
FOR ALL
TO authenticated  
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_client_profiles"
ON public.client_profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 4: Public read, private write for exercises
CREATE POLICY "public_can_read_exercises"
ON public.exercises
FOR SELECT
TO public
USING (is_public = true);

CREATE POLICY "users_manage_own_exercises"
ON public.exercises
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Pattern 2: Trainers manage client workout plans
CREATE POLICY "trainers_manage_workout_plans"
ON public.workout_plans
FOR ALL
TO authenticated
USING (trainer_id = auth.uid() OR client_id = auth.uid())
WITH CHECK (trainer_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "users_access_workout_exercises"
ON public.workout_exercises
FOR ALL
TO authenticated
USING (
  workout_plan_id IN (
    SELECT id FROM public.workout_plans 
    WHERE trainer_id = auth.uid() OR client_id = auth.uid()
  )
)
WITH CHECK (
  workout_plan_id IN (
    SELECT id FROM public.workout_plans 
    WHERE trainer_id = auth.uid()
  )
);

-- Client workout sessions access
CREATE POLICY "users_access_workout_sessions"
ON public.workout_sessions
FOR ALL
TO authenticated
USING (
  client_id = auth.uid() OR 
  workout_plan_id IN (
    SELECT id FROM public.workout_plans WHERE trainer_id = auth.uid()
  )
)
WITH CHECK (
  client_id = auth.uid() OR 
  workout_plan_id IN (
    SELECT id FROM public.workout_plans WHERE trainer_id = auth.uid()
  )
);

-- Assessments access
CREATE POLICY "users_access_physical_assessments"
ON public.physical_assessments
FOR ALL
TO authenticated
USING (client_id = auth.uid() OR trainer_id = auth.uid())
WITH CHECK (client_id = auth.uid() OR trainer_id = auth.uid());

-- Nutrition plans access
CREATE POLICY "users_access_nutrition_plans"
ON public.nutrition_plans
FOR ALL
TO authenticated
USING (client_id = auth.uid() OR trainer_id = auth.uid())
WITH CHECK (trainer_id = auth.uid());

-- Subscriptions access
CREATE POLICY "users_access_subscriptions"
ON public.subscriptions
FOR ALL
TO authenticated
USING (client_id = auth.uid() OR trainer_id = auth.uid())
WITH CHECK (client_id = auth.uid() OR trainer_id = auth.uid());

-- Payment transactions access
CREATE POLICY "users_access_payment_transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (
  subscription_id IN (
    SELECT id FROM public.subscriptions 
    WHERE client_id = auth.uid() OR trainer_id = auth.uid()
  )
);

-- Messages access
CREATE POLICY "users_access_messages"
ON public.messages
FOR ALL
TO authenticated
USING (sender_id = auth.uid() OR recipient_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Notifications access
CREATE POLICY "users_manage_own_notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin access to email templates and logs
CREATE POLICY "admin_access_email_templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

CREATE POLICY "admin_access_email_logs"
ON public.email_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- 7. TRIGGERS
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated at triggers
CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_trainer_profiles_updated_at
  BEFORE UPDATE ON public.trainer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. MOCK DATA
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    trainer_uuid UUID := gen_random_uuid();
    client_uuid UUID := gen_random_uuid();
    exercise_uuid UUID := gen_random_uuid();
    workout_plan_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with complete field structure
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@capifit.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin CapiFit", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (trainer_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'trainer@capifit.com', crypt('trainer123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Carlos Silva", "role": "trainer"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (client_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'client@capifit.com', crypt('client123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Maria Santos", "role": "client"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Sample exercises
    INSERT INTO public.exercises (id, name, description, category, difficulty, muscle_groups, equipment_needed, instructions, created_by, is_public)
    VALUES
        (exercise_uuid, 'Push-up', 'Classic bodyweight chest exercise', 'strength', 'beginner', 
         ARRAY['chest', 'shoulders', 'triceps'], ARRAY['none'], 
         ARRAY['Start in plank position', 'Lower chest to ground', 'Push back up'], trainer_uuid, true),
        (gen_random_uuid(), 'Squat', 'Fundamental lower body exercise', 'strength', 'beginner',
         ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['none'],
         ARRAY['Stand with feet shoulder-width apart', 'Lower hips back and down', 'Return to standing'], trainer_uuid, true);

    -- Sample workout plan
    INSERT INTO public.workout_plans (id, trainer_id, client_id, name, description, duration_weeks, difficulty, goals)
    VALUES (workout_plan_uuid, trainer_uuid, client_uuid, 'Beginner Full Body', 'Complete beginner workout program', 4, 'beginner', ARRAY['strength', 'endurance']);

    -- Sample workout exercises
    INSERT INTO public.workout_exercises (workout_plan_id, exercise_id, day_number, order_index, sets, reps, rest_seconds)
    VALUES 
        (workout_plan_uuid, exercise_uuid, 1, 1, 3, 10, 60),
        (workout_plan_uuid, (SELECT id FROM public.exercises WHERE name = 'Squat' LIMIT 1), 1, 2, 3, 12, 60);

    -- Email templates
    INSERT INTO public.email_templates (name, subject, html_content, text_content, variables)
    VALUES 
        ('welcome', 'Bem-vindo ao CapiFit!', 
         '<h1>Olá, {name}!</h1><p>Bem-vindo ao CapiFit. Estamos felizes em tê-lo conosco!</p>',
         'Olá, {name}! Bem-vindo ao CapiFit. Estamos felizes em tê-lo conosco!',
         ARRAY['name']),
        ('workout_reminder', 'Lembrete: Treino Agendado',
         '<h1>Olá, {name}!</h1><p>Você tem um treino agendado para {date} às {time}.</p>',
         'Olá, {name}! Você tem um treino agendado para {date} às {time}.',
         ARRAY['name', 'date', 'time']);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;