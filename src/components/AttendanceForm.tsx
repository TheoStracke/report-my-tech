import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Attendance, AttendanceStatus, AttendanceType } from '@/types/attendance';
import { addAttendance } from '@/utils/localStorage';
import { Plus, CheckCircle2, Clock, FileText, AlertCircle, Edit2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { loadCategories } from '@/utils/categories';
import { SUPPORT_ERRORS } from '@/utils/supportErrors';

interface AttendanceFormProps {
  onAdd: () => void;
}

const AttendanceForm = ({ onAdd }: AttendanceFormProps) => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const defaultTime = pad(now.getHours()) + ':' + pad(now.getMinutes());
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    category: '',
    type: 'Suporte Técnico' as AttendanceType,
    errorType: '',
    problem: '',
    solution: '',
    status: 'Resolvido' as AttendanceStatus,
    time: defaultTime,
    timeSpent: '',
    firstResponseMinutes: '',
    causeNoSolution: '',
    observations: '',
  });

  const [categories] = useState(() => {
    const cats = loadCategories();
    if (!cats.includes('CLIENTE FINAL')) return ['CLIENTE FINAL', ...cats];
    return cats;
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('submit-attendance')?.click();
      }
      if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const tabs = ['info', 'details', 'finish'];
        setActiveTab(tabs[parseInt(e.key) - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!formData.category) errors.push('Cliente/Despachante');
    if (!formData.problem) errors.push('Descrição do Problema');
    if (!formData.solution) errors.push('Solução Aplicada');
    if (formData.status !== 'Pendente' && !formData.timeSpent) errors.push('Tempo Gasto');

    if (errors.length > 0) {
      toast.error(`Campos obrigatórios não preenchidos: ${errors.join(', ')}`);
      return;
    }

    const today = new Date();
    const attendance: Attendance = {
      id: crypto.randomUUID(),
      date: today.toISOString().split('T')[0],
      time: formData.time,
      category: formData.category,
      type: formData.type,
      errorType: formData.errorType || undefined,
      problem: formData.problem,
      solution: formData.solution,
      status: formData.status,
      timeSpent: formData.status === 'Pendente' ? 0 : parseInt(formData.timeSpent || '0'),
      firstResponseMinutes: formData.status === 'Pendente' ? parseInt(formData.firstResponseMinutes || '0') : undefined,
      causeNoSolution: formData.status === 'Pendente' ? (formData.causeNoSolution || undefined) : undefined,
      observations: formData.observations,
    };

    addAttendance(attendance);
    toast.success('✓ Atendimento registrado com sucesso!', {
      description: `Cliente: ${formData.category}`,
      duration: 3000,
    });
    
    setFormData({
      category: '',
      type: 'Suporte Técnico',
      errorType: '',
      problem: '',
      solution: '',
      status: 'Resolvido',
      time: defaultTime,
      timeSpent: '',
      firstResponseMinutes: '',
      causeNoSolution: '',
      observations: '',
    });
    
    setActiveTab('info');
    onAdd();
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch(status) {
      case 'Resolvido': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Pendente': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'Encaminhado': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  const isTabComplete = (tab: string) => {
    switch(tab) {
      case 'info': return formData.category && formData.type;
      case 'details': return formData.problem && formData.solution;
      case 'finish': return formData.status && (formData.status === 'Pendente' || formData.timeSpent);
      default: return false;
    }
  };

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              Novo Atendimento
            </CardTitle>
            <CardDescription className="text-sm">
              Preencha as informações do atendimento de forma rápida e organizada
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs hidden sm:flex">
            Ctrl+Enter para salvar
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="info" className="gap-2">
                <Edit2 className="h-4 w-4" />
                <span className="hidden sm:inline">Informações</span>
                {isTabComplete('info') && <CheckCircle2 className="h-3 w-3 text-green-600" />}
              </TabsTrigger>
              <TabsTrigger value="details" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Detalhes</span>
                {isTabComplete('details') && <CheckCircle2 className="h-3 w-3 text-green-600" />}
              </TabsTrigger>
              <TabsTrigger value="finish" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Finalizar</span>
                {isTabComplete('finish') && <CheckCircle2 className="h-3 w-3 text-green-600" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 mt-0">
              <div className="grid gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="category" className="text-base font-semibold">
                      Cliente ou Despachante <span className="text-destructive">*</span>
                    </Label>
                  </div>
                  <Combobox
                    options={categories}
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    placeholder="Digite ou selecione o cliente..."
                    searchPlaceholder="Buscar cliente..."
                    emptyText="Nenhum cliente encontrado."
                  />
                  {formData.category && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      Cliente selecionado
                    </p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="type" className="text-base font-semibold">
                        Tipo de Atendimento <span className="text-destructive">*</span>
                      </Label>
                    </div>
                    <Select value={formData.type} onValueChange={(value: AttendanceType) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="bg-input border-border h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Suporte Técnico">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            Suporte Técnico
                          </div>
                        </SelectItem>
                        <SelectItem value="Suporte Documental">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            Suporte Documental
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="time" className="text-base font-semibold">
                        Horário <span className="text-destructive">*</span>
                      </Label>
                    </div>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                      className="bg-input border-border h-11 text-base"
                    />
                  </div>
                </div>

                {formData.type === 'Suporte Técnico' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="errorType" className="text-base font-semibold">
                        Categoria do Erro
                      </Label>
                      <Badge variant="secondary" className="text-xs">Opcional</Badge>
                    </div>
                    <Select value={formData.errorType} onValueChange={(value: string) => setFormData({ ...formData, errorType: value })}>
                      <SelectTrigger className="bg-input border-border h-11">
                        <SelectValue placeholder="Selecione a categoria do erro..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORT_ERRORS.map((error) => (
                          <SelectItem key={error} value={error}>{error}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={() => setActiveTab('details')} className="gap-2" disabled={!isTabComplete('info')}>
                  Próximo: Detalhes
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-0">
              <div className="grid gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="problem" className="text-base font-semibold">
                      Descrição do Problema <span className="text-destructive">*</span>
                    </Label>
                  </div>
                  <Textarea
                    id="problem"
                    value={formData.problem}
                    onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                    placeholder="Descreva detalhadamente o problema reportado pelo cliente..."
                    className="bg-input border-border min-h-[120px] text-base resize-none"
                  />
                  <p className="text-xs text-muted-foreground">{formData.problem.length} caracteres</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="solution" className="text-base font-semibold">
                      Solução Aplicada <span className="text-destructive">*</span>
                    </Label>
                  </div>
                  <Textarea
                    id="solution"
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    placeholder="Descreva a solução aplicada ou as ações realizadas..."
                    className="bg-input border-border min-h-[120px] text-base resize-none"
                  />
                  <p className="text-xs text-muted-foreground">{formData.solution.length} caracteres</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="observations" className="text-base font-semibold">
                      Observações Adicionais
                    </Label>
                    <Badge variant="secondary" className="text-xs">Opcional</Badge>
                  </div>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Informações complementares, detalhes técnicos, etc..."
                    className="bg-input border-border min-h-[80px] text-base resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('info')} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Voltar
                </Button>
                <Button type="button" onClick={() => setActiveTab('finish')} className="gap-2" disabled={!isTabComplete('details')}>
                  Próximo: Finalizar
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="finish" className="space-y-6 mt-0">
              <div className="grid gap-6">
                <div className="space-y-3">
                  <Label htmlFor="status" className="text-base font-semibold">
                    Status do Atendimento <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.status} onValueChange={(value: AttendanceStatus) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className={`border-border h-11 ${getStatusColor(formData.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Resolvido">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Resolvido</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Pendente">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span>Pendente</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Encaminhado">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <span>Encaminhado</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="timeSpent" className="text-base font-semibold">
                        Tempo Gasto {formData.status !== 'Pendente' && <span className="text-destructive">*</span>}
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="timeSpent"
                        type="number"
                        min="0"
                        value={formData.timeSpent}
                        onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                        disabled={formData.status === 'Pendente'}
                        placeholder="Ex: 30"
                        className="bg-input border-border h-11 text-base pr-20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        minutos
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="firstResponse" className="text-base font-semibold">
                        Tempo 1ª Resposta <span className="text-destructive">*</span>
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="firstResponse"
                        type="number"
                        min="0"
                        value={formData.firstResponseMinutes}
                        onChange={(e) => setFormData({ ...formData, firstResponseMinutes: e.target.value })}
                        placeholder="Ex: 5"
                        className="bg-input border-border h-11 text-base pr-20"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        minutos
                      </span>
                    </div>
                  </div>
                </div>

                {formData.status === 'Pendente' && (
                  <div className="space-y-3 p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <Label htmlFor="causeNoSolution" className="text-base font-semibold text-yellow-600">
                        Motivo da Pendência <span className="text-destructive">*</span>
                      </Label>
                    </div>
                    <Input
                      id="causeNoSolution"
                      value={formData.causeNoSolution}
                      onChange={(e) => setFormData({ ...formData, causeNoSolution: e.target.value })}
                      placeholder="Ex: Aguardando retorno do cliente, Peça em falta..."
                      className="bg-background border-yellow-500/20 h-11 text-base"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('details')} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Voltar
                </Button>
                <Button id="submit-attendance" type="submit" className="gap-2 bg-green-600 hover:bg-green-700" disabled={!isTabComplete('finish')}>
                  <Save className="h-4 w-4" />
                  Registrar Atendimento
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;
