import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AssessmentHistoryModal = ({ isOpen, onClose, assessmentHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // Mock assessment history data
  const mockHistory = [
  {
    id: 1,
    clientId: 1,
    clientName: 'Maria Santos',
    clientAvatar: "https://images.unsplash.com/photo-1734991032476-bceab8383a59",
    clientAlt: 'Professional headshot of Maria Santos, a woman with shoulder-length brown hair',
    type: 'Avaliação Completa',
    date: '2024-10-20',
    duration: 90,
    location: 'Consultório',
    status: 'completed',
    measurements: {
      weight: 62.5,
      bodyFat: 18.5,
      muscleMass: 45.2,
      bmi: 23.1
    },
    notes: 'Excelente progresso em relação à última avaliação. Perda de 2kg de gordura corporal.',
    nextAssessment: '2024-11-20'
  },
  {
    id: 2,
    clientId: 2,
    clientName: 'Carlos Silva',
    clientAvatar: "https://images.unsplash.com/photo-1609231443127-7e1e4c672ece",
    clientAlt: 'Professional headshot of Carlos Silva, a man with short dark hair and beard',
    type: 'Composição Corporal',
    date: '2024-10-18',
    duration: 60,
    location: 'Academia',
    status: 'completed',
    measurements: {
      weight: 78.2,
      bodyFat: 12.8,
      muscleMass: 68.5,
      bmi: 24.2
    },
    notes: 'Ganho significativo de massa magra. Mantendo baixo percentual de gordura.',
    nextAssessment: '2024-11-18'
  },
  {
    id: 3,
    clientId: 3,
    clientName: 'Ana Costa',
    clientAvatar: "https://images.unsplash.com/photo-1567898948863-00dce7dd063d",
    clientAlt: 'Professional headshot of Ana Costa, a woman with long blonde hair',
    type: 'Reavaliação',
    date: '2024-10-15',
    duration: 45,
    location: 'Online',
    status: 'completed',
    measurements: {
      weight: 58.5,
      bodyFat: 25.2,
      muscleMass: 38.8,
      bmi: 22.9
    },
    notes: 'Evolução gradual e consistente. Ajustes no plano de treinos recomendados.',
    nextAssessment: '2024-12-15'
  },
  {
    id: 4,
    clientId: 1,
    clientName: 'Maria Santos',
    clientAvatar: "https://images.unsplash.com/photo-1734991032476-bceab8383a59",
    clientAlt: 'Professional headshot of Maria Santos, a woman with shoulder-length brown hair',
    type: 'Medidas Corporais',
    date: '2024-09-20',
    duration: 30,
    location: 'Consultório',
    status: 'completed',
    measurements: {
      weight: 64.8,
      bodyFat: 21.2,
      muscleMass: 43.1,
      bmi: 23.8
    },
    notes: 'Início do programa de redução de gordura corporal. Metas estabelecidas.',
    nextAssessment: '2024-10-20'
  }];


  const assessmentTypes = [
  { value: 'all', label: 'Todos os Tipos' },
  { value: 'Avaliação Completa', label: 'Avaliação Completa' },
  { value: 'Composição Corporal', label: 'Composição Corporal' },
  { value: 'Reavaliação', label: 'Reavaliação' },
  { value: 'Medidas Corporais', label: 'Medidas Corporais' },
  { value: 'Fotos de Progresso', label: 'Fotos de Progresso' }];


  const periods = [
  { value: 'all', label: 'Todo o Período' },
  { value: 'last_week', label: 'Última Semana' },
  { value: 'last_month', label: 'Último Mês' },
  { value: 'last_3_months', label: 'Últimos 3 Meses' },
  { value: 'last_6_months', label: 'Últimos 6 Meses' },
  { value: 'last_year', label: 'Último Ano' }];


  const sortOptions = [
  { value: 'date_desc', label: 'Data (Mais Recente)' },
  { value: 'date_asc', label: 'Data (Mais Antigo)' },
  { value: 'client_name', label: 'Nome do Cliente' },
  { value: 'type', label: 'Tipo de Avaliação' }];


  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'scheduled':
        return 'Agendada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconhecido';
    }
  };

  const filterAndSortHistory = () => {
    let filtered = mockHistory;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered?.filter((assessment) =>
      assessment?.clientName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      assessment?.type?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      assessment?.notes?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }

    // Filter by client
    if (filterClient !== 'all') {
      filtered = filtered?.filter((assessment) => assessment?.clientId?.toString() === filterClient);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered?.filter((assessment) => assessment?.type === filterType);
    }

    // Filter by period
    if (filterPeriod !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filterPeriod) {
        case 'last_week':
          filterDate?.setDate(now?.getDate() - 7);
          break;
        case 'last_month':
          filterDate?.setMonth(now?.getMonth() - 1);
          break;
        case 'last_3_months':
          filterDate?.setMonth(now?.getMonth() - 3);
          break;
        case 'last_6_months':
          filterDate?.setMonth(now?.getMonth() - 6);
          break;
        case 'last_year':
          filterDate?.setFullYear(now?.getFullYear() - 1);
          break;
      }

      filtered = filtered?.filter((assessment) => new Date(assessment?.date) >= filterDate);
    }

    // Sort
    switch (sortBy) {
      case 'date_desc':
        filtered?.sort((a, b) => new Date(b?.date) - new Date(a?.date));
        break;
      case 'date_asc':
        filtered?.sort((a, b) => new Date(a?.date) - new Date(b?.date));
        break;
      case 'client_name':
        filtered?.sort((a, b) => a?.clientName?.localeCompare(b?.clientName));
        break;
      case 'type':
        filtered?.sort((a, b) => a?.type?.localeCompare(b?.type));
        break;
    }

    return filtered;
  };

  const filteredHistory = filterAndSortHistory();
  const uniqueClients = [...new Set(mockHistory?.map((h) => ({ id: h?.clientId, name: h?.clientName })))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Icon name="History" size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Histórico de Avaliações
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visualize todas as avaliações realizadas
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={onClose}
              iconName="X" />

          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Buscar avaliações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              iconName="Search" />

            
            <Select
              value={filterClient}
              onChange={setFilterClient}
              options={[
              { value: 'all', label: 'Todos os Clientes' },
              ...uniqueClients?.map((client) => ({
                value: client?.id?.toString(),
                label: client?.name
              }))]
              } />

            
            <Select
              value={filterType}
              onChange={setFilterType}
              options={assessmentTypes} />

            
            <Select
              value={filterPeriod}
              onChange={setFilterPeriod}
              options={periods} />

            
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions} />

          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredHistory?.length === 0 ?
            <div className="text-center py-12">
                <Icon name="FileSearch" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
              </div> :

            filteredHistory?.map((assessment) =>
            <div
              key={assessment?.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">

                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        <img
                      src={assessment?.clientAvatar}
                      alt={assessment?.clientAlt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }} />

                        <div className="w-full h-full bg-muted flex items-center justify-center" style={{ display: 'none' }}>
                          <Icon name="User" size={24} className="text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {assessment?.clientName}
                          </h4>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="font-medium text-foreground">
                            {assessment?.type}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(assessment?.status)}`}>
                            {getStatusLabel(assessment?.status)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center space-x-1">
                            <Icon name="Calendar" size={16} />
                            <span>{new Date(assessment?.date)?.toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="Clock" size={16} />
                            <span>{assessment?.duration} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="MapPin" size={16} />
                            <span>{assessment?.location}</span>
                          </div>
                        </div>
                        
                        {/* Measurements Summary */}
                        <div className="grid grid-cols-4 gap-4 mb-3 p-3 bg-muted/30 rounded-lg">
                          <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">
                              {assessment?.measurements?.weight} kg
                            </p>
                            <p className="text-xs text-muted-foreground">Peso</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">
                              {assessment?.measurements?.bodyFat}%
                            </p>
                            <p className="text-xs text-muted-foreground">Gordura</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">
                              {assessment?.measurements?.muscleMass} kg
                            </p>
                            <p className="text-xs text-muted-foreground">Massa Magra</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">
                              {assessment?.measurements?.bmi}
                            </p>
                            <p className="text-xs text-muted-foreground">IMC</p>
                          </div>
                        </div>
                        
                        {assessment?.notes &&
                    <div className="mb-3">
                            <p className="text-sm text-muted-foreground">
                              <strong>Observações:</strong> {assessment?.notes}
                            </p>
                          </div>
                    }
                        
                        {assessment?.nextAssessment &&
                    <div className="flex items-center space-x-1 text-sm text-primary">
                            <Icon name="ArrowRight" size={16} />
                            <span>
                              Próxima avaliação: {new Date(assessment?.nextAssessment)?.toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                    }
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                    variant="outline"
                    size="sm"
                    iconName="Eye">

                        Detalhes
                      </Button>
                      
                      <Button
                    variant="ghost"
                    size="sm"
                    iconName="Download">

                        Relatório
                      </Button>
                    </div>
                  </div>
                </div>
            )
            }
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredHistory?.length} de {mockHistory?.length} avaliações
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" iconName="Download">
                Exportar CSV
              </Button>
              
              <Button variant="outline" iconName="FileText">
                Relatório Geral
              </Button>
              
              <Button onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default AssessmentHistoryModal;