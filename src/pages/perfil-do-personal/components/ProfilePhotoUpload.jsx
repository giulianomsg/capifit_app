import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProfilePhotoUpload = ({ currentPhoto, onPhotoChange, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentPhoto);

  const handleFileSelect = (file) => {
    if (file && file?.type?.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (onPhotoChange) {
        onPhotoChange(file);
      }
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragging(false);
    const file = e?.dataTransfer?.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    const file = e?.target?.files?.[0];
    handleFileSelect(file);
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    if (onPhotoChange) {
      onPhotoChange(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Foto Profissional
        </h3>
        <p className="text-sm text-muted-foreground">
          Adicione uma foto profissional para seu perfil público
        </p>
      </div>
      <div className="flex flex-col items-center space-y-4">
        {/* Photo Preview */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-border">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Foto de perfil do personal trainer profissional"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="User" size={48} className="text-muted-foreground" />
              </div>
            )}
          </div>
          
          {previewUrl && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full"
            >
              <Icon name="X" size={16} />
            </Button>
          )}
        </div>

        {/* Upload Area */}
        <div
          className={`
            w-full max-w-md p-6 border-2 border-dashed rounded-lg text-center cursor-pointer
            transition-colors duration-200
            ${isDragging 
              ? 'border-primary bg-primary/5' :'border-border hover:border-primary hover:bg-muted/50'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('photo-upload')?.click()}
        >
          <Icon name="Upload" size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground mb-1">
            Clique para fazer upload ou arraste uma imagem
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG até 5MB
          </p>
        </div>

        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('photo-upload')?.click()}
            iconName="Upload"
            iconPosition="left"
          >
            Escolher Arquivo
          </Button>
          
          {previewUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemovePhoto}
              iconName="Trash2"
              iconPosition="left"
            >
              Remover
            </Button>
          )}
        </div>
      </div>
      {/* Guidelines */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">
          Dicas para uma boa foto:
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use uma foto recente e profissional</li>
          <li>• Mantenha boa iluminação e fundo neutro</li>
          <li>• Evite fotos com outras pessoas</li>
          <li>• Resolução mínima de 400x400 pixels</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;