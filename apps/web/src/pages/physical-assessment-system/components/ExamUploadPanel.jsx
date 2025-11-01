import React, { useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const examTypes = [
  { value: 'laboratorial', label: 'Exames laboratoriais' },
  { value: 'dexa', label: 'DEXA Scan' },
  { value: 'bioimpedancia', label: 'Bioimpedância' },
  { value: 'ergometrico', label: 'Teste ergométrico' },
  { value: 'outros', label: 'Outros' },
];

const statusConfig = {
  pending: { label: 'Pendente', classes: 'bg-amber-100 text-amber-800 border-amber-200' },
  completed: { label: 'Concluído', classes: 'bg-green-100 text-green-800 border-green-200' },
  expired: { label: 'Vencido', classes: 'bg-red-100 text-red-800 border-red-200' },
};

const ExamUploadPanel = ({ selectedClient, attachments = [], onUpload, uploading = false }) => {
  const fileInputRef = useRef(null);
  const [examType, setExamType] = useState(examTypes[0]?.value ?? 'laboratorial');
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Envie arquivos em PDF ou imagens (JPG, PNG, WEBP).');
      return;
    }

    setError(null);
    await onUpload?.({ file, examType });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!selectedClient) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Selecione um cliente</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Escolha um cliente para visualizar e enviar exames e laudos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Exames e laudos</h3>
          <p className="text-sm text-muted-foreground">
            Organize documentos clínicos relevantes e mantenha o histórico do cliente atualizado.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={examTypes}
            value={examType}
            onChange={setExamType}
            className="w-48"
          />
          <Button
            type="button"
            variant="outline"
            iconName="Upload"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Enviando...' : 'Adicionar exame'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {attachments.length ? (
        <div className="space-y-3">
          {attachments.map((attachment) => {
            const status = statusConfig[attachment.status ?? 'completed'] ?? statusConfig.completed;
            return (
              <div key={attachment.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name="FileText" size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground break-all">{attachment.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(attachment.uploadedAt ?? Date.now()).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${status.classes}`}>
                    {status.label}
                  </span>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Abrir
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-8 text-center">
          <Icon name="Inbox" size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhum exame enviado ainda. Utilize o botão acima para anexar exames recentes do cliente.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExamUploadPanel;
