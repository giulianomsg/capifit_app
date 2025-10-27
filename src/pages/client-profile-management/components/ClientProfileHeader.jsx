import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ClientProfileHeader = ({ 
  client, 
  onCreateWorkout, 
  onSendMessage, 
  onScheduleAssessment 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return 'text-green-600 bg-green-100';
      case 'Inativo': return 'text-red-600 bg-red-100';
      case 'Pausado': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'Premium': return 'text-purple-600 bg-purple-100';
      case 'Pro': return 'text-blue-600 bg-blue-100';
      case 'Básico': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateDuration = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} dias`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} ${years === 1 ? 'ano' : 'anos'}${remainingMonths > 0 ? ` e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}` : ''}`;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Client Photo and Basic Info */}
        <div className="flex items-start space-x-4">
          <img
            src={client?.foto}
            alt={client?.alt}
            className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-primary/20"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {client?.nome}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client?.status)}`}>
                {client?.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={16} />
                <span>{client?.idade} anos</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Mail" size={16} />
                <span>{client?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Phone" size={16} />
                <span>{client?.telefone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="MapPin" size={16} />
                <span>{client?.endereco}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="lg:text-right space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between lg:justify-end space-x-2">
                <span className="text-sm text-muted-foreground">Plano:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getPlanColor(client?.plano)}`}>
                  {client?.plano}
                </span>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between lg:justify-end space-x-2">
                <span className="text-sm text-muted-foreground">Cliente há:</span>
                <span className="text-sm font-medium text-foreground">
                  {calculateDuration(client?.dataInicio)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button
              size="sm"
              onClick={onCreateWorkout}
              iconName="Plus"
              iconPosition="left"
            >
              Novo Treino
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSendMessage}
              iconName="MessageSquare"
              iconPosition="left"
            >
              Mensagem
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onScheduleAssessment}
              iconName="FileText"
              iconPosition="left"
            >
              Avaliação
            </Button>
          </div>
        </div>
      </div>

      {/* Objectives */}
      {client?.objetivos?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Objetivos Principais:</h3>
          <div className="flex flex-wrap gap-2">
            {client?.objetivos?.map((objetivo, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {objetivo}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contact Quick Access */}
      {client?.emergencyContact && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <Icon name="Phone" size={16} className="text-red-600" />
            <span className="text-red-800">
              <strong>Contato de Emergência:</strong> {client?.emergencyContact?.nome} ({client?.emergencyContact?.parentesco}) - {client?.emergencyContact?.telefone}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfileHeader;