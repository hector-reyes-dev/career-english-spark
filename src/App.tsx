
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AnswerHistorySidebar } from "@/components/AnswerHistorySidebar";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "@/pages/Auth";
import AnswerDetail from "@/pages/AnswerDetail";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useSupabaseAuth();
  const location = useLocation();
  const [view, setView] = useState<'question' | 'progress'>('question');
  
  // Don't show sidebar on auth page
  if (location.pathname === '/auth') {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AnswerHistorySidebar userId={user?.id} setView={setView} view={view} />
        <SidebarInset className="flex-1">
          <Routes>
            <Route path="/" element={<Index view={view} setView={setView} />} />
            <Route path="/answer/:id" element={<AnswerDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
