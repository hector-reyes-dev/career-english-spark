import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Lee una pregunta del día no respondida por el usuario, rotando diariamente.
export const useDailyQuestion = (userId?: string) => {
  return useQuery({
    queryKey: ["daily-question", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;

      // 1. Obtener todas las preguntas
      const { data: allQuestions, error: questionsError } = await supabase
        .from("questions")
        .select("id, text");
      if (questionsError) throw questionsError;
      if (!allQuestions || allQuestions.length === 0) {
        throw new Error("Aún no hay preguntas en el sistema.");
      }

      // 2. Obtener IDs de preguntas ya respondidas por el usuario
      const { data: answered, error: answersError } = await supabase
        .from("answers")
        .select("question_id")
        .eq("user_id", userId);
      if (answersError) throw answersError;

      const answeredQuestionIds = new Set(answered.map((a) => a.question_id));

      // 3. Filtrar para obtener las no respondidas
      const unansweredQuestions = allQuestions.filter(
        (q) => !answeredQuestionIds.has(q.id)
      );

      // 4. Si ya respondió todo, no hay pregunta
      if (unansweredQuestions.length === 0) {
        return null;
      }

      // 5. Seleccionar una pregunta de forma determinista para el día actual
      // Esto asegura que cada día vea una pregunta distinta de las que le quedan,
      // pero la misma si recarga la página durante el día.
      const dayIndex = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
      const questionToShow =
        unansweredQuestions[dayIndex % unansweredQuestions.length];

      return questionToShow;
    },
    // La pregunta es la misma durante todo el día.
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
  });
};

// Carga las estadísticas de racha del usuario
export const useUserStats = (userId?: string) => {
  return useQuery({
    queryKey: ["user-stats", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return { current_streak: 0, max_streak: 0 };
      const { data, error } = await supabase
        .from("streaks")
        .select("current_streak, max_streak")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return {
        current_streak: data?.current_streak ?? 0,
        max_streak: data?.max_streak ?? 0,
      };
    },
  });
};

// Envía respuesta, calcula feedback, actualiza racha
export const useSubmitAnswer = (userId?: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      questionId,
      answerText,
      feedback,
      nextStreak,
      newMaxStreak,
    }: {
      questionId: string;
      answerText: string;
      feedback: string;
      nextStreak: number;
      newMaxStreak: number;
    }) => {
      if (!userId) throw new Error("No autenticado");
      // 1. Insertar respuesta
      const { error } = await supabase.from("answers").insert({
        user_id: userId,
        question_id: questionId,
        answer_text: answerText,
        feedback,
      });
      if (error) throw error;

      // 2. Upsert a la racha del usuario
      const { error: streakError } = await supabase
        .from("streaks")
        .upsert({ user_id: userId, current_streak: nextStreak, max_streak: newMaxStreak, updated_at: new Date().toISOString() });
      if (streakError) throw streakError;
    },
    onSuccess: () => {
      // Invalidar racha, pregunta del día e historial para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ["user-stats", userId] });
      queryClient.invalidateQueries({ queryKey: ["daily-question", userId] });
      queryClient.invalidateQueries({ queryKey: ["answer-history", userId] });
      if (onSuccess) onSuccess();
    },
  });
};
