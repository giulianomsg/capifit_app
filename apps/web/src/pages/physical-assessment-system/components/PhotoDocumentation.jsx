import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PhotoDocumentation = ({ selectedClient }) => {
  const [selectedView, setSelectedView] = useState('front');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock photo data
  const photoSessions = [
    {
      id: 1,
      date: '2024-03-15',
      label: 'Março 2024',
      photos: {
        front: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop',
        side: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=400&fit=crop',
        back: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=300&h=400&fit=crop'
      }
    },
    {
      id: 2,
      date: '2024-01-15',
      label: 'Janeiro 2024',
      photos: {
        front: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=400&fit=crop',
        side: 'https://images.unsplash.com/photo-1594736797933-d0c56d62d3b3?w=300&h=400&fit=crop',
        back: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop'
      }
    },
    {
      id: 3,
      date: '2023-11-15',
      label: 'Novembro 2023 (Inicial)',
      photos: {
        front: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop',
        side: 'https://images.unsplash.com/photo-1594736797933-d0c56d62d3b3?w=300&h=400&fit=crop',
        back: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=400&fit=crop'
      }
    }
  ];

  const viewOptions = [
    { id: 'front', label: 'Frontal', icon: 'User' },
    { id: 'side', label: 'Lateral', icon: 'RotateCcw' },
    { id: 'back', label: 'Costas', icon: 'UserMinus' }
  ];

  if (!selectedClient) {
    return (
      <div className="p-8 text-center">
        <Icon name="Camera" size={48} className="text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Selecione um cliente para gerenciar fotos</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Documentação Fotográfica - {selectedClient?.name}
          </h3>
          <p className="text-muted-foreground">
            Acompanhe a evolução visual do cliente
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            iconName="Download" 
            iconPosition="left"
          >
            Exportar Fotos
          </Button>
          <Button 
            onClick={() => setShowUploadModal(true)}
            iconName="Camera" 
            iconPosition="left"
          >
            Adicionar Fotos
          </Button>
        </div>
      </div>
      {/* View Selector */}
      <div className="flex items-center space-x-2 bg-muted/30 rounded-lg p-1">
        {viewOptions?.map((view) => (
          <button
            key={view?.id}
            onClick={() => setSelectedView(view?.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors
              ${selectedView === view?.id
                ? 'bg-primary text-white' :'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <Icon name={view?.icon} size={16} />
            <span>{view?.label}</span>
          </button>
        ))}
      </div>
      {/* Photo Timeline */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-foreground">
          Evolução - Vista {viewOptions?.find(v => v?.id === selectedView)?.label}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photoSessions?.map((session) => (
            <div key={session?.id} className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="font-semibold text-foreground">{session?.label}</h5>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session?.date)?.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" iconName="Eye" />
                  <Button variant="ghost" size="sm" iconName="Download" />
                </div>
              </div>

              <div className="aspect-[3/4] bg-card rounded-lg overflow-hidden border border-border">
                {session?.photos?.[selectedView] ? (
                  <img
                    src={session?.photos?.[selectedView]}
                    alt={`${selectedClient?.name} - ${session?.label} - Vista ${viewOptions?.find(v => v?.id === selectedView)?.label}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Icon name="ImageOff" size={32} className="mx-auto mb-2" />
                      <p className="text-sm">Foto não disponível</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Before/After Comparison */}
      {photoSessions?.length >= 2 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Icon name="GitCompare" size={20} className="mr-2 text-primary" />
            Comparação Antes/Depois
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <div>
              <h5 className="font-medium text-foreground mb-3 text-center">
                Antes ({photoSessions?.[photoSessions?.length - 1]?.label})
              </h5>
              <div className="aspect-[3/4] bg-card rounded-lg overflow-hidden border border-border">
                <img
                  src={photoSessions?.[photoSessions?.length - 1]?.photos?.[selectedView]}
                  alt={`${selectedClient?.name} - Foto inicial - Vista ${viewOptions?.find(v => v?.id === selectedView)?.label}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                {new Date(photoSessions[photoSessions?.length - 1]?.date)?.toLocaleDateString('pt-BR')}
              </p>
            </div>

            {/* After */}
            <div>
              <h5 className="font-medium text-foreground mb-3 text-center">
                Depois ({photoSessions?.[0]?.label})
              </h5>
              <div className="aspect-[3/4] bg-card rounded-lg overflow-hidden border border-border">
                <img
                  src={photoSessions?.[0]?.photos?.[selectedView]}
                  alt={`${selectedClient?.name} - Foto atual - Vista ${viewOptions?.find(v => v?.id === selectedView)?.label}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                {new Date(photoSessions[0]?.date)?.toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="text-center mt-4">
            <Button variant="outline" iconName="Share" iconPosition="left">
              Compartilhar Comparação
            </Button>
          </div>
        </div>
      )}
      {/* Privacy Notice */}
      <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Lock" size={20} className="text-warning mt-0.5" />
          <div>
            <h5 className="font-medium text-foreground mb-1">Privacidade e Consentimento</h5>
            <p className="text-sm text-muted-foreground">
              Todas as fotos são armazenadas com segurança e só podem ser visualizadas pelo cliente 
              e personal trainer autorizado. O consentimento do cliente é obrigatório para documentação fotográfica.
            </p>
          </div>
        </div>
      </div>
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Adicionar Fotos</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploadModal(false)}
                iconName="X"
              />
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Clique para selecionar ou arraste as fotos aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  Formatos suportados: JPG, PNG (máx. 10MB)
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={() => setShowUploadModal(false)}>
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoDocumentation;