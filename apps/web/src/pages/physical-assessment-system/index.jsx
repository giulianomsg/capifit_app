import React, { useState } from 'react';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import AssessmentStatsCards from './components/AssessmentStatsCards';
import ClientAssessmentList from './components/ClientAssessmentList';
import BodyMeasurementsPanel from './components/BodyMeasurementsPanel';
import ProgressPhotosGallery from './components/ProgressPhotosGallery';
import EvolutionCharts from './components/EvolutionCharts';
import ExamUploadPanel from './components/ExamUploadPanel';
import AssessmentScheduler from './components/AssessmentScheduler';
import AssessmentHistoryModal from './components/AssessmentHistoryModal';

const PhysicalAssessmentSystem = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const assessmentStats = [
    {
      title: 'Avaliações Pendentes',
      value: '8',
      subtitle: '3 para hoje',
      icon: 'Clock',
      color: 'bg-amber-500',
      trend: { type: 'up', value: '+2' },
      actionLabel: 'Agendar nova',
      onActionClick: () => setShowScheduler(true),
    },
    {
      title: 'Concluídas Este Mês',
      value: '32',
      subtitle: 'Meta: 40',
      icon: 'CheckCircle',
      color: 'bg-green-500',
      trend: { type: 'up', value: '+18%' },
      actionLabel: 'Ver relatório',
      onActionClick: () => {},
    },
    {
      title: 'Clientes Avaliados',
      value: '24',
      subtitle: 'De 28 totais',
      icon: 'Users',
      color: 'bg-blue-500',
      trend: { type: 'up', value: '86%' },
      actionLabel: 'Ver todos',
      onActionClick: () => setActiveTab('clients'),
    },
    {
      title: 'Exames Pendentes',
      value: '5',
      subtitle: '2 vencidos',
      icon: 'FileText',
      color: 'bg-red-500',
      trend: { type: 'down', value: '-1' },
      actionLabel: 'Revisar',
      onActionClick: () => setActiveTab('exams'),
    },
  ];

  const clientsData = [
    {
      id: '1',
      name: 'Mariana Souza',
      age: 29,
      lastAssessment: '2024-11-18',
      nextAssessment: '2024-12-20',
      status: 'scheduled',
      goals: ['Hipertrofia', 'Definição'],
      trainer: 'João Silva',
      progress: 72,
    },
    {
      id: '2',
      name: 'Lucas Fernandes',
      age: 35,
      lastAssessment: '2024-11-02',
      nextAssessment: '2024-12-02',
      status: 'completed',
      goals: ['Emagrecimento', 'Melhora cardiovascular'],
      trainer: 'João Silva',
      progress: 65,
    },
    {
      id: '3',
      name: 'Ana Clara',
      age: 26,
      lastAssessment: '2024-10-28',
      nextAssessment: '2024-12-01',
      status: 'delayed',
      goals: ['Flexibilidade', 'Força'],
      trainer: 'João Silva',
      progress: 48,
    },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Avaliações Físicas</h1>
          <p className="text-muted-foreground">Gerencie avaliações, exames e registros de evolução dos seus clientes.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button iconName="Plus" onClick={() => setShowScheduler(true)}>
            Agendar avaliação
          </Button>
          <Button variant="outline" iconName="FileText" onClick={() => setShowHistoryModal(true)}>
            Histórico
          </Button>
        </div>
      </header>

      <AssessmentStatsCards stats={assessmentStats} />

      <section className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveTab('overview')}
            >
              Visão geral
            </Button>
            <Button
              variant={activeTab === 'clients' ? 'default' : 'outline'}
              onClick={() => setActiveTab('clients')}
            >
              Clientes
            </Button>
            <Button
              variant={activeTab === 'exams' ? 'default' : 'outline'}
              onClick={() => setActiveTab('exams')}
            >
              Exames
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Buscar por cliente"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              options={[
                { label: 'Todos os status', value: 'all' },
                { label: 'Agendado', value: 'scheduled' },
                { label: 'Concluído', value: 'completed' },
                { label: 'Atrasado', value: 'delayed' },
              ]}
            />
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <BodyMeasurementsPanel />
            <ProgressPhotosGallery />
            <EvolutionCharts />
            <ExamUploadPanel />
          </div>
        )}

        {activeTab === 'clients' && (
          <ClientAssessmentList
            clients={clientsData}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            onSelectClient={setSelectedClient}
          />
        )}
      </section>

      {showScheduler && (
        <AssessmentScheduler
          onClose={() => setShowScheduler(false)}
          onSchedule={() => setShowScheduler(false)}
        />
      )}

      {showHistoryModal && selectedClient && (
        <AssessmentHistoryModal client={selectedClient} onClose={() => setShowHistoryModal(false)} />
      )}
    </div>
  );
};

export default PhysicalAssessmentSystem;
