import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('capifit_user_logged_in');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Mock data for assessment stats
  const assessmentStats = [
  {
    title: 'Avaliações Pendentes',
    value: '8',
    subtitle: '3 para hoje',
    icon: 'Clock',
    color: 'bg-amber-500',
    trend: { type: 'up', value: '+2' },
    actionLabel: 'Agendar nova',
    onActionClick: () => setShowScheduler(true)
  },
  {
    title: 'Concluídas Este Mês',
    value: '32',
    subtitle: 'Meta: 40',
    icon: 'CheckCircle',
    color: 'bg-green-500',
    trend: { type: 'up', value: '+18%' },
    actionLabel: 'Ver relatório',
    onActionClick: () => {}
  },
  {
    title: 'Clientes Avaliados',
    value: '24',
    subtitle: 'De 28 totais',
    icon: 'Users',
    color: 'bg-blue-500',
    trend: { type: 'up', value: '86%' },
    actionLabel: 'Ver todos',
    onActionClick: () => setActiveTab('clients')
  },
  {
    title: 'Exames Pendentes',
    value: '5',
    subtitle: '2 vencidos',
    icon: 'FileText',
    color: 'bg-red-500',
    trend: { type: 'down', value: '-1' },
    actionLabel: 'Revisar',
    onActionClick: () => setActiveTab('exams')
  }];


  // Mock client data for assessments
  const clientsData = [
  {
    id: 1,
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 99999-0001',
    avatar: "https://images.unsplash.com/photo-1734991032476-bceab8383a59",
    alt: 'Professional headshot of Maria Santos, a woman with shoulder-length brown hair',
    lastAssessment: '2024-10-15',
    nextAssessment: '2024-10-28',
    status: 'active',
    bodyFat: 18.5,
    muscleMass: 45.2,
    weight: 62.5,
    height: 165,
    bmi: 23.1,
    goals: ['Perda de peso', 'Tonificação'],
    measurements: {
      chest: 85,
      waist: 68,
      hip: 92,
      bicep: 28,
      thigh: 52
    },
    progress: {
      weight: [65.0, 64.2, 63.8, 63.1, 62.5],
      bodyFat: [22.3, 21.1, 20.2, 19.4, 18.5],
      muscleMass: [42.8, 43.5, 44.1, 44.8, 45.2]
    }
  },
  {
    id: 2,
    name: 'Carlos Silva',
    email: 'carlos.silva@email.com',
    phone: '(11) 99999-0002',
    avatar: "https://images.unsplash.com/photo-1609231443127-7e1e4c672ece",
    alt: 'Professional headshot of Carlos Silva, a man with short dark hair and beard',
    lastAssessment: '2024-10-20',
    nextAssessment: '2024-11-05',
    status: 'active',
    bodyFat: 12.8,
    muscleMass: 68.5,
    weight: 78.2,
    height: 180,
    bmi: 24.2,
    goals: ['Ganho de massa', 'Definição'],
    measurements: {
      chest: 102,
      waist: 82,
      hip: 95,
      bicep: 38,
      thigh: 58
    },
    progress: {
      weight: [75.5, 76.2, 76.8, 77.5, 78.2],
      bodyFat: [15.2, 14.5, 13.8, 13.2, 12.8],
      muscleMass: [65.2, 66.1, 66.9, 67.7, 68.5]
    }
  },
  {
    id: 3,
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 99999-0003',
    avatar: "https://images.unsplash.com/photo-1567898948863-00dce7dd063d",
    alt: 'Professional headshot of Ana Costa, a woman with long blonde hair',
    lastAssessment: '2024-09-28',
    nextAssessment: '2024-10-28',
    status: 'pending',
    bodyFat: 25.2,
    muscleMass: 38.8,
    weight: 58.5,
    height: 160,
    bmi: 22.9,
    goals: ['Condicionamento', 'Saúde geral'],
    measurements: {
      chest: 82,
      waist: 65,
      hip: 88,
      bicep: 25,
      thigh: 48
    },
    progress: {
      weight: [60.2, 59.8, 59.2, 58.9, 58.5],
      bodyFat: [28.1, 27.2, 26.5, 25.8, 25.2],
      muscleMass: [36.5, 37.1, 37.6, 38.2, 38.8]
    }
  }];


  // Mock exam data
  const examData = [
  {
    id: 1,
    clientId: 1,
    clientName: 'Maria Santos',
    type: 'Exames Laboratoriais',
    date: '2024-10-20',
    status: 'completed',
    files: [
    { name: 'hemograma_completo.pdf', size: '2.5 MB', url: '#' },
    { name: 'perfil_lipidico.pdf', size: '1.8 MB', url: '#' }],

    notes: 'Valores dentro da normalidade. Colesterol ligeiramente elevado.'
  },
  {
    id: 2,
    clientId: 2,
    clientName: 'Carlos Silva',
    type: 'DEXA Scan',
    date: '2024-10-18',
    status: 'completed',
    files: [
    { name: 'dexa_scan_resultado.pdf', size: '5.2 MB', url: '#' }],

    notes: 'Excelente densidade óssea. Composição corporal dentro do esperado.'
  },
  {
    id: 3,
    clientId: 3,
    clientName: 'Ana Costa',
    type: 'Teste Ergométrico',
    date: '2024-10-15',
    status: 'pending',
    files: [],
    notes: 'Aguardando resultado do laboratório.'
  }];


  const tabs = [
  { key: 'overview', label: 'Visão Geral', icon: 'BarChart3' },
  { key: 'clients', label: 'Clientes', icon: 'Users' },
  { key: 'measurements', label: 'Medidas Corporais', icon: 'Ruler' },
  { key: 'photos', label: 'Fotos de Progresso', icon: 'Camera' },
  { key: 'exams', label: 'Exames', icon: 'FileText' },
  { key: 'evolution', label: 'Evolução', icon: 'TrendingUp' }];


  const filteredClients = clientsData?.filter((client) => {
    const matchesSearch = client?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    client?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client?.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {assessmentStats?.map((stat, index) =>
              <AssessmentStatsCards key={index} {...stat} />
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Próximas Avaliações</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowScheduler(true)}>
                    Agendar
                  </Button>
                </div>
                <ClientAssessmentList
                  clients={clientsData?.slice(0, 3)}
                  onClientSelect={setSelectedClient} />

              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Evolução Recente</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('evolution')}>

                    Ver Todos
                  </Button>
                </div>
                <EvolutionCharts
                  clients={clientsData}
                  selectedClient={clientsData?.[0]}
                  onClientSelect={setSelectedClient}
                  data={clientsData?.[0]?.progress}
                  compact={true} />

              </div>
            </div>
          </div>);


      case 'clients':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                iconName="Search"
                className="sm:max-w-xs" />

              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                { value: 'all', label: 'Todos os Status' },
                { value: 'active', label: 'Ativo' },
                { value: 'pending', label: 'Pendente' },
                { value: 'completed', label: 'Concluído' }]
                }
                className="sm:max-w-xs" />

            </div>
            <ClientAssessmentList
              clients={filteredClients}
              onClientSelect={setSelectedClient}
              detailed={true} />

          </div>);


      case 'measurements':
        return (
          <BodyMeasurementsPanel
            clients={clientsData}
            selectedClient={selectedClient}
            onClientSelect={setSelectedClient} />);



      case 'photos':
        return (
          <ProgressPhotosGallery
            clients={clientsData}
            selectedClient={selectedClient}
            onClientSelect={setSelectedClient} />);



      case 'exams':
        return (
          <ExamUploadPanel
            examData={examData}
            clients={clientsData} />);



      case 'evolution':
        return (
          <EvolutionCharts
            clients={clientsData}
            selectedClient={selectedClient}
            onClientSelect={setSelectedClient} />);



      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => {}} />
      
      <div className="flex">
        <Sidebar onClose={() => {}} />
        
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🦫</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Sistema de Avaliações Físicas
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Gerencie avaliações, medidas corporais e evolução dos seus clientes
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <Button
                  onClick={() => setShowScheduler(true)}
                  iconName="Plus"
                  iconPosition="left">

                  Nova Avaliação
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowHistoryModal(true)}
                  iconName="History"
                  iconPosition="left">

                  Histórico
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs?.map((tab) =>
                <button
                  key={tab?.key}
                  onClick={() => setActiveTab(tab?.key)}
                  className={`
                      whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab?.key ?
                  'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'}
                    `
                  }>

                    <div className="flex items-center space-x-2">
                      <span>{tab?.label}</span>
                    </div>
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showScheduler &&
      <AssessmentScheduler
        isOpen={showScheduler}
        onClose={() => setShowScheduler(false)}
        clients={clientsData} />

      }

      {showHistoryModal &&
      <AssessmentHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        assessmentHistory={[]} />

      }
    </div>);

};

export default PhysicalAssessmentSystem;