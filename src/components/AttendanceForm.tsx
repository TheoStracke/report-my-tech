import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Attendance, AttendanceStatus, AttendanceType } from "@/types/attendance";
import { addAttendance } from "@/utils/localStorage";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface AttendanceFormProps {
  onAdd: () => void;
}

const AttendanceForm = ({ onAdd }: AttendanceFormProps) => {
  const [formData, setFormData] = useState({
    client: "",
    type: "Remoto" as AttendanceType,
    problem: "",
    solution: "",
    status: "Resolvido" as AttendanceStatus,
    timeSpent: "",
    observations: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client || !formData.problem || !formData.solution || !formData.timeSpent) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const now = new Date();
    const attendance: Attendance = {
      id: crypto.randomUUID(),
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0].substring(0, 5),
      client: formData.client,
      type: formData.type,
      problem: formData.problem,
      solution: formData.solution,
      status: formData.status,
      timeSpent: parseInt(formData.timeSpent),
      observations: formData.observations,
    };

    addAttendance(attendance);
    toast.success("Atendimento registrado com sucesso!");
    
    // Limpar formulário
    setFormData({
      client: "",
      type: "Remoto",
      problem: "",
      solution: "",
      status: "Resolvido",
      timeSpent: "",
      observations: "",
    });

    onAdd();
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Registrar Novo Atendimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente/Setor *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Nome do cliente ou setor"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Atendimento *</Label>
              <Select value={formData.type} onValueChange={(value: AttendanceType) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="Remoto">Remoto</SelectItem>
                  <SelectItem value="Telefone">Telefone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem">Descrição do Problema *</Label>
            <Textarea
              id="problem"
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              placeholder="Descreva o problema reportado..."
              className="bg-input border-border min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution">Solução Aplicada *</Label>
            <Textarea
              id="solution"
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              placeholder="Descreva a solução aplicada..."
              className="bg-input border-border min-h-[80px]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: AttendanceStatus) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Resolvido">Resolvido</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Encaminhado">Encaminhado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeSpent">Tempo Gasto (minutos) *</Label>
              <Input
                id="timeSpent"
                type="number"
                min="0"
                value={formData.timeSpent}
                onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                placeholder="Ex: 30"
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações (opcional)</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Informações adicionais..."
              className="bg-input border-border min-h-[60px]"
            />
          </div>

          <Button type="submit" className="btn-primary w-full">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Atendimento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;
