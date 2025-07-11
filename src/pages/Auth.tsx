import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Zap, ArrowLeft } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { session } = useSupabaseAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/dashboard`;
        
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        if (signUpError) {
          if (signUpError.message.includes("already registered")) {
            setError("This email is already registered. Try logging in instead.");
          } else {
            setError(signUpError.message);
          }
        } else {
          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account.",
          });
          // Switch to login mode after successful registration
          setMode("login");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes("Invalid login credentials")) {
            setError("Invalid email or password. Please try again.");
          } else {
            setError(signInError.message);
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Career English Spark</span>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {mode === "login" 
                ? "Sign in to continue your English learning journey" 
                : "Start your English learning journey today"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading 
                  ? (mode === "login" ? "Signing In..." : "Creating Account...") 
                  : (mode === "login" ? "Sign In" : "Create Account")
                }
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                disabled={loading}
                className="p-0 h-auto text-primary"
              >
                {mode === "login" ? "Create one here" : "Sign in here"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;