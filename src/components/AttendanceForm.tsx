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
import { loadCategories, addCategory as addNewCategory } from "@/utils/categories";

interface AttendanceFormProps {
  onAdd: () => void;
}

const AttendanceForm = ({ onAdd }: AttendanceFormProps) => {
  const [formData, setFormData] = useState({
    client: "",
    type: "Suporte Técnico" as AttendanceType,
    category: "",
    problem: "",
    solution: "",
    status: "Resolvido" as AttendanceStatus,
    timeSpent: "",
    firstResponseMinutes: "",
    causeNoSolution: "",
    observations: "",
  });

  const [categories, setCategories] = useState<string[]>(() => loadCategories());
  const [newCategory, setNewCategory] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client || !formData.problem || !formData.solution || (formData.status !== "Pendente" && !formData.timeSpent)) {
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
      category: formData.category || undefined,
      problem: formData.problem,
      solution: formData.solution,
      status: formData.status,
      timeSpent: formData.status === "Pendente" ? 0 : parseInt(formData.timeSpent || "0"),
      firstResponseMinutes: formData.status === "Pendente" ? parseInt(formData.firstResponseMinutes || "0") : undefined,
      causeNoSolution: formData.status === "Pendente" ? (formData.causeNoSolution || undefined) : undefined,
      observations: formData.observations,
    };

    addAttendance(attendance);
    toast.success("Atendimento registrado com sucesso!");
    
    // Limpar formulário
    setFormData({
      client: "",
      type: "Suporte Técnico",
      category: "",
      problem: "",
      solution: "",
      status: "Resolvido",
      timeSpent: "",
      firstResponseMinutes: "",
      causeNoSolution: "",
      observations: "",
    });

    setNewCategory("");

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
                  <SelectItem value="Suporte Documental">Suporte Documental</SelectItem>
                  <SelectItem value="Suporte Técnico">Suporte Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria do Suporte (opcional)</Label>
              <div className="flex gap-2">
                <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-input border-border min-w-[240px]">
                    <SelectValue placeholder="Selecione ou adicione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nova categoria"
                  className="bg-input border-border"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const v = newCategory.trim();
                    if (!v) return;
                    const next = addNewCategory(v);
                    setCategories(next);
                    setFormData({ ...formData, category: v });
                    setNewCategory("");
                    toast.success("Categoria adicionada");
                  }}
                >
                  Adicionar
                </Button>
              </div>
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
                disabled={formData.status === "Pendente"}
                placeholder="Ex: 30"
                className="bg-input border-border"
              />
            </div>
          </div>

          {formData.status === "Pendente" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstResponse">Tempo de Primeira Resposta (min)*</Label>
                <Input
                  id="firstResponse"
                  type="number"
                  min="0"
                  value={formData.firstResponseMinutes}
                  onChange={(e) => setFormData({ ...formData, firstResponseMinutes: e.target.value })}
                  placeholder="Ex: 5"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="causeNoSolution">Causa (sem solução)*</Label>
                <Input
                  id="causeNoSolution"
                  value={formData.causeNoSolution}
                  onChange={(e) => setFormData({ ...formData, causeNoSolution: e.target.value })}
                  placeholder="Ex.: Aguardando peça, Acesso negado, Falta de informação..."
                  className="bg-input border-border"
                />
              </div>
            </div>
          )}

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
