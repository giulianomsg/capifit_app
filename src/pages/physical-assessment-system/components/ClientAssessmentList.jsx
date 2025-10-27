import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClientAssessmentList = ({ clients, onClientSelect, detailed = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluído';
      default:
        return 'Desconhecido';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('pt-BR');
  };

  if (!clients || clients?.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum cliente encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients?.map((client) => (
        <div
          key={client?.id}
          className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
          onClick={() => onClientSelect?.(client)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={client?.avatar}
                  alt={client?.alt || `Foto de perfil de ${client?.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-muted flex items-center justify-center" style={{ display: 'none' }}>
                  <Icon name="User" size={24} className="text-muted-foreground" />
                </div>
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-semibold text-foreground truncate">
                    {client?.name}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(client?.status)}`}>
                    {getStatusLabel(client?.status)}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground mb-1">{client?.email}</p>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>Última: {formatDate(client?.lastAssessment)}</span>
                  <span>Próxima: {formatDate(client?.nextAssessment)}</span>
                </div>
                
                {detailed && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Peso:</span>
                      <span className="text-foreground font-medium ml-1">{client?.weight} kg</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">IMC:</span>
                      <span className="text-foreground font-medium ml-1">{client?.bmi}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">% Gordura:</span>
                      <span className="text-foreground font-medium ml-1">{client?.bodyFat}%</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Massa Magra:</span>
                      <span className="text-foreground font-medium ml-1">{client?.muscleMass} kg</span>
                    </div>
                  </div>
                )}
                
                {detailed && client?.goals && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {client?.goals?.slice(0, 3)?.map((goal, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e?.stopPropagation();
                  // Handle scheduling
                }}
              >
                <Icon name="Calendar" size={14} className="mr-1" />
                Agendar
              </Button>
              
              {detailed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e?.stopPropagation();
                    // Handle viewing history
                  }}
                >
                  <Icon name="History" size={14} className="mr-1" />
                  Histórico
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientAssessmentList;