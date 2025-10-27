import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';


const BusinessSettingsTab = ({ className = "" }) => {
  const [businessData, setBusinessData] = useState({
    // Pricing
    monthlyPrice: '150.00',
    quarterlyPrice: '400.00',
    annualPrice: '1400.00',
    sessionPrice: '80.00',
    assessmentPrice: '120.00',
    
    // Services
    services: ['personal_training', 'nutrition_plan', 'assessments'],
    
    // Availability
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '06:00',
    endTime: '20:00',
    sessionDuration: '60',
    
    // Business Info
    businessName: 'João Silva Personal Training',
    cnpj: '',
    businessAddress: 'Academia FitLife - Rua das Flores, 123',
    serviceArea: 'São Paulo - SP',
    maxClients: '20',
    
    // Commission
    commissionRate: '15',
    paymentDay: '5'
  });

  const [isLoading, setIsLoading] = useState(false);

  const serviceOptions = [
    { value: 'personal_training', label: 'Treinamento Personalizado' },
    { value: 'group_training', label: 'Treinamento em Grupo' },
    { value: 'nutrition_plan', label: 'Plano Nutricional' },
    { value: 'assessments', label: 'Avaliações Físicas' },
    { value: 'online_coaching', label: 'Coaching Online' },
    { value: 'meal_prep', label: 'Preparação de Refeições' }
  ];

  const dayOptions = [
    { value: 'monday', label: 'Segunda-feira' },
    { value: 'tuesday', label: 'Terça-feira' },
    { value: 'wednesday', label: 'Quarta-feira' },
    { value: 'thursday', label: 'Quinta-feira' },
    { value: 'friday', label: 'Sexta-feira' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  const sessionDurationOptions = [
    { value: '30', label: '30 minutos' },
    { value: '45', label: '45 minutos' },
    { value: '60', label: '1 hora' },
    { value: '90', label: '1h 30min' },
    { value: '120', label: '2 horas' }
  ];

  const handleInputChange = (field, value) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Configurações salvas:', businessData);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDiscounts = () => {
    const monthly = parseFloat(businessData?.monthlyPrice);
    const quarterly = parseFloat(businessData?.quarterlyPrice);
    const annual = parseFloat(businessData?.annualPrice);
    
    const quarterlyDiscount = ((monthly * 3 - quarterly) / (monthly * 3) * 100)?.toFixed(1);
    const annualDiscount = ((monthly * 12 - annual) / (monthly * 12) * 100)?.toFixed(1);
    
    return { quarterlyDiscount, annualDiscount };
  };

  const { quarterlyDiscount, annualDiscount } = calculateDiscounts();

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Configurações de Negócio
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure preços, serviços e disponibilidade
        </p>
      </div>
      {/* Pricing Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="DollarSign" size={20} className="mr-2" />
          Preços e Planos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <Input
              label="Plano Mensal"
              type="number"
              value={businessData?.monthlyPrice}
              onChange={(e) => handleInputChange('monthlyPrice', e?.target?.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground mt-1">R$ por mês</p>
          </div>
          
          <div>
            <Input
              label="Plano Trimestral"
              type="number"
              value={businessData?.quarterlyPrice}
              onChange={(e) => handleInputChange('quarterlyPrice', e?.target?.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-success mt-1">
              {quarterlyDiscount}% de desconto
            </p>
          </div>
          
          <div>
            <Input
              label="Plano Anual"
              type="number"
              value={businessData?.annualPrice}
              onChange={(e) => handleInputChange('annualPrice', e?.target?.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-success mt-1">
              {annualDiscount}% de desconto
            </p>
          </div>
          
          <div>
            <Input
              label="Sessão Avulsa"
              type="number"
              value={businessData?.sessionPrice}
              onChange={(e) => handleInputChange('sessionPrice', e?.target?.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground mt-1">R$ por sessão</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Avaliação Física"
            type="number"
            value={businessData?.assessmentPrice}
            onChange={(e) => handleInputChange('assessmentPrice', e?.target?.value)}
            placeholder="0.00"
            description="Preço da avaliação inicial"
          />
        </div>
      </div>
      {/* Services Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Briefcase" size={20} className="mr-2" />
          Serviços Oferecidos
        </h3>
        
        <Select
          label="Serviços Disponíveis"
          options={serviceOptions}
          value={businessData?.services}
          onChange={(value) => handleInputChange('services', value)}
          multiple
          placeholder="Selecione os serviços que você oferece"
          description="Escolha todos os serviços que você oferece aos clientes"
        />
      </div>
      {/* Availability Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Calendar" size={20} className="mr-2" />
          Disponibilidade
        </h3>
        
        <div className="space-y-4">
          <Select
            label="Dias de Trabalho"
            options={dayOptions}
            value={businessData?.workingDays}
            onChange={(value) => handleInputChange('workingDays', value)}
            multiple
            placeholder="Selecione os dias de trabalho"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Horário de Início"
              type="time"
              value={businessData?.startTime}
              onChange={(e) => handleInputChange('startTime', e?.target?.value)}
            />
            
            <Input
              label="Horário de Término"
              type="time"
              value={businessData?.endTime}
              onChange={(e) => handleInputChange('endTime', e?.target?.value)}
            />
            
            <Select
              label="Duração da Sessão"
              options={sessionDurationOptions}
              value={businessData?.sessionDuration}
              onChange={(value) => handleInputChange('sessionDuration', value)}
              placeholder="Duração padrão"
            />
          </div>
        </div>
      </div>
      {/* Business Info Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Building" size={20} className="mr-2" />
          Informações do Negócio
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome do Negócio"
            type="text"
            value={businessData?.businessName}
            onChange={(e) => handleInputChange('businessName', e?.target?.value)}
            placeholder="Nome fantasia ou razão social"
          />
          
          <Input
            label="CNPJ (Opcional)"
            type="text"
            value={businessData?.cnpj}
            onChange={(e) => handleInputChange('cnpj', e?.target?.value)}
            placeholder="00.000.000/0000-00"
          />
          
          <Input
            label="Local de Atendimento"
            type="text"
            value={businessData?.businessAddress}
            onChange={(e) => handleInputChange('businessAddress', e?.target?.value)}
            placeholder="Academia, estúdio ou endereço"
          />
          
          <Input
            label="Área de Atendimento"
            type="text"
            value={businessData?.serviceArea}
            onChange={(e) => handleInputChange('serviceArea', e?.target?.value)}
            placeholder="Cidade - Estado"
          />
          
          <Input
            label="Máximo de Clientes"
            type="number"
            value={businessData?.maxClients}
            onChange={(e) => handleInputChange('maxClients', e?.target?.value)}
            placeholder="20"
            description="Limite de clientes ativos"
          />
        </div>
      </div>
      {/* Commission Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Percent" size={20} className="mr-2" />
          Configurações Financeiras
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Taxa da Plataforma"
            type="number"
            value={businessData?.commissionRate}
            onChange={(e) => handleInputChange('commissionRate', e?.target?.value)}
            placeholder="15"
            description="% cobrado pela plataforma"
            disabled
          />
          
          <Input
            label="Dia do Pagamento"
            type="number"
            value={businessData?.paymentDay}
            onChange={(e) => handleInputChange('paymentDay', e?.target?.value)}
            min="1"
            max="28"
            placeholder="5"
            description="Dia do mês para recebimento"
          />
        </div>
        
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">
            Resumo Financeiro
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Valor Bruto (Mensal)</p>
              <p className="font-semibold text-foreground">
                R$ {businessData?.monthlyPrice}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Taxa da Plataforma</p>
              <p className="font-semibold text-destructive">
                - R$ {(parseFloat(businessData?.monthlyPrice) * parseFloat(businessData?.commissionRate) / 100)?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Valor Líquido</p>
              <p className="font-semibold text-success">
                R$ {(parseFloat(businessData?.monthlyPrice) * (100 - parseFloat(businessData?.commissionRate)) / 100)?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={() => window.location?.reload()}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handleSave}
          loading={isLoading}
          iconName="Save"
          iconPosition="left"
        >
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default BusinessSettingsTab;