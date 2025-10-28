import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClientContextSidebar = ({ contact }) => {
  const [activeTab, setActiveTab] = useState('info');

  // Mock client data
  const clientData = {
    personalInfo: {
      age: 28,
      weight: '74.2 kg',
      height: '1.68 m',
      goal: 'Emagrecimento e tonificação',
      startDate: '2023-11-15',
      planType: 'Premium'
    },
    currentPlan: {
      name: 'Plano de Emagrecimento Personalizado',
      duration: '12 semanas',
      progress: 65,
      nextSession: 'Hoje, 16:00',
      location: 'Academia Central'
    },
    recentActivity: [
      {
        id: 1,
        type: 'workout',
        title: 'Treino de Pernas concluído',
        time: '2 horas atrás',
        icon: 'Dumbbell',
        color: 'text-green-600'
      },
      {
        id: 2,
        type: 'nutrition',
        title: 'Dieta atualizada',
        time: '1 dia atrás',
        icon: 'Apple',
        color: 'text-orange-600'
      },
      {
        id: 3,
        type: 'assessment',
        title: 'Avaliação física agendada',
        time: '2 dias atrás',
        icon: 'Activity',
        color: 'text-blue-600'
      }
    ],
    stats: [
      { label: 'Treinos Completados', value: '23/35', icon: 'CheckCircle' },
      { label: 'Peso Perdido', value: '-4.3 kg', icon: 'TrendingDown' },
      { label: 'Consistência', value: '87%', icon: 'Target' }
    ],
    documents: [
      { id: 1, name: 'Ficha de Anamnese', type: 'pdf', date: '15/11/2023' },
      { id: 2, name: 'Plano Nutricional', type: 'pdf', date: '20/01/2024' },
      { id: 3, name: 'Avaliação Inicial', type: 'pdf', date: '15/11/2023' }
    ]
  };

  const tabs = [
    { id: 'info', label: 'Informações', icon: 'User' },
    { id: 'activity', label: 'Atividade', icon: 'Activity' },
    { id: 'stats', label: 'Estatísticas', icon: 'BarChart3' },
    { id: 'files', label: 'Arquivos', icon: 'FileText' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-3">Informações Pessoais</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(clientData?.personalInfo)?.map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">
                      {key === 'age' ? 'Idade' :
                       key === 'weight' ? 'Peso' :
                       key === 'height' ? 'Altura' :
                       key === 'goal' ? 'Objetivo' :
                       key === 'startDate' ? 'Início' :
                       key === 'planType' ? 'Plano' : key}:
                    </span>
                    <span className="text-foreground font-medium">
                      {key === 'startDate' ? new Date(value)?.toLocaleDateString('pt-BR') : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Plano Atual</h4>
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <h5 className="font-medium text-foreground text-sm">{clientData?.currentPlan?.name}</h5>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Duração: {clientData?.currentPlan?.duration}</p>
                  <p>Progresso: {clientData?.currentPlan?.progress}%</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${clientData?.currentPlan?.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Próxima Sessão</h4>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Icon name="Clock" size={16} className="text-primary" />
                  <span className="text-foreground font-medium">
                    {clientData?.currentPlan?.nextSession}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                  <Icon name="MapPin" size={14} />
                  <span>{clientData?.currentPlan?.location}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Atividade Recente</h4>
            {clientData?.recentActivity?.map((activity) => (
              <div key={activity?.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                <Icon 
                  name={activity?.icon} 
                  size={16} 
                  className={activity?.color}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity?.title}</p>
                  <p className="text-xs text-muted-foreground">{activity?.time}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Estatísticas</h4>
            {clientData?.stats?.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name={stat?.icon} size={16} className="text-primary" />
                  <span className="text-sm text-foreground">{stat?.label}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{stat?.value}</span>
              </div>
            ))}
          </div>
        );

      case 'files':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Documentos</h4>
              <Button variant="ghost" size="sm" iconName="Plus" />
            </div>
            {clientData?.documents?.map((doc) => (
              <div key={doc?.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Icon name="FileText" size={16} className="text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{doc?.name}</p>
                  <p className="text-xs text-muted-foreground">{doc?.date}</p>
                </div>
                <Icon name="Download" size={14} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Client Info Header */}
      <div className="p-4 border-b border-border">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
            {contact?.avatar ? (
              <img 
                src={contact?.avatar} 
                alt={contact?.alt}
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon name="User" size={32} className="text-muted-foreground" />
            )}
          </div>
          <h3 className="font-semibold text-foreground">{contact?.name}</h3>
          <p className="text-sm text-muted-foreground">{contact?.email}</p>
          
          <div className="flex items-center justify-center space-x-1 mt-2">
            <Icon name="Crown" size={14} className="text-yellow-600" />
            <span className="text-xs text-muted-foreground">{clientData?.personalInfo?.planType}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="grid grid-cols-2 gap-0">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`
                flex items-center justify-center space-x-1 py-3 px-2 text-xs font-medium border-b-2 transition-colors
                ${activeTab === tab?.id
                  ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon name={tab?.icon} size={14} />
              <span>{tab?.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderTabContent()}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          iconName="Calendar"
          iconPosition="left"
        >
          Agendar Sessão
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          iconName="FileText"
          iconPosition="left"
        >
          Ver Perfil Completo
        </Button>
      </div>
    </div>
  );
};

export default ClientContextSidebar;