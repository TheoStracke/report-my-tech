import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Attendance, AttendanceStatus, AttendanceType } from "@/types/attendance";
import { updateAttendance } from "@/utils/localStorage";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { loadCategories, addCategory as addNewCategory } from "@/utils/categories";

interface AttendanceModalProps {
  attendance: Attendance;
  onClose: () => void;
  onUpdate: () => void;
}

const AttendanceModal = ({ attendance, onClose, onUpdate }: AttendanceModalProps) => {
  const [formData, setFormData] = useState({
    client: attendance.client,
    type: attendance.type as AttendanceType,
    category: attendance.category || "",
    problem: attendance.problem,
    solution: attendance.solution,
    status: attendance.status as AttendanceStatus,
    timeSpent: attendance.timeSpent.toString(),
    firstResponseMinutes: (attendance.firstResponseMinutes ?? "").toString(),
    causeNoSolution: attendance.causeNoSolution ?? "",
    observations: attendance.observations || "",
  });

  const [categories, setCategories] = useState(() => loadCategories());
  const [newCategory, setNewCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client || !formData.problem || !formData.solution || !formData.timeSpent) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const updatedAttendance: Attendance = {
      ...attendance,
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

    updateAttendance(attendance.id, updatedAttendance);
    toast.success("Atendimento atualizado com sucesso!");
    onUpdate();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Atendimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-client">Cliente/Setor *</Label>
              <Input
                id="edit-client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo de Atendimento *</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Despachante/Categoria</Label>
            <div className="flex gap-2">
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-input border-border flex-1">
                  <SelectValue placeholder="Selecione ou adicione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="edit-newCategory"
                placeholder="Nova categoria"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-input border-border flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newCategory.trim()) {
                    addNewCategory(newCategory.trim());
                    setCategories(loadCategories());
                    setFormData({ ...formData, category: newCategory.trim() });
                    setNewCategory("");
                    toast.success("Categoria adicionada!");
                  }
                }}
                className="px-3"
              >
                Adicionar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-problem">Descrição do Problema *</Label>
            <Textarea
              id="edit-problem"
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              className="bg-input border-border min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-solution">Solução Aplicada *</Label>
            <Textarea
              id="edit-solution"
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              className="bg-input border-border min-h-[80px]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status *</Label>
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
              <Label htmlFor="edit-timeSpent">Tempo Gasto (minutos) *</Label>
              <Input
                id="edit-timeSpent"
                type="number"
                min="0"
                value={formData.timeSpent}
                onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                disabled={formData.status === "Pendente"}
                className="bg-input border-border"
              />
            </div>
          </div>

          {formData.status === "Pendente" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-firstResponse">Tempo de Primeira Resposta (min)*</Label>
                <Input
                  id="edit-firstResponse"
                  type="number"
                  min="0"
                  value={formData.firstResponseMinutes}
                  onChange={(e) => setFormData({ ...formData, firstResponseMinutes: e.target.value })}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cause">Causa (sem solução)*</Label>
                <Input
                  id="edit-cause"
                  value={formData.causeNoSolution}
                  onChange={(e) => setFormData({ ...formData, causeNoSolution: e.target.value })}
                  className="bg-input border-border"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-observations">Observações (opcional)</Label>
            <Textarea
              id="edit-observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="bg-input border-border min-h-[60px]"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary">
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal;
