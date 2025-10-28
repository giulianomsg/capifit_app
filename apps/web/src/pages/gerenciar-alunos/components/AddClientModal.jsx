import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AddClientModal = ({
  isOpen = false,
  onClose = null,
  onSubmit = null,
  isSubmitting = false,
  className = '',
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    genero: '',
    planoAssinatura: 'mensal',
    statusPagamento: 'em-dia',
    objetivos: [],
    nivelExperiencia: '',
    condicoesMedicas: '',
    observacoes: '',
    enviarConvite: true,
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleObjectivesChange = (objective, checked) => {
    setFormData((prev) => ({
      ...prev,
      objetivos: checked
        ? [...prev?.objetivos, objective]
        : prev?.objetivos?.filter((obj) => obj !== objective),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData?.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData?.telefone?.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData?.planoAssinatura) {
      newErrors.planoAssinatura = 'Selecione um plano';
    }

    if (!formData?.statusPagamento) {
      newErrors.statusPagamento = 'Selecione o status de pagamento';
    }

    if (!formData?.nivelExperiencia) {
      newErrors.nivelExperiencia = 'Selecione o nível de experiência';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }

      setFormData({
        nome: '',
        email: '',
        telefone: '',
        dataNascimento: '',
        genero: '',
        planoAssinatura: 'mensal',
        statusPagamento: 'em-dia',
        objetivos: [],
        nivelExperiencia: '',
        condicoesMedicas: '',
        observacoes: '',
        enviarConvite: true,
      });
      setErrors({});

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    if (onClose) {
      onClose();
    }
  };

  const generoOptions = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'feminino', label: 'Feminino' },
    { value: 'outro', label: 'Outro' },
    { value: 'nao-informar', label: 'Prefiro não informar' },
  ];

  const planoOptions = [
    { value: 'mensal', label: 'Mensal - R$ 149,90' },
    { value: 'trimestral', label: 'Trimestral - R$ 399,90' },
    { value: 'anual', label: 'Anual - R$ 1.499,90' },
    { value: 'personalizado', label: 'Plano Personalizado' },
  ];

  const statusPagamentoOptions = [
    { value: 'em-dia', label: 'Pagamento em dia' },
    { value: 'pendente', label: 'Pagamento pendente' },
    { value: 'atrasado', label: 'Pagamento atrasado' },
  ];

  const nivelExperienciaOptions = [
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediario', label: 'Intermediário' },
    { value: 'avancado', label: 'Avançado' },
  ];

  const objetivosDisponiveis = [
    'Perda de peso',
    'Ganho de massa muscular',
    'Melhora do condicionamento',
    'Reabilitação',
    'Manutenção da saúde',
    'Preparação para competição',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div
        className={`relative bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="UserPlus" size={20} color="white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Adicionar Novo Cliente</h2>
              <p className="text-sm text-muted-foreground">Preencha os dados do cliente</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isSubmitting}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Informações Pessoais</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome Completo"
                  type="text"
                  placeholder="Digite o nome completo"
                  value={formData?.nome}
                  onChange={(e) => handleInputChange('nome', e?.target?.value)}
                  error={errors?.nome}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData?.email}
                  onChange={(e) => handleInputChange('email', e?.target?.value)}
                  error={errors?.email}
                  required
                />

                <Input
                  label="Telefone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData?.telefone}
                  onChange={(e) => handleInputChange('telefone', e?.target?.value)}
                  error={errors?.telefone}
                  required
                />

                <Input
                  label="Data de Nascimento"
                  type="date"
                  value={formData?.dataNascimento}
                  onChange={(e) => handleInputChange('dataNascimento', e?.target?.value)}
                />

                <Select
                  label="Gênero"
                  options={generoOptions}
                  value={formData?.genero}
                  onChange={(value) => handleInputChange('genero', value)}
                  placeholder="Selecione o gênero"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Plano de Assinatura</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Plano"
                  options={planoOptions}
                  value={formData?.planoAssinatura}
                  onChange={(value) => handleInputChange('planoAssinatura', value)}
                  error={errors?.planoAssinatura}
                  placeholder="Selecione um plano"
                  required
                />

                <Select
                  label="Status de Pagamento"
                  options={statusPagamentoOptions}
                  value={formData?.statusPagamento}
                  onChange={(value) => handleInputChange('statusPagamento', value)}
                  error={errors?.statusPagamento}
                  placeholder="Selecione o status"
                  required
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Informações de Treino</h3>

              <div className="space-y-4">
                <Select
                  label="Nível de Experiência"
                  options={nivelExperienciaOptions}
                  value={formData?.nivelExperiencia}
                  onChange={(value) => handleInputChange('nivelExperiencia', value)}
                  error={errors?.nivelExperiencia}
                  placeholder="Selecione o nível"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Objetivos</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {objetivosDisponiveis.map((objetivo) => (
                      <Checkbox
                        key={objetivo}
                        label={objetivo}
                        checked={formData?.objetivos?.includes(objetivo)}
                        onChange={(e) => handleObjectivesChange(objetivo, e?.target?.checked)}
                      />
                    ))}
                  </div>
                </div>

                <Input
                  label="Condições Médicas"
                  type="text"
                  placeholder="Lesões, limitações, medicamentos..."
                  value={formData?.condicoesMedicas}
                  onChange={(e) => handleInputChange('condicoesMedicas', e?.target?.value)}
                  description="Informações importantes para o treino"
                />

                <Input
                  label="Observações"
                  type="text"
                  placeholder="Informações adicionais..."
                  value={formData?.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e?.target?.value)}
                />
              </div>
            </div>

            <div>
              <Checkbox
                label="Enviar convite por email"
                description="O cliente receberá um email para acessar a plataforma"
                checked={formData?.enviarConvite}
                onChange={(e) => handleInputChange('enviarConvite', e?.target?.checked)}
              />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>

          <Button
            variant="default"
            onClick={handleSubmit}
            loading={isSubmitting}
            iconName="UserPlus"
            iconPosition="left"
          >
            Adicionar Cliente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal;
