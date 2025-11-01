import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ProfileVisibilitySettings = ({ className = "" }) => {
  const [visibilitySettings, setVisibilitySettings] = useState({
    profilePublic: true,
    showInDirectory: true,
    allowClientSearch: true,
    showPricing: true,
    showTestimonials: true,
    showPortfolio: true,
    showSocialMedia: true,
    showAvailability: true,
    allowDirectBooking: false,
    showContactInfo: true,
    requireApproval: true
  });

  const [isLoading, setIsLoading] = useState(false);

  const visibilityOptions = [
    {
      key: 'profilePublic',
      label: 'Perfil Público',
      description: 'Seu perfil será visível para todos os usuários da plataforma',
      icon: 'Globe',
      category: 'general'
    },
    {
      key: 'showInDirectory',
      label: 'Aparecer no Diretório',
      description: 'Seu perfil aparecerá nas buscas de personal trainers',
      icon: 'Search',
      category: 'general'
    },
    {
      key: 'allowClientSearch',
      label: 'Permitir Busca por Clientes',
      description: 'Clientes podem encontrar você através de filtros de busca',
      icon: 'Users',
      category: 'general'
    },
    {
      key: 'showPricing',
      label: 'Mostrar Preços',
      description: 'Exibir tabela de preços no perfil público',
      icon: 'DollarSign',
      category: 'business'
    },
    {
      key: 'showTestimonials',
      label: 'Exibir Depoimentos',
      description: 'Mostrar avaliações e comentários de clientes',
      icon: 'MessageSquare',
      category: 'business'
    },
    {
      key: 'showPortfolio',
      label: 'Mostrar Portfólio',
      description: 'Exibir transformações e conquistas profissionais',
      icon: 'Image',
      category: 'business'
    },
    {
      key: 'showSocialMedia',
      label: 'Exibir Redes Sociais',
      description: 'Mostrar links para suas redes sociais',
      icon: 'Share2',
      category: 'contact'
    },
    {
      key: 'showAvailability',
      label: 'Mostrar Disponibilidade',
      description: 'Exibir horários e dias de atendimento',
      icon: 'Calendar',
      category: 'contact'
    },
    {
      key: 'allowDirectBooking',
      label: 'Permitir Agendamento Direto',
      description: 'Clientes podem agendar sessões diretamente pelo perfil',
      icon: 'Clock',
      category: 'contact'
    },
    {
      key: 'showContactInfo',
      label: 'Mostrar Informações de Contato',
      description: 'Exibir telefone e email para contato direto',
      icon: 'Phone',
      category: 'contact'
    },
    {
      key: 'requireApproval',
      label: 'Exigir Aprovação para Novos Clientes',
      description: 'Você deve aprovar solicitações de novos clientes',
      icon: 'Shield',
      category: 'security'
    }
  ];

  const categories = {
    general: 'Configurações Gerais',
    business: 'Informações de Negócio',
    contact: 'Contato e Agendamento',
    security: 'Segurança e Privacidade'
  };

  const handleSettingChange = (key, value) => {
    setVisibilitySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Configurações de visibilidade salvas:', visibilitySettings);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVisibilityStatus = () => {
    const publicSettings = ['profilePublic', 'showInDirectory', 'allowClientSearch'];
    const activePublicSettings = publicSettings?.filter(key => visibilitySettings?.[key])?.length;
    
    if (activePublicSettings === 0) return { status: 'private', label: 'Perfil Privado', color: 'text-destructive' };
    if (activePublicSettings < 3) return { status: 'limited', label: 'Visibilidade Limitada', color: 'text-warning' };
    return { status: 'public', label: 'Perfil Público', color: 'text-success' };
  };

  const visibilityStatus = getVisibilityStatus();

  const groupedOptions = visibilityOptions?.reduce((acc, option) => {
    if (!acc?.[option?.category]) acc[option.category] = [];
    acc?.[option?.category]?.push(option);
    return acc;
  }, {});

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Configurações de Visibilidade
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Controle como seu perfil aparece para outros usuários
        </p>
      </div>
      {/* Status Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon 
                name={visibilityStatus?.status === 'public' ? 'Globe' : visibilityStatus?.status === 'limited' ? 'Eye' : 'EyeOff'} 
                size={24} 
                className="text-primary"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Status do Perfil
              </h3>
              <p className={`text-sm font-medium ${visibilityStatus?.color}`}>
                {visibilityStatus?.label}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            iconName="ExternalLink"
            iconPosition="left"
          >
            Visualizar Perfil Público
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">
            Resumo da Visibilidade
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Configurações Ativas</p>
              <p className="font-semibold text-foreground">
                {Object.values(visibilitySettings)?.filter(Boolean)?.length} de {Object.keys(visibilitySettings)?.length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Visibilidade Pública</p>
              <p className={`font-semibold ${visibilitySettings?.profilePublic ? 'text-success' : 'text-destructive'}`}>
                {visibilitySettings?.profilePublic ? 'Ativada' : 'Desativada'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Busca no Diretório</p>
              <p className={`font-semibold ${visibilitySettings?.showInDirectory ? 'text-success' : 'text-destructive'}`}>
                {visibilitySettings?.showInDirectory ? 'Ativada' : 'Desativada'}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Visibility Settings by Category */}
      <div className="space-y-6">
        {Object.entries(categories)?.map(([categoryKey, categoryLabel]) => (
          <div key={categoryKey} className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {categoryLabel}
            </h3>
            
            <div className="space-y-4">
              {groupedOptions?.[categoryKey]?.map((option) => (
                <div key={option?.key} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={option?.icon} size={18} className="text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">
                          {option?.label}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {option?.description}
                        </p>
                      </div>
                      
                      <Checkbox
                        checked={visibilitySettings?.[option?.key]}
                        onChange={(e) => handleSettingChange(option?.key, e?.target?.checked)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Privacy Notice */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
          <Icon name="AlertTriangle" size={20} className="mr-2 text-warning" />
          Importante sobre Privacidade
        </h3>
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            • Mesmo com perfil público, suas informações pessoais (CPF, endereço completo) nunca são compartilhadas
          </p>
          <p>
            • Clientes só têm acesso às informações que você escolher exibir
          </p>
          <p>
            • Você pode alterar essas configurações a qualquer momento
          </p>
          <p>
            • Desativar a visibilidade pública não afeta clientes já cadastrados
          </p>
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

export default ProfileVisibilitySettings;