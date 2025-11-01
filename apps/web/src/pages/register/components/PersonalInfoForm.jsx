import React from 'react';
import Input from '../../../components/ui/Input';

const PersonalInfoForm = ({ 
  formData, 
  onInputChange, 
  errors = {},
  className = "" 
}) => {
  const handleChange = (field) => (e) => {
    if (onInputChange) {
      onInputChange(field, e?.target?.value);
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value?.replace(/\D/g, '');
    
    // Format as (XX) XXXXX-XXXX
    if (digits?.length <= 11) {
      return digits?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e?.target?.value);
    if (onInputChange) {
      onInputChange('telefone', formatted);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Informações Pessoais
        </h3>
        <p className="text-sm text-muted-foreground">
          Preencha seus dados para criar sua conta
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome Completo"
          type="text"
          placeholder="Digite seu nome completo"
          value={formData?.nome || ''}
          onChange={handleChange('nome')}
          error={errors?.nome}
          required
        />

        <Input
          label="Telefone"
          type="tel"
          placeholder="(11) 99999-9999"
          value={formData?.telefone || ''}
          onChange={handlePhoneChange}
          error={errors?.telefone}
          description="Formato: (XX) XXXXX-XXXX"
        />
      </div>
      <Input
        label="Email"
        type="email"
        placeholder="seu@email.com"
        value={formData?.email || ''}
        onChange={handleChange('email')}
        error={errors?.email}
        description="Será usado para fazer login na plataforma"
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Senha"
          type="password"
          placeholder="Crie uma senha segura"
          value={formData?.senha || ''}
          onChange={handleChange('senha')}
          error={errors?.senha}
          description="Mínimo 8 caracteres"
          required
        />

        <Input
          label="Confirmar Senha"
          type="password"
          placeholder="Digite a senha novamente"
          value={formData?.confirmarSenha || ''}
          onChange={handleChange('confirmarSenha')}
          error={errors?.confirmarSenha}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Data de Nascimento"
          type="date"
          value={formData?.dataNascimento || ''}
          onChange={handleChange('dataNascimento')}
          error={errors?.dataNascimento}
          required
        />

        <Input
          label="CPF"
          type="text"
          placeholder="000.000.000-00"
          value={formData?.cpf || ''}
          onChange={handleChange('cpf')}
          error={errors?.cpf}
          description="Apenas números"
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;