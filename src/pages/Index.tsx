
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  useDailyQuestion,
  useUserStats,
  useSubmitAnswer,
} from "@/hooks/useDailyQuestion";
import { useToast } from "@/hooks/use-toast";
import { ProgressAnalysis } from "@/components/ProgressAnalysis";
import { StructuredFeedback } from "@/components/StructuredFeedback";

interface IndexProps {
  view: 'question' | 'progress';
  setView: (view: 'question' | 'progress') => void;
}

const Index = ({ view, setView }: IndexProps) => {
  const { session, user, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const { toast } = useToast();

  // Pregunta del día personalizada para el usuario
  const { data: question, isLoading: loadingQuestion, error: errorQuestion } = useDailyQuestion(user?.id);

  // Racha y estadísticas del usuario
  const { data: stats, isLoading: loadingStats } = useUserStats(user?.id);

  // Mutación para enviar respuesta y actualizar racha
  const submitAnswer = useSubmitAnswer(user?.id, () => {
    setAnswer("");
    setWordCount(0);
    toast({ title: "Answer saved", description: "You received feedback and your streak was updated!" });
  });

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth");
    }
  }, [loading, session, navigate]);

  // Update word count
  useEffect(() => {
    const words = answer.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [answer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question?.id) return;

    setIsGeneratingFeedback(true);
    setFeedback(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-feedback', {
        body: { answerText: answer },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }
      
      const fb = data.feedback;
      setFeedback(fb);

      const currentStreak = stats?.current_streak ?? 0;
      const nextStreak = currentStreak + 1;
      const currentMaxStreak = stats?.max_streak ?? 0;
      const newMaxStreak = Math.max(currentMaxStreak, nextStreak);

      submitAnswer.mutate({
        questionId: question.id,
        answerText: answer,
        feedback: fb,
        nextStreak,
        newMaxStreak,
      });

    } catch (error: any) {
      console.error("Error getting feedback:", error);
      toast({
        title: "Error generating feedback",
        description: error.message || "Could not connect to AI service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  if (loading || loadingQuestion || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  if (errorQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-700">
        {errorQuestion.message}
      </div>
    );
  }

  return (
    <div className="flex-1">
      {view === 'question' ? (
        <div className="max-w-4xl mx-auto p-8">
          {/* Header with streak info */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Current Streak</div>
                <div className="flex items-center gap-2">
                  <span className="text-4xl">🔥</span>
                  <span className="text-4xl font-bold text-primary">{stats?.current_streak ?? 0}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Longest Streak</div>
                <div className="text-4xl font-bold text-foreground">{stats?.max_streak ?? 0}</div>
              </div>
            </div>
          </div>

          {/* Question Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-6">Today's Question:</h1>
            <div className="text-xl text-muted-foreground leading-relaxed">
              "{question ? question.text : "Congratulations! You've answered all questions."}"
            </div>
          </div>

          {/* Answer Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <textarea
                className="w-full h-48 p-6 border border-input rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-card-foreground placeholder:text-muted-foreground text-base leading-relaxed"
                value={answer}
                required
                placeholder="Write your answer here in English... (min. 50 words)"
                onChange={e => setAnswer(e.target.value)}
                disabled={!question || submitAnswer.isPending || isGeneratingFeedback}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="text-sm text-muted-foreground">
                  Word Count: {wordCount}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="px-8 py-3 rounded-xl font-medium"
                  disabled={!question || answer.length === 0 || submitAnswer.isPending || isGeneratingFeedback}
                >
                  {isGeneratingFeedback
                    ? "Generating feedback..."
                    : submitAnswer.isPending
                    ? "Saving..."
                    : "Submit & Get Feedback"}
                </Button>
              </div>
            </div>
          </form>

          {/* Feedback Section */}
          {feedback && (
            <div className="mt-8">
              <StructuredFeedback feedback={feedback} />
            </div>
          )}
        </div>
      ) : (
        <ProgressAnalysis userId={user?.id} />
      )}
    </div>
  );
};

export default Index;
