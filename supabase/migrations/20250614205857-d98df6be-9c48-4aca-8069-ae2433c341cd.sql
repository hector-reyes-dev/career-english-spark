
-- Añadir una columna para guardar la racha máxima del usuario
ALTER TABLE public.streaks ADD COLUMN max_streak INTEGER NOT NULL DEFAULT 0;

-- Inicializar la racha máxima con el valor de la racha actual para usuarios existentes
UPDATE public.streaks
SET max_streak = current_streak;
