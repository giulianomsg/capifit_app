import React, { useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProgressPhotosGallery = ({ selectedClient, photos = [], onUpload, uploading = false }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    setError(null);
    await onUpload?.(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!selectedClient) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <Icon name="Image" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Selecione um cliente</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Escolha um cliente para visualizar o histórico de fotos de progresso e enviar novas imagens.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Fotos de progresso</h3>
          <p className="text-sm text-muted-foreground">
            {photos.length > 0
              ? `${photos.length} ${photos.length === 1 ? 'registro' : 'registros'} encontrados`
              : 'Nenhuma foto enviada ainda'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-red-600">{error}</span>}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            iconName="Upload"
          >
            {uploading ? 'Enviando...' : 'Enviar foto'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {photos.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="border border-border rounded-xl overflow-hidden">
              <div className="aspect-[4/5] bg-muted">
                <img
                  src={photo.url}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="p-3 space-y-1 text-sm">
                <p className="text-foreground font-medium">
                  {new Date(photo.capturedAt ?? photo.uploadedAt ?? Date.now()).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-muted-foreground break-all">{photo.filename}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-8 text-center">
          <Icon name="ImageOff" size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhuma foto registrada para este cliente. Utilize o botão acima para enviar a primeira foto de progresso.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressPhotosGallery;
