// Update this page (the content is just a fallback if you fail to update the page)

import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const FAKE_QUESTION = "Describe a recent challenge you faced at work and how you overcame it.";
const FAKE_STREAK = 4;

const Index = () => {
  const { session, user, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [streak, setStreak] = useState(FAKE_STREAK);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth");
    }
  }, [loading, session, navigate]);

  // Simulación de feedback IA
  const getSimulatedFeedback = (text: string) => {
    if (text.trim().length < 6) return "Your answer is a bit short. Try to expand it!";
    return "Excellent structure! Consider using more connectors and advanced vocabulary.";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular feedback por ahora
    setFeedback(getSimulatedFeedback(answer));
    setAnswer("");
    // Simulación: aumentar la racha
    setStreak((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-lg p-6 space-y-8">
        <header className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl">🔥</span>
            <span className="text-lg">Racha actual: </span>
            <span className="font-bold text-2xl">{streak}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-6 right-6"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
          >
            Cerrar sesión
          </Button>
        </header>
        <div>
          <h2 className="text-xl font-semibold mb-2">Pregunta del Día</h2>
          <div className="bg-muted rounded p-4 mb-4">{FAKE_QUESTION}</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full h-28 p-3 border border-muted rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            value={answer}
            required
            placeholder="Escribe tu respuesta en inglés aquí..."
            onChange={e => setAnswer(e.target.value)}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={answer.length === 0}
          >
            Obtener feedback
          </Button>
        </form>
        {feedback && (
          <div className="bg-green-100 text-green-900 border border-green-200 rounded p-4 animate-fade-in">
            <strong>Feedback:</strong> {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
