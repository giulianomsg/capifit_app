import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';


// Components
import ClientProfileHeader from './components/ClientProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import PersonalInfo from './components/PersonalInfo';
import ProgressTracking from './components/ProgressTracking';
import WorkoutHistory from './components/WorkoutHistory';
import CommunicationLog from './components/CommunicationLog';
import SubscriptionManagement from './components/SubscriptionManagement';
import GoalSetting from './components/GoalSetting';
import DocumentStorage from './components/DocumentStorage';

const ClientProfileManagement = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personal-info');

  // Mock client data - In real app, this would come from API
  const clientData = {
    id: clientId || '1',
    nome: 'Maria Santos',
    idade: 28,
    email: 'maria.santos@email.com',
    telefone: '(11) 99999-9999',
    endereco: 'São Paulo, SP',
    foto: '/api/placeholder/150/150',
    alt: 'Foto de perfil da cliente Maria Santos, mulher de 28 anos sorrindo',
    objetivos: ['Emagrecimento', 'Fortalecimento muscular', 'Melhoria da qualidade de vida'],
    dataInicio: '2024-01-15',
    status: 'Ativo',
    plano: 'Premium',
    proximaRenovacao: '2024-12-15',
    emergencyContact: {
      nome: 'João Santos',
      telefone: '(11) 98888-8888',
      parentesco: 'Esposo'
    },
    healthInfo: {
      altura: 165,
      peso: 68,
      imc: 25.0,
      restricoesMedicas: ['Problema no joelho direito'],
      medicamentos: ['Anticoncepcional'],
      alergias: ['Látex'],
      cirurgias: ['Apendicectomia (2020)']
    },
    goals: [
      {
        id: 1,
        titulo: 'Perder 5kg',
        tipo: 'Peso',
        valorInicial: 70,
        valorAtual: 68,
        valorMeta: 65,
        prazo: '2024-12-31',
        status: 'Em progresso'
      },
      {
        id: 2,
        titulo: 'Correr 5km',
        tipo: 'Cardio',
        valorInicial: 0,
        valorAtual: 3,
        valorMeta: 5,
        prazo: '2024-11-30',
        status: 'Em progresso'
      }
    ]
  };

  const tabs = [
    {
      id: 'personal-info',
      label: 'Informações Pessoais',
      icon: 'User',
      component: PersonalInfo
    },
    {
      id: 'progress',
      label: 'Progresso',
      icon: 'TrendingUp',
      component: ProgressTracking
    },
    {
      id: 'workouts',
      label: 'Histórico de Treinos',
      icon: 'Dumbbell',
      component: WorkoutHistory
    },
    {
      id: 'communication',
      label: 'Comunicação',
      icon: 'MessageSquare',
      component: CommunicationLog
    },
    {
      id: 'subscription',
      label: 'Assinatura',
      icon: 'CreditCard',
      component: SubscriptionManagement
    },
    {
      id: 'goals',
      label: 'Objetivos',
      icon: 'Target',
      component: GoalSetting
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: 'FileText',
      component: DocumentStorage
    }
  ];

  const handleBackToClients = () => {
    navigate('/gerenciar-alunos');
  };

  const handleCreateWorkout = () => {
    navigate('/criar-treinos', { state: { clientId: clientData?.id, clientName: clientData?.nome } });
  };

  const handleSendMessage = () => {
    navigate('/chat-communication-hub', { 
      state: { 
        clientId: clientData?.id, 
        clientName: clientData?.nome,
        clientEmail: clientData?.email 
      } 
    });
  };

  const handleScheduleAssessment = () => {
    navigate('/physical-assessment-system', { 
      state: { 
        clientId: clientData?.id, 
        clientName: clientData?.nome 
      } 
    });
  };

  const renderTabContent = () => {
    const activeTabData = tabs?.find(tab => tab?.id === activeTab);
    if (!activeTabData?.component) return null;

    const Component = activeTabData?.component;
    return <Component clientData={clientData} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-6">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToClients}
              iconName="ArrowLeft"
              iconPosition="left"
              className="text-muted-foreground hover:text-foreground"
            >
              Voltar para Alunos
            </Button>
          </div>

          {/* Client Profile Header */}
          <ClientProfileHeader 
            client={clientData}
            onCreateWorkout={handleCreateWorkout}
            onSendMessage={handleSendMessage}
            onScheduleAssessment={handleScheduleAssessment}
          />

          {/* Profile Content */}
          <div className="mt-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Tabs Sidebar */}
              <div className="lg:w-64 flex-shrink-0">
                <ProfileTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>

              {/* Tab Content */}
              <div className="flex-1 min-w-0">
                <div className="bg-card rounded-lg border border-border">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientProfileManagement;