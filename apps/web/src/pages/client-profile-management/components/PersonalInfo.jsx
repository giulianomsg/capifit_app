import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const PersonalInfo = ({ clientData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: clientData?.nome || '',
    email: clientData?.email || '',
    telefone: clientData?.telefone || '',
    endereco: clientData?.endereco || '',
    idade: clientData?.idade || '',
    emergencyContactName: clientData?.emergencyContact?.nome || '',
    emergencyContactPhone: clientData?.emergencyContact?.telefone || '',
    emergencyContactRelation: clientData?.emergencyContact?.parentesco || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // In real app, this would save to backend
    console.log('Saving client data:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      nome: clientData?.nome || '',
      email: clientData?.email || '',
      telefone: clientData?.telefone || '',
      endereco: clientData?.endereco || '',
      idade: clientData?.idade || '',
      emergencyContactName: clientData?.emergencyContact?.nome || '',
      emergencyContactPhone: clientData?.emergencyContact?.telefone || '',
      emergencyContactRelation: clientData?.emergencyContact?.parentesco || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Informações Pessoais</h2>
        {!isEditing ? (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            iconName="Edit"
            iconPosition="left"
          >
            Editar
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleCancel}
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
        )}
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Dados Básicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              name="nome"
              value={formData?.nome}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            
            <Input
              label="Idade"
              name="idade"
              type="number"
              value={formData?.idade}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData?.email}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            
            <Input
              label="Telefone"
              name="telefone"
              value={formData?.telefone}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            
            <div className="md:col-span-2">
              <Input
                label="Endereço"
                name="endereco"
                value={formData?.endereco}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Health Information */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Informações de Saúde</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="User" size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-foreground">Altura</span>
              </div>
              <p className="text-lg font-bold text-foreground">{clientData?.healthInfo?.altura} cm</p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="TrendingUp" size={16} className="text-green-600" />
                <span className="text-sm font-medium text-foreground">Peso Atual</span>
              </div>
              <p className="text-lg font-bold text-foreground">{clientData?.healthInfo?.peso} kg</p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Activity" size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-foreground">IMC</span>
              </div>
              <p className="text-lg font-bold text-foreground">{clientData?.healthInfo?.imc}</p>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            {clientData?.healthInfo?.restricoesMedicas?.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                  <Icon name="AlertTriangle" size={16} className="mr-2" />
                  Restrições Médicas
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {clientData?.healthInfo?.restricoesMedicas?.map((restricao, index) => (
                    <li key={index}>• {restricao}</li>
                  ))}
                </ul>
              </div>
            )}

            {clientData?.healthInfo?.medicamentos?.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Icon name="Pill" size={16} className="mr-2" />
                  Medicamentos em Uso
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {clientData?.healthInfo?.medicamentos?.map((med, index) => (
                    <li key={index}>• {med}</li>
                  ))}
                </ul>
              </div>
            )}

            {clientData?.healthInfo?.alergias?.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2 flex items-center">
                  <Icon name="Shield" size={16} className="mr-2" />
                  Alergias
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {clientData?.healthInfo?.alergias?.map((alergia, index) => (
                    <li key={index}>• {alergia}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Contato de Emergência</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nome"
              name="emergencyContactName"
              value={formData?.emergencyContactName}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            
            <Input
              label="Telefone"
              name="emergencyContactPhone"
              value={formData?.emergencyContactPhone}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            
            <Input
              label="Parentesco/Relação"
              name="emergencyContactRelation"
              value={formData?.emergencyContactRelation}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Medical Clearance Status */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Status Médico</h3>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={20} className="text-green-600" />
              <div>
                <p className="font-medium text-green-800">Liberação Médica Ativa</p>
                <p className="text-sm text-green-600">Última atualização: 15 de outubro, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;