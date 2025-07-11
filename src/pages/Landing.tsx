import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useEffect } from "react";
import {
  BookOpen,
  Target,
  TrendingUp,
  MessageSquare,
  Clock,
  Star,
  CheckCircle,
  Users,
  Award,
  Zap
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const { session, loading } = useSupabaseAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && session) {
      navigate("/dashboard");
    }
  }, [loading, session, navigate]);

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Daily English Practice",
      description: "Get a new thought-provoking question every day to improve your English writing skills."
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "AI-Powered Feedback",
      description: "Receive detailed feedback on structure, vocabulary, and grammar from advanced AI."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Monitor your improvement over time with detailed analytics and streak tracking."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Career-Focused Content",
      description: "Questions designed specifically for professional English communication."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Flexible Learning",
      description: "Practice at your own pace with questions that fit your schedule."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Achievement System",
      description: "Build streaks and track your longest learning periods for motivation."
    }
  ];

  const benefits = [
    "Improve professional English communication",
    "Build confidence in writing",
    "Develop critical thinking skills",
    "Track your learning progress",
    "Get personalized AI feedback",
    "Build consistent learning habits"
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Career English Spark</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth?mode=login")}
                className="text-foreground hover:text-primary"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate("/auth?mode=register")}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
            ✨ AI-Powered English Learning Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Master Professional English
            <span className="text-primary block">One Question at a Time</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Boost your career with daily English practice. Get personalized AI feedback, 
            track your progress, and build confidence in professional communication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?mode=register")}
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
            >
              Start Learning Today
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/auth?mode=login")}
              className="text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform combines AI technology with proven learning methods
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Why Choose Career English Spark?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our platform is designed specifically for professionals who want to improve 
                their English communication skills and advance their careers.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                <div className="text-muted-foreground">Practice Questions</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary mb-2">AI</div>
                <div className="text-muted-foreground">Powered Feedback</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Available</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary mb-2">∞</div>
                <div className="text-muted-foreground">Learning Progress</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your English Skills?
          </h2>
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            Join thousands of professionals who are already improving their English 
            communication skills with our AI-powered platform.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate("/auth?mode=register")}
            className="text-lg px-8 py-6"
          >
            Start Your Journey Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">Career English Spark</span>
          </div>
          <p className="text-muted-foreground">
            Empowering professionals to excel in English communication
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;