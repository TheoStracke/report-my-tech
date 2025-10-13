import { useState, useEffect } from "react";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import AttendanceForm from "@/components/AttendanceForm";
import AttendanceList from "@/components/AttendanceList";
import { getTodayAttendances } from "@/utils/localStorage";
import { Attendance } from "@/types/attendance";

const Index = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);

  const loadAttendances = () => {
    const today = getTodayAttendances();
    setAttendances(today);
  };

  useEffect(() => {
    loadAttendances();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <StatsCards attendances={attendances} />
        
        <AttendanceForm onAdd={loadAttendances} />
        
        <AttendanceList attendances={attendances} onUpdate={loadAttendances} />
      </main>

      <footer className="border-t border-border bg-card py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Desenvolvido por <span className="font-semibold text-foreground">Theo Stracke</span> – uso pessoal
        </div>
      </footer>
    </div>
  );
};

export default Index;
