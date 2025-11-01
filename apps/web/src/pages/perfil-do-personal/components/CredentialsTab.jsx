import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CredentialsTab = ({ className = "" }) => {
  const [credentials, setCredentials] = useState([
    {
      id: 1,
      type: 'cref',
      title: 'CREF - Conselho Regional de Educação Física',
      number: 'CREF 123456-G/SP',
      issueDate: '2018-03-15',
      expiryDate: '2025-03-15',
      status: 'active',
      document: 'cref_certificate.pdf'
    },
    {
      id: 2,
      type: 'certification',
      title: 'Certificação em Treinamento Funcional',
      number: 'TF-2023-001',
      issueDate: '2023-06-20',
      expiryDate: '2026-06-20',
      status: 'active',
      document: 'functional_cert.pdf'
    },
    {
      id: 3,
      type: 'education',
      title: 'Bacharelado em Educação Física',
      number: 'Diploma 789123',
      issueDate: '2017-12-15',
      expiryDate: null,
      status: 'active',
      document: 'diploma.pdf'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    number: '',
    issueDate: '',
    expiryDate: '',
    document: null
  });

  const credentialTypes = [
    { value: 'cref', label: 'CREF - Registro Profissional' },
    { value: 'certification', label: 'Certificação Técnica' },
    { value: 'education', label: 'Formação Acadêmica' },
    { value: 'course', label: 'Curso de Especialização' },
    { value: 'workshop', label: 'Workshop/Seminário' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10';
      case 'expired':
        return 'text-destructive bg-destructive/10';
      case 'expiring':
        return 'text-warning bg-warning/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'expired':
        return 'Expirado';
      case 'expiring':
        return 'Expirando';
      default:
        return 'Indefinido';
    }
  };

  const getCredentialIcon = (type) => {
    switch (type) {
      case 'cref':
        return 'Shield';
      case 'certification':
        return 'Award';
      case 'education':
        return 'GraduationCap';
      case 'course':
        return 'BookOpen';
      case 'workshop':
        return 'Users';
      default:
        return 'FileText';
    }
  };

  const handleAddNew = () => {
    setFormData({
      type: '',
      title: '',
      number: '',
      issueDate: '',
      expiryDate: '',
      document: null
    });
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleEdit = (credential) => {
    setFormData({
      type: credential?.type,
      title: credential?.title,
      number: credential?.number,
      issueDate: credential?.issueDate,
      expiryDate: credential?.expiryDate || '',
      document: null
    });
    setEditingId(credential?.id);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingId) {
      setCredentials(prev => prev?.map(cred => 
        cred?.id === editingId 
          ? { ...cred, ...formData, status: 'active' }
          : cred
      ));
    } else {
      const newCredential = {
        id: Date.now(),
        ...formData,
        status: 'active',
        document: formData?.document ? formData?.document?.name : null
      };
      setCredentials(prev => [...prev, newCredential]);
    }
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setCredentials(prev => prev?.filter(cred => cred?.id !== id));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Credenciais e Certificações
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie suas qualificações profissionais e certificações
          </p>
        </div>
        
        <Button
          onClick={handleAddNew}
          iconName="Plus"
          iconPosition="left"
        >
          Adicionar Credencial
        </Button>
      </div>
      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {editingId ? 'Editar Credencial' : 'Nova Credencial'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Select
              label="Tipo de Credencial"
              options={credentialTypes}
              value={formData?.type}
              onChange={(value) => handleInputChange('type', value)}
              placeholder="Selecione o tipo"
              required
            />
            
            <Input
              label="Título/Nome"
              type="text"
              value={formData?.title}
              onChange={(e) => handleInputChange('title', e?.target?.value)}
              placeholder="Nome da certificação"
              required
            />
            
            <Input
              label="Número/Registro"
              type="text"
              value={formData?.number}
              onChange={(e) => handleInputChange('number', e?.target?.value)}
              placeholder="Número do registro"
            />
            
            <Input
              label="Data de Emissão"
              type="date"
              value={formData?.issueDate}
              onChange={(e) => handleInputChange('issueDate', e?.target?.value)}
              required
            />
            
            <Input
              label="Data de Validade"
              type="date"
              value={formData?.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e?.target?.value)}
              description="Deixe em branco se não expira"
            />
            
            <Input
              label="Documento (PDF)"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleInputChange('document', e?.target?.files?.[0])}
              description="Upload do certificado"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleSave}
              iconName="Save"
              iconPosition="left"
            >
              Salvar
            </Button>
          </div>
        </div>
      )}
      {/* Credentials List */}
      <div className="space-y-4">
        {credentials?.map((credential) => (
          <div
            key={credential?.id}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon 
                    name={getCredentialIcon(credential?.type)} 
                    size={24} 
                    className="text-primary"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {credential?.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(credential?.status)}`}>
                      {getStatusLabel(credential?.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Número/Registro</p>
                      <p className="font-medium text-foreground">{credential?.number}</p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Data de Emissão</p>
                      <p className="font-medium text-foreground">
                        {new Date(credential.issueDate)?.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Validade</p>
                      <p className="font-medium text-foreground">
                        {credential?.expiryDate 
                          ? new Date(credential.expiryDate)?.toLocaleDateString('pt-BR')
                          : 'Sem validade'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {credential?.document && (
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="FileText"
                        iconPosition="left"
                      >
                        Ver Documento
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(credential)}
                >
                  <Icon name="Edit" size={16} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(credential?.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {credentials?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Award" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhuma credencial cadastrada
          </h3>
          <p className="text-muted-foreground mb-4">
            Adicione suas certificações e qualificações profissionais
          </p>
          <Button
            onClick={handleAddNew}
            iconName="Plus"
            iconPosition="left"
          >
            Adicionar Primeira Credencial
          </Button>
        </div>
      )}
    </div>
  );
};

export default CredentialsTab;