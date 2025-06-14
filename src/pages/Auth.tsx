
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const Auth = () => {
  const [mode, setMode] = useState<"login"|"register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);

  // Si el usuario ya está autenticado, redirigir
  if (session && user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Error de inicio de sesión", description: error.message });
      } else {
        toast({ title: "¡Bienvenido!", description: "Inicio de sesión exitoso" });
      }
    } else {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl }
      });
      if (error) {
        toast({ title: "Error al registrar", description: error.message });
      } else {
        toast({ title: "Revisa tu correo", description: "Verifica tu cuenta para continuar" });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Correo electrónico"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Procesando..."
              : mode === "login"
              ? "Entrar"
              : "Registrarse"}
          </Button>
        </form>
        <div className="text-sm text-muted-foreground text-center">
          {mode === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button className="underline" onClick={() => setMode("register")}>Regístrate</button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button className="underline" onClick={() => setMode("login")}>Inicia sesión</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
