
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUserStats } from "@/hooks/useDailyQuestion";
import { useAnswerHistory } from "@/hooks/useAnswerHistory";
import { useMemo } from "react";
import { format, subDays, parseISO } from "date-fns";

interface ProgressAnalysisProps {
  userId?: string;
}

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export const ProgressAnalysis = ({ userId }: ProgressAnalysisProps) => {
  const { data: stats, isLoading: loadingStats } = useUserStats(userId);
  const { data: history = [], isLoading: loadingHistory } = useAnswerHistory(userId);

  const weeklyAnswersData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    const data = last7Days.map(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE');
      const count = history.filter(h => format(parseISO(h.created_at), 'yyyy-MM-dd') === dateString).length;
      return { name: dayName, Respuestas: count };
    });
    return data;
  }, [history]);
  
  if (loadingStats || loadingHistory) {
    return <div className="p-4 w-full text-center">Cargando análisis...</div>;
  }
  
  return (
    <div className="p-4 sm:p-6 space-y-6 w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Análisis de Progreso</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Racha Actual" value={stats?.current_streak ?? 0} icon={<span className="text-2xl">🔥</span>} />
        <StatCard title="Racha Máxima" value={stats?.max_streak ?? 0} icon={<span className="text-2xl">🏆</span>} />
        <StatCard title="Respuestas Totales" value={history.length} icon={<span className="text-2xl">📝</span>} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Respuestas en la última semana</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyAnswersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Respuestas" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
