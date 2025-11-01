import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileUploadModal = ({ onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFiles(e?.dataTransfer?.files);
    }
  };

  const handleChange = (e) => {
    e?.preventDefault();
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFiles(e?.target?.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files)?.map(file => ({
      file,
      id: Math.random()?.toString(36)?.substr(2, 9),
      name: file?.name,
      size: file?.size,
      type: file?.type,
      preview: file?.type?.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setSelectedFiles(prev => [...prev, ...fileArray]);
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev?.filter(f => f?.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return 'Image';
    if (type?.startsWith('video/')) return 'Video';
    if (type?.startsWith('audio/')) return 'Music';
    if (type === 'application/pdf') return 'FileText';
    return 'File';
  };

  const handleUpload = () => {
    if (selectedFiles?.length > 0) {
      onUpload?.(selectedFiles);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Enviar Arquivos</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Compartilhe fotos, vídeos, documentos e outros arquivos
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-6 flex-1">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive 
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Icon name="Upload" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Solte os arquivos aqui
            </h4>
            <p className="text-muted-foreground mb-4">
              ou clique para selecionar arquivos do seu dispositivo
            </p>
            
            <input
              type="file"
              multiple
              onChange={handleChange}
              className="hidden"
              id="file-upload"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer transition-colors"
            >
              <Icon name="FolderOpen" size={16} className="mr-2" />
              Selecionar Arquivos
            </label>
            
            <div className="text-xs text-muted-foreground mt-4">
              Formatos suportados: Imagens, vídeos, áudios, PDF, documentos (máx. 10MB por arquivo)
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles?.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-foreground mb-3">
                Arquivos Selecionados ({selectedFiles?.length})
              </h4>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles?.map(file => (
                  <div key={file?.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                    {file?.preview ? (
                      <img
                        src={file?.preview}
                        alt={`Preview of ${file?.name}`}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <Icon name={getFileIcon(file?.type)} size={20} className="text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file?.size)}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file?.id)}
                      iconName="Trash2"
                      className="text-red-500 hover:text-red-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Type Quick Buttons */}
          <div className="mt-6">
            <h4 className="font-semibold text-foreground mb-3">Envio Rápido</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="flex flex-col items-center p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <Icon name="Camera" size={24} className="text-primary mb-2" />
                <span className="text-sm text-foreground">Foto</span>
              </button>
              
              <button className="flex flex-col items-center p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <Icon name="Video" size={24} className="text-primary mb-2" />
                <span className="text-sm text-foreground">Vídeo</span>
              </button>
              
              <button className="flex flex-col items-center p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <Icon name="FileText" size={24} className="text-primary mb-2" />
                <span className="text-sm text-foreground">Documento</span>
              </button>
              
              <button className="flex flex-col items-center p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <Icon name="Mic" size={24} className="text-primary mb-2" />
                <span className="text-sm text-foreground">Áudio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedFiles?.length > 0 && (
                <span>
                  {selectedFiles?.length} arquivo(s) - {
                    formatFileSize(selectedFiles?.reduce((total, file) => total + file?.size, 0))
                  }
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles?.length === 0}
                iconName="Send"
                iconPosition="left"
              >
                Enviar {selectedFiles?.length > 0 && `(${selectedFiles?.length})`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;