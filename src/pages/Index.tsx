
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
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AnswerHistorySidebar } from "@/components/AnswerHistorySidebar";
import { ProgressAnalysis } from "@/components/ProgressAnalysis";

const Index = () => {
  const { session, user, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const { toast } = useToast();
  const [view, setView] = useState<'question' | 'progress'>('question');

  // Pregunta del día personalizada para el usuario
  const { data: question, isLoading: loadingQuestion, error: errorQuestion } = useDailyQuestion(user?.id);

  // Racha y estadísticas del usuario
  const { data: stats, isLoading: loadingStats } = useUserStats(user?.id);

  // Mutación para enviar respuesta y actualizar racha
  const submitAnswer = useSubmitAnswer(user?.id, () => {
    // No limpiar el feedback aquí para que el usuario pueda verlo
    setAnswer("");
    toast({ title: "Respuesta guardada", description: "¡Recibiste feedback y tu racha fue actualizada!" });
  });

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth");
    }
  }, [loading, session, navigate]);

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
        title: "Error al generar feedback",
        description: error.message || "No se pudo conectar con el servicio de IA. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  if (loading || loadingQuestion || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Cargando...
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AnswerHistorySidebar userId={user?.id} setView={setView} />
        <SidebarInset>
          <div className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger />
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
            >
              Cerrar sesión
            </Button>
          </div>
          <div className="flex items-center justify-center flex-1">
            {view === 'question' ? (
              <div className="bg-card rounded-lg shadow-lg w-full max-w-lg p-6 space-y-8 animate-fade-in">
                <header className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl">🔥</span>
                    <span className="text-lg">Racha actual: </span>
                    <span className="font-bold text-2xl">{stats?.current_streak ?? 0}</span>
                  </div>
                </header>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Pregunta del Día</h2>
                  <div className="bg-muted rounded p-4 mb-4 min-h-[60px] flex items-center justify-center text-center">
                    {question ? question.text : "¡Felicidades! Has respondido todas las preguntas."}
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <textarea
                    className="w-full h-28 p-3 border border-muted rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    value={answer}
                    required
                    placeholder="Escribe tu respuesta en inglés aquí..."
                    onChange={e => setAnswer(e.target.value)}
                    disabled={!question || submitAnswer.isPending || isGeneratingFeedback}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!question || answer.length === 0 || submitAnswer.isPending || isGeneratingFeedback}
                  >
                    {isGeneratingFeedback
                      ? "Generando feedback..."
                      : submitAnswer.isPending
                      ? "Guardando..."
                      : "Obtener feedback"}
                  </Button>
                </form>
                {feedback && (
                  <div className="bg-green-100 text-green-900 border border-green-200 rounded p-4 animate-fade-in">
                    <strong>Feedback:</strong> {feedback}
                  </div>
                )}
              </div>
            ) : (
              <ProgressAnalysis userId={user?.id} />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
