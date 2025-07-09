
import { MessageSquare, TrendingUp, User, Settings, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAnswerHistory } from "@/hooks/useAnswerHistory";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AnswerHistorySidebarProps {
  userId?: string;
  setView: (view: 'question' | 'progress') => void;
  view: 'question' | 'progress';
}

export function AnswerHistorySidebar({ userId, setView, view }: AnswerHistorySidebarProps) {
  const { data: history = [], isLoading } = useAnswerHistory(userId);
  const navigate = useNavigate();

  const handleAnswerClick = (answerId: string) => {
    navigate(`/answer/${answerId}`);
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-6 border-b border-border">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            setView('question');
            navigate('/');
          }}
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">Writely</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => {
                    setView('question');
                    navigate('/');
                  }}
                  className={`w-full justify-start p-3 rounded-xl transition-colors ${
                    view === 'question' 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Daily Question</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => {
                    setView('progress');
                    navigate('/');
                  }}
                  className={`w-full justify-start p-3 rounded-xl transition-colors ${
                    view === 'progress' 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>My Progress</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Recent Answers
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {isLoading ? (
                <div className="p-3 text-sm text-muted-foreground">
                  Loading history...
                </div>
              ) : history.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  No answers yet
                </div>
              ) : (
                history.slice(0, 5).map((answer) => (
                  <SidebarMenuItem key={answer.id}>
                    <div 
                      className="p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleAnswerClick(answer.id)}
                    >
                      <p className="text-sm font-medium line-clamp-2 text-foreground mb-1">
                        {answer.questions?.text || "Question deleted"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(answer.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="w-full justify-start p-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <User className="h-5 w-5" />
              <span>John Doe</span>
              <LogOut className="h-4 w-4 ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
