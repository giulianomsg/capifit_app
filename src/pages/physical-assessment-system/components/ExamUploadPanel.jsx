import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ExamUploadPanel = ({ examData, clients }) => {
  const [activeUpload, setActiveUpload] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [examType, setExamType] = useState('');
  const [examDate, setExamDate] = useState(new Date()?.toISOString()?.split('T')?.[0]);
  const [examNotes, setExamNotes] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const examTypes = [
    { value: 'laboratorial', label: 'Exames Laboratoriais' },
    { value: 'dexa', label: 'DEXA Scan' },
    { value: 'ergometrico', label: 'Teste Ergométrico' },
    { value: 'bioimpedancia', label: 'Bioimpedância' },
    { value: 'ultrassom', label: 'Ultrassom' },
    { value: 'ressonancia', label: 'Ressonância Magnética' },
    { value: 'tomografia', label: 'Tomografia' },
    { value: 'ecocardiograma', label: 'Ecocardiograma' },
    { value: 'outros', label: 'Outros' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'expired':
        return 'Vencido';
      default:
        return 'Desconhecido';
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.')?.pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'FileText';
      case 'jpg': case'jpeg': case'png':
        return 'Image';
      case 'doc': case'docx':
        return 'FileText';
      default:
        return 'File';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event?.target?.files);
    // Here you would typically upload to your storage service
    console.log('Uploading exam files:', files);
    setActiveUpload(false);
    // Show success message
    alert('Exames enviados com sucesso!');
  };

  const filteredExams = examData?.filter(exam => {
    const matchesClient = filterClient === 'all' || exam?.clientId?.toString() === filterClient;
    const matchesStatus = filterStatus === 'all' || exam?.status === filterStatus;
    const matchesType = filterType === 'all' || exam?.type?.toLowerCase()?.includes(filterType?.toLowerCase());
    return matchesClient && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Gestão de Exames
            </h3>
            <p className="text-muted-foreground mt-1">
              Gerencie exames laboratoriais e de imagem dos seus clientes
            </p>
          </div>
          
          <Button
            onClick={() => setActiveUpload(true)}
            iconName="Upload"
            iconPosition="left"
          >
            Adicionar Exame
          </Button>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            value={filterClient}
            onChange={setFilterClient}
            options={[
              { value: 'all', label: 'Todos os Clientes' },
              ...clients?.map(client => ({
                value: client?.id?.toString(),
                label: client?.name
              }))
            ]}
            placeholder="Filtrar por cliente"
          />
          
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'all', label: 'Todos os Status' },
              { value: 'completed', label: 'Concluído' },
              { value: 'pending', label: 'Pendente' },
              { value: 'expired', label: 'Vencido' }
            ]}
            placeholder="Filtrar por status"
          />
          
          <Select
            value={filterType}
            onChange={setFilterType}
            options={[
              { value: 'all', label: 'Todos os Tipos' },
              ...examTypes
            ]}
            placeholder="Filtrar por tipo"
          />
          
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilterClient('all');
                setFilterStatus('all');
                setFilterType('all');
              }}
              iconName="X"
              iconPosition="left"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>
      {/* Exams List */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h4 className="font-semibold text-foreground">
            Exames ({filteredExams?.length})
          </h4>
        </div>
        
        <div className="divide-y divide-border">
          {filteredExams?.length === 0 ? (
            <div className="p-8 text-center">
              <Icon name="FileX" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum exame encontrado</p>
              <Button onClick={() => setActiveUpload(true)}>
                Adicionar primeiro exame
              </Button>
            </div>
          ) : (
            filteredExams?.map((exam) => (
              <div key={exam?.id} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-medium text-foreground">{exam?.type}</h5>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(exam?.status)}`}>
                        {getStatusLabel(exam?.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <Icon name="User" size={16} />
                        <span>{exam?.clientName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Calendar" size={16} />
                        <span>{new Date(exam?.date)?.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="FileText" size={16} />
                        <span>{exam?.files?.length || 0} arquivo(s)</span>
                      </div>
                    </div>
                    
                    {exam?.notes && (
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Observações:</strong> {exam?.notes}
                      </p>
                    )}
                    
                    {/* Files List */}
                    {exam?.files && exam?.files?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Arquivos:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {exam?.files?.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 p-2 bg-muted/50 rounded border"
                            >
                              <Icon 
                                name={getFileIcon(file?.name)} 
                                size={16} 
                                className="text-primary flex-shrink-0" 
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {file?.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {file?.size}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(file?.url, '_blank')}
                                iconName="Download"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Edit"
                    >
                      Editar
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Trash2"
                      className="text-destructive hover:text-destructive"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Upload Modal */}
      {activeUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Adicionar Novo Exame
              </h3>
              <Button
                variant="ghost"
                onClick={() => setActiveUpload(false)}
                iconName="X"
              />
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  value={selectedClient}
                  onChange={setSelectedClient}
                  options={clients?.map(client => ({
                    value: client?.id?.toString(),
                    label: client?.name
                  }))}
                  placeholder="Selecionar cliente"
                  label="Cliente"
                  required
                />
                
                <Select
                  value={examType}
                  onChange={setExamType}
                  options={examTypes}
                  placeholder="Selecionar tipo de exame"
                  label="Tipo de Exame"
                  required
                />
              </div>
              
              <Input
                type="date"
                label="Data do Exame"
                value={examDate}
                onChange={(e) => setExamDate(e?.target?.value)}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Arquivos do Exame
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceitos: PDF, JPG, PNG, DOC, DOCX (máximo 20MB por arquivo)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Observações
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Adicione observações sobre o exame, resultados principais, recomendações..."
                  value={examNotes}
                  onChange={(e) => setExamNotes(e?.target?.value)}
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setActiveUpload(false)}
                >
                  Cancelar
                </Button>
                
                <Button
                  onClick={() => document.querySelector('input[type="file"]')?.click()}
                  iconName="Upload"
                  iconPosition="left"
                  disabled={!selectedClient || !examType}
                >
                  Adicionar Exame
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamUploadPanel;