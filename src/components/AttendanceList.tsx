import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Attendance } from "@/types/attendance";
import { deleteAttendance } from "@/utils/localStorage";
import { exportTodayToCSV } from "@/utils/csvExport";
import { Search, Download, Edit2, Trash2, List } from "lucide-react";
import { toast } from "sonner";
import AttendanceModal from "./AttendanceModal";

interface AttendanceListProps {
  attendances: Attendance[];
  onUpdate: () => void;
}

const AttendanceList = ({ attendances, onUpdate }: AttendanceListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);

  const filteredAttendances = attendances.filter(
    (a) =>
      a.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.solution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este atendimento?")) {
      deleteAttendance(id);
      toast.success("Atendimento excluído com sucesso!");
      onUpdate();
    }
  };

  const handleExport = () => {
    exportTodayToCSV(attendances);
    toast.success("CSV exportado com sucesso!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolvido":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Pendente":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Encaminhado":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5 text-primary" />
              Atendimentos de Hoje
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar atendimentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-input border-border pl-9"
                />
              </div>
              <Button onClick={handleExport} className="btn-accent shrink-0">
                <Download className="mr-2 h-4 w-4" />
                Gerar CSV Diário
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAttendances.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {searchTerm
                ? "Nenhum atendimento encontrado com os termos de busca."
                : "Nenhum atendimento registrado hoje. Comece adicionando um novo!"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAttendances.map((attendance) => (
                <div
                  key={attendance.id}
                  className="rounded-lg border border-border bg-card/50 p-4 transition-all hover:border-primary/50 hover:bg-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={getStatusColor(attendance.status)}>
                          {attendance.status}
                        </Badge>
                        <Badge variant="secondary" className="bg-secondary/50">
                          {attendance.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {attendance.time} • {attendance.timeSpent} min
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground">{attendance.client}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Problema:</span> {attendance.problem}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Solução:</span> {attendance.solution}
                        </p>
                        {attendance.observations && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Obs:</span> {attendance.observations}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingAttendance(attendance)}
                        className="h-8 w-8 border-border hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(attendance.id)}
                        className="h-8 w-8 border-border hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingAttendance && (
        <AttendanceModal
          attendance={editingAttendance}
          onClose={() => setEditingAttendance(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};

export default AttendanceList;
