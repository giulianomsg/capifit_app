import React, { useEffect, useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const PersonalInfoForm = ({ initialData = {}, onSave, className = '' }) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome ?? '',
    email: initialData?.email ?? '',
    telefone: initialData?.telefone ?? '',
    cpf: initialData?.cpf ?? '',
    dataNascimento: initialData?.dataNascimento ?? '',
    genero: initialData?.genero ?? 'masculino',
    endereco: initialData?.endereco ?? '',
    cidade: initialData?.cidade ?? '',
    estado: initialData?.estado ?? 'SP',
    cep: initialData?.cep ?? '',
    especialidades: initialData?.especialidades ?? '',
    biografia: initialData?.biografia ?? '',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...initialData,
      nome: initialData?.nome ?? prev.nome ?? '',
      email: initialData?.email ?? prev.email ?? '',
      telefone: initialData?.telefone ?? prev.telefone ?? '',
    }));
  }, [initialData]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const especialidadeOptions = [
    { value: 'musculacao', label: 'Musculação' },
    { value: 'funcional', label: 'Treinamento Funcional' },
    { value: 'crossfit', label: 'CrossFit' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'natacao', label: 'Natação' },
    { value: 'corrida', label: 'Corrida' },
    { value: 'boxe', label: 'Boxe/Muay Thai' },
    { value: 'danca', label: 'Dança' },
    { value: 'reabilitacao', label: 'Reabilitação' }
  ];

  const generoOptions = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'feminino', label: 'Feminino' },
    { value: 'outro', label: 'Outro' },
    { value: 'nao_informar', label: 'Prefiro não informar' }
  ];

  const estadoOptions = [
    { value: 'SP', label: 'São Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'PR', label: 'Paraná' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'BA', label: 'Bahia' },
    { value: 'GO', label: 'Goiás' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'CE', label: 'Ceará' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData?.telefone?.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData?.cpf?.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await onSave?.(formData);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Informações Pessoais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome Completo"
            type="text"
            value={formData?.nome}
            onChange={(e) => handleInputChange('nome', e?.target?.value)}
            error={errors?.nome}
            required
            placeholder="Digite seu nome completo"
          />
          
          <Input
            label="Email"
            type="email"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
            placeholder="seu@email.com"
          />
          
          <Input
            label="Telefone"
            type="tel"
            value={formData?.telefone}
            onChange={(e) => handleInputChange('telefone', e?.target?.value)}
            error={errors?.telefone}
            required
            placeholder="(11) 99999-9999"
          />
          
          <Input
            label="CPF"
            type="text"
            value={formData?.cpf}
            onChange={(e) => handleInputChange('cpf', e?.target?.value)}
            error={errors?.cpf}
            required
            placeholder="123.456.789-00"
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
            placeholder="Selecione seu gênero"
          />
        </div>
      </div>
      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Endereço
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Endereço"
              type="text"
              value={formData?.endereco}
              onChange={(e) => handleInputChange('endereco', e?.target?.value)}
              placeholder="Rua, número, complemento"
            />
          </div>
          
          <Input
            label="CEP"
            type="text"
            value={formData?.cep}
            onChange={(e) => handleInputChange('cep', e?.target?.value)}
            placeholder="12345-678"
          />
          
          <Input
            label="Cidade"
            type="text"
            value={formData?.cidade}
            onChange={(e) => handleInputChange('cidade', e?.target?.value)}
            placeholder="Nome da cidade"
          />
          
          <Select
            label="Estado"
            options={estadoOptions}
            value={formData?.estado}
            onChange={(value) => handleInputChange('estado', value)}
            placeholder="Selecione o estado"
          />
        </div>
      </div>
      {/* Informações Profissionais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Informações Profissionais
        </h3>
        
        <Select
          label="Especialidades"
          options={especialidadeOptions}
          value={formData?.especialidades}
          onChange={(value) => handleInputChange('especialidades', value)}
          multiple
          searchable
          placeholder="Selecione suas especialidades"
          description="Escolha até 5 especialidades principais"
        />
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Biografia Profissional
          </label>
          <textarea
            value={formData?.biografia}
            onChange={(e) => handleInputChange('biografia', e?.target?.value)}
            placeholder="Conte um pouco sobre sua experiência, metodologia e objetivos como personal trainer..."
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData?.biografia?.length}/500 caracteres
          </p>
        </div>
      </div>
      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location?.reload()}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          loading={isLoading}
          iconName="Save"
          iconPosition="left"
        >
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};

export default PersonalInfoForm;