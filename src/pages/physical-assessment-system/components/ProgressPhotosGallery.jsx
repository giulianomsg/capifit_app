import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ProgressPhotosGallery = ({ clients, selectedClient, onClientSelect }) => {
  const [activeUpload, setActiveUpload] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoComparison, setPhotoComparison] = useState({ before: null, after: null });
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery', 'comparison', 'timeline'
  const [photoCategory, setPhotoCategory] = useState('front');

  // Mock photo data
  const mockPhotos = {
    1: [// Maria Santos
    {
      id: 1,
      date: '2024-01-15',
      category: 'front',
      url: "https://images.unsplash.com/photo-1731117050016-34a5ea5e4966",
      alt: 'Foto frontal de progresso de Maria Santos em janeiro de 2024',
      notes: 'Início do programa'
    },
    {
      id: 2,
      date: '2024-04-15',
      category: 'front',
      url: "https://images.unsplash.com/photo-1731117050016-34a5ea5e4966",
      alt: 'Foto frontal de progresso de Maria Santos em abril de 2024',
      notes: 'Após 3 meses - perda de 5kg'
    },
    {
      id: 3,
      date: '2024-07-15',
      category: 'front',
      url: "https://images.unsplash.com/photo-1731117050016-34a5ea5e4966",
      alt: 'Foto frontal de progresso de Maria Santos em julho de 2024',
      notes: 'Após 6 meses - definição muscular visível'
    },
    {
      id: 4,
      date: '2024-10-15',
      category: 'front',
      url: "https://images.unsplash.com/photo-1731117050016-34a5ea5e4966",
      alt: 'Foto frontal de progresso de Maria Santos em outubro de 2024',
      notes: 'Resultado atual - meta alcançada!'
    }],

    2: [// Carlos Silva
    {
      id: 5,
      date: '2024-02-01',
      category: 'front',
      url: "https://images.unsplash.com/photo-1730180820029-def1f543db78",
      alt: 'Foto frontal de progresso de Carlos Silva em fevereiro de 2024',
      notes: 'Início - foco em ganho de massa'
    },
    {
      id: 6,
      date: '2024-06-01',
      category: 'front',
      url: "https://images.unsplash.com/photo-1730180820029-def1f543db78",
      alt: 'Foto frontal de progresso de Carlos Silva em junho de 2024',
      notes: 'Após 4 meses - aumento de massa magra'
    }]

  };

  const photoCategories = [
  { value: 'front', label: 'Frontal' },
  { value: 'side', label: 'Lateral' },
  { value: 'back', label: 'Posterior' },
  { value: 'detail', label: 'Detalhe' }];


  const handleFileUpload = (event) => {
    const files = Array.from(event?.target?.files);
    // Here you would typically upload to your storage service
    console.log('Uploading photos:', files);
    setActiveUpload(false);
    // Show success message
    alert('Fotos enviadas com sucesso!');
  };

  const togglePhotoSelection = (photo) => {
    setSelectedPhotos((prev) => {
      const isSelected = prev?.find((p) => p?.id === photo?.id);
      if (isSelected) {
        return prev?.filter((p) => p?.id !== photo?.id);
      }
      return [...prev, photo];
    });
  };

  const setComparisonPhoto = (photo, position) => {
    setPhotoComparison((prev) => ({
      ...prev,
      [position]: photo
    }));
  };

  const clientPhotos = selectedClient ? mockPhotos?.[selectedClient?.id] || [] : [];
  const filteredPhotos = clientPhotos?.filter((photo) =>
  photoCategory === 'all' || photo?.category === photoCategory
  );

  if (!selectedClient) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Selecionar Cliente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients?.map((client) =>
            <div
              key={client?.id}
              onClick={() => onClientSelect?.(client)}
              className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                    <img
                    src={client?.avatar}
                    alt={client?.alt || `Foto de perfil de ${client?.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />

                    <div className="w-full h-full bg-muted flex items-center justify-center" style={{ display: 'none' }}>
                      <Icon name="User" size={20} className="text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{client?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(mockPhotos?.[client?.id] || [])?.length} fotos
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
              <img
                src={selectedClient?.avatar}
                alt={selectedClient?.alt || `Foto de perfil de ${selectedClient?.name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }} />

              <div className="w-full h-full bg-muted flex items-center justify-center" style={{ display: 'none' }}>
                <Icon name="User" size={32} className="text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-foreground">{selectedClient?.name}</h2>
              <p className="text-muted-foreground">{clientPhotos?.length} fotos de progresso</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => onClientSelect?.(null)}
              iconName="ArrowLeft"
              iconPosition="left">

              Voltar
            </Button>
            
            <Button
              onClick={() => setActiveUpload(true)}
              iconName="Upload"
              iconPosition="left">

              Adicionar Fotos
            </Button>
          </div>
        </div>
      </div>
      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Select
              value={viewMode}
              onChange={setViewMode}
              options={[
              { value: 'gallery', label: 'Galeria' },
              { value: 'comparison', label: 'Comparação' },
              { value: 'timeline', label: 'Linha do Tempo' }]
              }
              className="w-40" />

            
            <Select
              value={photoCategory}
              onChange={setPhotoCategory}
              options={[
              { value: 'all', label: 'Todas as categorias' },
              ...photoCategories]
              }
              className="w-48" />

          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {selectedPhotos?.length} selecionada(s)
            </span>
            {selectedPhotos?.length > 0 &&
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPhotos([])}>

                Limpar seleção
              </Button>
            }
          </div>
        </div>
      </div>
      {/* Photo Content */}
      {viewMode === 'gallery' &&
      <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Galeria de Fotos
          </h3>
          
          {filteredPhotos?.length === 0 ?
        <div className="text-center py-12">
              <Icon name="Camera" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma foto encontrada</p>
              <Button onClick={() => setActiveUpload(true)}>
                Adicionar primeira foto
              </Button>
            </div> :

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos?.map((photo) =>
          <div
            key={photo?.id}
            className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
            selectedPhotos?.find((p) => p?.id === photo?.id) ?
            'border-primary shadow-lg' :
            'border-transparent hover:border-muted-foreground/50'}`
            }
            onClick={() => togglePhotoSelection(photo)}>

                  <div className="aspect-[3/4] bg-muted">
                    <img
                src={photo?.url}
                alt={photo?.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/images/no_image.png';
                }} />

                  </div>
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-sm font-medium">
                        {new Date(photo?.date)?.toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs opacity-90">{photo?.notes}</p>
                    </div>
                  </div>
                  
                  {selectedPhotos?.find((p) => p?.id === photo?.id) &&
            <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Icon name="Check" size={16} className="text-white" />
                      </div>
                    </div>
            }
                </div>
          )}
            </div>
        }
        </div>
      }
      {viewMode === 'comparison' &&
      <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Comparação de Fotos
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Before Photo */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">Antes</h4>
              {photoComparison?.before ?
            <div className="relative group">
                  <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                    <img
                  src={photoComparison?.before?.url}
                  alt={photoComparison?.before?.alt}
                  className="w-full h-full object-cover" />

                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {new Date(photoComparison?.before?.date)?.toLocaleDateString('pt-BR')}
                  </div>
                  <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setComparisonPhoto(null, 'before')}>

                    Remover
                  </Button>
                </div> :

            <div className="aspect-[3/4] bg-muted rounded-lg border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center">
                  <Icon name="ImagePlus" size={32} className="text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-center">
                    Selecione uma foto da galeria
                  </p>
                </div>
            }
            </div>

            {/* After Photo */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">Depois</h4>
              {photoComparison?.after ?
            <div className="relative group">
                  <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                    <img
                  src={photoComparison?.after?.url}
                  alt={photoComparison?.after?.alt}
                  className="w-full h-full object-cover" />

                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {new Date(photoComparison?.after?.date)?.toLocaleDateString('pt-BR')}
                  </div>
                  <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setComparisonPhoto(null, 'after')}>

                    Remover
                  </Button>
                </div> :

            <div className="aspect-[3/4] bg-muted rounded-lg border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center">
                  <Icon name="ImagePlus" size={32} className="text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-center">
                    Selecione uma foto da galeria
                  </p>
                </div>
            }
            </div>
          </div>

          {/* Available Photos for Comparison */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-foreground mb-3">
              Selecionar fotos para comparação:
            </h4>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {filteredPhotos?.map((photo) =>
            <div
              key={photo?.id}
              className="aspect-[3/4] bg-muted rounded cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => {
                if (!photoComparison?.before) {
                  setComparisonPhoto(photo, 'before');
                } else if (!photoComparison?.after) {
                  setComparisonPhoto(photo, 'after');
                }
              }}>

                  <img
                src={photo?.url}
                alt={photo?.alt}
                className="w-full h-full object-cover rounded" />

                </div>
            )}
            </div>
          </div>
        </div>
      }
      {viewMode === 'timeline' &&
      <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Linha do Tempo
          </h3>
          
          <div className="space-y-6">
            {filteredPhotos?.map((photo, index) =>
          <div key={photo?.id} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  {index < filteredPhotos?.length - 1 &&
              <div className="w-0.5 h-16 bg-border mt-2"></div>
              }
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-24 h-32 bg-muted rounded overflow-hidden flex-shrink-0">
                      <img
                    src={photo?.url}
                    alt={photo?.alt}
                    className="w-full h-full object-cover" />

                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-foreground">
                          {new Date(photo?.date)?.toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                        </h4>
                        <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                          {photoCategories?.find((c) => c?.value === photo?.category)?.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{photo?.notes}</p>
                    </div>
                  </div>
                </div>
              </div>
          )}
          </div>
        </div>
      }
      {/* Upload Modal */}
      {activeUpload &&
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Adicionar Fotos
              </h3>
              <Button
              variant="ghost"
              onClick={() => setActiveUpload(false)}
              iconName="X" />

            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categoria da Foto
                </label>
                <Select
                value={photoCategory}
                onChange={setPhotoCategory}
                options={photoCategories} />

              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Selecionar Fotos
                </label>
                <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />

                <p className="text-xs text-muted-foreground mt-1">
                  Selecione até 5 fotos (máximo 10MB cada)
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                variant="outline"
                onClick={() => setActiveUpload(false)}>

                  Cancelar
                </Button>
                <Button
                onClick={() => document.querySelector('input[type="file"]')?.click()}>

                  Selecionar Arquivos
                </Button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default ProgressPhotosGallery;