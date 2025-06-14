
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAnswerHistory = (userId?: string) => {
  return useQuery({
    queryKey: ["answer-history", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("answers")
        .select(`
          *,
          questions (
            text
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};
