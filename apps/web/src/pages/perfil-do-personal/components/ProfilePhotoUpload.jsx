import React, { useEffect, useState } from 'react';

import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProfilePhotoUpload = ({
  currentPhoto,
  onPhotoChange,
  isUploading = false,
  errorMessage = '',
  allowRemove = true,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentPhoto ?? null);

  useEffect(() => {
    setPreviewUrl(currentPhoto ?? null);
  }, [currentPhoto]);

  const handleFileSelect = (file) => {
    if (!file || !file?.type?.startsWith('image/')) {
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onPhotoChange?.(file);
  };

  const handleDrop = (event) => {
    event?.preventDefault();
    setIsDragging(false);
    const file = event?.dataTransfer?.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = (event) => {
    event?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event?.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (event) => {
    const file = event?.target?.files?.[0];
    handleFileSelect(file);
    if (event?.target) {
      event.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange?.(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Foto Profissional</h3>
        <p className="text-sm text-muted-foreground">Adicione uma foto profissional para seu perfil público</p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-border">
            {previewUrl ? (
              <Image src={previewUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="User" size={48} className="text-muted-foreground" />
              </div>
            )}
          </div>

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Icon name="Loader2" size={24} className="text-white animate-spin" />
            </div>
          )}

          {previewUrl && allowRemove && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full"
              disabled={isUploading}
            >
              <Icon name="X" size={16} />
            </Button>
          )}
        </div>

        <div
          className={`
            w-full max-w-md p-6 border-2 border-dashed rounded-lg text-center cursor-pointer
            transition-colors duration-200
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-muted/50'}
            ${isUploading ? 'pointer-events-none opacity-75' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('photo-upload-input')?.click()}
        >
          <Icon name="Upload" size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground mb-1">Clique para fazer upload ou arraste uma imagem</p>
          <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP até 5MB</p>
        </div>

        <input
          id="photo-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('photo-upload-input')?.click()}
            iconName="Upload"
            iconPosition="left"
            disabled={isUploading}
          >
            Escolher Arquivo
          </Button>

          {previewUrl && allowRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemovePhoto}
              iconName="Trash2"
              iconPosition="left"
              disabled={isUploading}
            >
              Remover
            </Button>
          )}
        </div>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      </div>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">Dicas para uma boa foto:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use uma foto recente e profissional</li>
          <li>• Prefira ambientes bem iluminados</li>
          <li>• Evite fundos com outras pessoas</li>
          <li>• Recomendado 400x400 pixels ou superior</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;
