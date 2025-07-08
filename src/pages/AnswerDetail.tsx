
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MessageSquare, Lightbulb } from "lucide-react";
import { useEffect } from "react";

const AnswerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, user, loading } = useSupabaseAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth");
    }
  }, [loading, session, navigate]);

  // Fetch the specific answer with question details
  const { data: answer, isLoading, error } = useQuery({
    queryKey: ["answer-detail", id],
    enabled: !!id && !!user?.id,
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("answers")
        .select(`
          *,
          questions (
            text
          )
        `)
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !answer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-destructive mb-4">
            {error ? "Error loading answer" : "Answer not found"}
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => navigate("/")} 
            variant="ghost" 
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Answer Details</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                {new Date(answer.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Question Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Question
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                "{answer.questions?.text || "Question not available"}"
              </p>
            </CardContent>
          </Card>

          {/* Answer Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <MessageSquare className="h-5 w-5 text-green-600" />
                Your Answer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {answer.answer_text}
                </p>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Word count: {answer.answer_text.trim().split(/\s+/).filter(word => word.length > 0).length}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Card */}
          {answer.feedback && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-green-800">
                  <Lightbulb className="h-5 w-5 text-green-600" />
                  AI Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-800 leading-relaxed">
                  {answer.feedback}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerDetail;
