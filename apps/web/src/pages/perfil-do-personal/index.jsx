import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';

// Import all components
import ProfilePhotoUpload from './components/ProfilePhotoUpload';
import PersonalInfoForm from './components/PersonalInfoForm';
import CredentialsTab from './components/CredentialsTab';
import BusinessSettingsTab from './components/BusinessSettingsTab';
import SocialMediaTab from './components/SocialMediaTab';
import PortfolioTab from './components/PortfolioTab';
import ProfileVisibilitySettings from './components/ProfileVisibilitySettings';

const PerfilDoPersonal = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personal-info');
  const [profilePhoto, setProfilePhoto] = useState(null);

  const tabs = [
    {
      id: 'personal-info',
      label: 'Informações Pessoais',
      icon: 'User',
      description: 'Dados pessoais e profissionais'
    },
    {
      id: 'credentials',
      label: 'Credenciais',
      icon: 'Award',
      description: 'Certificações e qualificações'
    },
    {
      id: 'business',
      label: 'Configurações de Negócio',
      icon: 'Briefcase',
      description: 'Preços, serviços e disponibilidade'
    },
    {
      id: 'social-media',
      label: 'Redes Sociais',
      icon: 'Share2',
      description: 'Links e contatos profissionais'
    },
    {
      id: 'portfolio',
      label: 'Portfólio',
      icon: 'Image',
      description: 'Transformações e depoimentos'
    },
    {
      id: 'visibility',
      label: 'Visibilidade',
      icon: 'Eye',
      description: 'Configurações de privacidade'
    }
  ];

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePhotoChange = (file) => {
    setProfilePhoto(file);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal-info':
        return (
          <div className="space-y-8">
            <ProfilePhotoUpload
              currentPhoto={profilePhoto}
              onPhotoChange={handlePhotoChange}
            />
            <PersonalInfoForm />
          </div>
        );
      case 'credentials':
        return <CredentialsTab />;
      case 'business':
        return <BusinessSettingsTab />;
      case 'social-media':
        return <SocialMediaTab />;
      case 'portfolio':
        return <PortfolioTab />;
      case 'visibility':
        return <ProfileVisibilitySettings />;
      default:
        return <PersonalInfoForm />;
    }
  };

  const getTabProgress = () => {
    // Mock progress calculation based on completed sections
    const progress = {
      'personal-info': 85,
      'credentials': 60,
      'business': 75,
      'social-media': 40,
      'portfolio': 30,
      'visibility': 90
    };
    return progress?.[activeTab] || 0;
  };

  return (
    <>
      <Helmet>
        <title>Perfil do Personal - FitTrainer Pro</title>
        <meta name="description" content="Gerencie seu perfil profissional, credenciais e configurações de negócio no FitTrainer Pro" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header onMenuToggle={handleSidebarToggle} isMenuOpen={isSidebarOpen} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="lg:ml-64 pt-16">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                    Perfil Profissional
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Gerencie suas informações profissionais e configurações de negócio
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    iconName="ExternalLink"
                    iconPosition="left"
                  >
                    Ver Perfil Público
                  </Button>
                  
                  <Button
                    iconName="Save"
                    iconPosition="left"
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Completude do Perfil
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getTabProgress()}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getTabProgress()}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Tab Navigation */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-4 sticky top-24">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Seções do Perfil
                  </h2>
                  
                  <nav className="space-y-2">
                    {tabs?.map((tab) => (
                      <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id)}
                        className={`
                          w-full flex items-start p-3 rounded-lg text-left transition-colors
                          ${activeTab === tab?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-foreground'
                          }
                        `}
                      >
                        <Icon
                          name={tab?.icon}
                          size={20}
                          className={`mr-3 mt-0.5 flex-shrink-0 ${
                            activeTab === tab?.id ? 'text-primary-foreground' : 'text-muted-foreground'
                          }`}
                        />
                        <div>
                          <p className={`text-sm font-medium ${
                            activeTab === tab?.id ? 'text-primary-foreground' : 'text-foreground'
                          }`}>
                            {tab?.label}
                          </p>
                          <p className={`text-xs mt-1 ${
                            activeTab === tab?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}>
                            {tab?.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </nav>

                  {/* Quick Stats */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-foreground mb-3">
                      Estatísticas Rápidas
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Perfil Público</span>
                        <span className="text-success font-medium">Ativo</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Credenciais</span>
                        <span className="text-foreground font-medium">3 ativas</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Portfólio</span>
                        <span className="text-foreground font-medium">5 itens</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Última atualização</span>
                        <span className="text-muted-foreground">Hoje</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="lg:col-span-3">
                <div className="bg-card border border-border rounded-lg p-6">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PerfilDoPersonal;