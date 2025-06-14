
-- Tabla de preguntas del día
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabla de respuestas de usuario
CREATE TABLE public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.questions(id),
  answer_text text NOT NULL,
  feedback text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Tabla de progreso de racha del usuario
CREATE TABLE public.streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  current_streak int NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Políticas RLS
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- RLS answers: cada usuario solo ve y modifica sus respuestas
CREATE POLICY "User can view their answers" ON public.answers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "User can insert answers" ON public.answers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can update their answers" ON public.answers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "User can delete their answers" ON public.answers
  FOR DELETE USING (user_id = auth.uid());

-- RLS streaks: cada usuario solo ve y modifica su progreso
CREATE POLICY "User can view their streak" ON public.streaks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "User can insert streak" ON public.streaks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can update their streak" ON public.streaks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "User can delete their streak" ON public.streaks
  FOR DELETE USING (user_id = auth.uid());
