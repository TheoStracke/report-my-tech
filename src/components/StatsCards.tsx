import { CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Attendance } from "@/types/attendance";

interface StatsCardsProps {
  attendances: Attendance[];
}

const StatsCards = ({ attendances }: StatsCardsProps) => {
  const total = attendances.length;
  const resolved = attendances.filter((a) => a.status === "Resolvido").length;
  const pending = attendances.filter((a) => a.status === "Pendente").length;
  const totalTime = attendances.reduce((sum, a) => sum + a.timeSpent, 0);

  const stats = [
    {
      title: "Total de Atendimentos",
      value: total,
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Resolvidos",
      value: resolved,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Pendentes",
      value: pending,
      icon: AlertCircle,
      color: "text-accent",
    },
    {
      title: "Tempo Total (min)",
      value: totalTime,
      icon: Clock,
      color: "text-blue-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="card-hover border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
