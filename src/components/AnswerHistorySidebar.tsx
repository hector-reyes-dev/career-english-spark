
import { History, MessageSquare, TrendingUp } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { useAnswerHistory } from "@/hooks/useAnswerHistory";

interface AnswerHistorySidebarProps {
  userId?: string;
  setView: (view: 'question' | 'progress') => void;
}

export function AnswerHistorySidebar({ userId, setView }: AnswerHistorySidebarProps) {
  const { data: history = [], isLoading } = useAnswerHistory(userId);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <span className="font-semibold">Menú Principal</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
               <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView('question')}>
                  <MessageSquare className="h-4 w-4" />
                  <span>Pregunta del Día</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView('progress')}>
                  <TrendingUp className="h-4 w-4" />
                  <span>Análisis de Progreso</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Historial Reciente</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Cargando historial...
                </div>
              ) : history.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No hay respuestas aún
                </div>
              ) : (
                history.slice(0, 5).map((answer) => (
                  <SidebarMenuItem key={answer.id}>
                    <SidebarMenuButton className="flex flex-col items-start h-auto py-3">
                      <div className="flex items-center gap-2 w-full">
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(answer.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2 text-left">
                        {answer.questions?.text || "Pregunta eliminada"}
                      </p>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
