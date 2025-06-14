
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Lee la última pregunta creada en Supabase
export const useDailyQuestion = () => {
  return useQuery({
    queryKey: ["daily-question"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Aún no hay pregunta del día");
      return data[0];
    },
  });
};

// Carga la racha del usuario autenticado
export const useUserStreak = (userId?: string) => {
  return useQuery({
    queryKey: ["user-streak", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return 0;
      const { data, error } = await supabase
        .from("streaks")
        .select("current_streak")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data?.current_streak ?? 0;
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
    }: {
      questionId: string;
      answerText: string;
      feedback: string;
      nextStreak: number;
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
        .upsert({ user_id: userId, current_streak: nextStreak, updated_at: new Date().toISOString() });
      if (streakError) throw streakError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-streak"] });
      if (onSuccess) onSuccess();
    },
  });
};
