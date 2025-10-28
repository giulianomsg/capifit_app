import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SocialMediaTab = ({ className = "" }) => {
  const [socialData, setSocialData] = useState({
    instagram: '@joaosilva_personal',
    youtube: 'https://youtube.com/@joaosilva',
    tiktok: '@joaosilva_fit',
    facebook: 'https://facebook.com/joaosilva.personal',
    linkedin: 'https://linkedin.com/in/joaosilva',
    website: 'https://joaosilva-personal.com.br',
    whatsapp: '5511999999999'
  });

  const [isLoading, setIsLoading] = useState(false);

  const socialPlatforms = [
    {
      key: 'instagram',
      label: 'Instagram',
      icon: 'Instagram',
      placeholder: '@seu_usuario',
      description: 'Seu perfil do Instagram para divulgação',
      color: 'text-pink-500'
    },
    {
      key: 'youtube',
      label: 'YouTube',
      icon: 'Youtube',
      placeholder: 'https://youtube.com/@seu_canal',
      description: 'Canal do YouTube com conteúdo fitness',
      color: 'text-red-500'
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      icon: 'Music',
      placeholder: '@seu_usuario',
      description: 'Perfil do TikTok para vídeos curtos',
      color: 'text-black'
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: 'Facebook',
      placeholder: 'https://facebook.com/sua_pagina',
      description: 'Página profissional no Facebook',
      color: 'text-blue-600'
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: 'Linkedin',
      placeholder: 'https://linkedin.com/in/seu_perfil',
      description: 'Perfil profissional no LinkedIn',
      color: 'text-blue-700'
    },
    {
      key: 'website',
      label: 'Website Pessoal',
      icon: 'Globe',
      placeholder: 'https://seu-site.com.br',
      description: 'Seu site ou blog profissional',
      color: 'text-green-600'
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp Business',
      icon: 'MessageCircle',
      placeholder: '5511999999999',
      description: 'Número do WhatsApp para contato (com código do país)',
      color: 'text-green-500'
    }
  ];

  const handleInputChange = (field, value) => {
    setSocialData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Redes sociais salvas:', socialData);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateUrl = (url, platform) => {
    if (!url) return true;
    
    const patterns = {
      youtube: /^https:\/\/(www\.)?(youtube\.com|youtu\.be)/,
      facebook: /^https:\/\/(www\.)?facebook\.com/,
      linkedin: /^https:\/\/(www\.)?linkedin\.com/,
      website: /^https?:\/\/.+/
    };
    
    return patterns?.[platform] ? patterns?.[platform]?.test(url) : true;
  };

  const getPreviewUrl = (platform, value) => {
    if (!value) return null;
    
    switch (platform) {
      case 'instagram':
        return `https://instagram.com/${value?.replace('@', '')}`;
      case 'tiktok':
        return `https://tiktok.com/@${value?.replace('@', '')}`;
      case 'whatsapp':
        return `https://wa.me/${value}`;
      default:
        return value?.startsWith('http') ? value : `https://${value}`;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Redes Sociais e Contato
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure suas redes sociais para aumentar sua visibilidade
        </p>
      </div>
      {/* Social Media Links */}
      <div className="space-y-6">
        {socialPlatforms?.map((platform) => (
          <div key={platform?.key} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Icon 
                  name={platform?.icon} 
                  size={24} 
                  className={platform?.color}
                />
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {platform?.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {platform?.description}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={socialData?.[platform?.key]}
                      onChange={(e) => handleInputChange(platform?.key, e?.target?.value)}
                      placeholder={platform?.placeholder}
                      error={
                        socialData?.[platform?.key] && !validateUrl(socialData?.[platform?.key], platform?.key)
                          ? 'URL inválida' :''
                      }
                    />
                  </div>
                  
                  {socialData?.[platform?.key] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getPreviewUrl(platform?.key, socialData?.[platform?.key]), '_blank')}
                      iconName="ExternalLink"
                      iconPosition="left"
                    >
                      Visualizar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Preview Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Pré-visualização do Perfil Público
        </h3>
        
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <Icon name="User" size={24} color="white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground">João Silva</h4>
              <p className="text-sm text-muted-foreground">Personal Trainer</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {socialPlatforms?.filter(platform => socialData?.[platform?.key])?.map(platform => (
                <Button
                  key={platform?.key}
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getPreviewUrl(platform?.key, socialData?.[platform?.key]), '_blank')}
                  iconName={platform?.icon}
                  iconPosition="left"
                >
                  {platform?.label}
                </Button>
              ))}
          </div>
        </div>
      </div>
      {/* Tips Section */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
          <Icon name="Lightbulb" size={20} className="mr-2 text-accent" />
          Dicas para Redes Sociais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-foreground mb-2">Instagram</h4>
            <ul className="text-muted-foreground space-y-1">
              <li>• Poste treinos e transformações</li>
              <li>• Use stories para engajamento</li>
              <li>• Hashtags relevantes (#personaltrainer)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-2">YouTube</h4>
            <ul className="text-muted-foreground space-y-1">
              <li>• Crie tutoriais de exercícios</li>
              <li>• Compartilhe dicas de nutrição</li>
              <li>• Mostre resultados dos clientes</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-2">WhatsApp</h4>
            <ul className="text-muted-foreground space-y-1">
              <li>• Configure mensagem automática</li>
              <li>• Use WhatsApp Business</li>
              <li>• Defina horários de atendimento</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-2">Website</h4>
            <ul className="text-muted-foreground space-y-1">
              <li>• Portfólio de transformações</li>
              <li>• Depoimentos de clientes</li>
              <li>• Informações de contato</li>
            </ul>
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
          Salvar Redes Sociais
        </Button>
      </div>
    </div>
  );
};

export default SocialMediaTab;