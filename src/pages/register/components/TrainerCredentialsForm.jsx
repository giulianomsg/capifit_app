import React from 'react';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const TrainerCredentialsForm = ({ 
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

  const handleCheckboxChange = (field) => (e) => {
    if (onInputChange) {
      onInputChange(field, e?.target?.checked);
    }
  };

  const handleFileChange = (field) => (e) => {
    const file = e?.target?.files?.[0];
    if (onInputChange) {
      onInputChange(field, file);
    }
  };

  const specializations = [
    'Musculação',
    'Funcional',
    'Pilates',
    'Crossfit',
    'Yoga',
    'Natação',
    'Corrida',
    'Fisioterapia',
    'Nutrição Esportiva',
    'Reabilitação'
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Credenciais Profissionais
        </h3>
        <p className="text-sm text-muted-foreground">
          Valide suas qualificações como Personal Trainer
        </p>
      </div>
      {/* CREF Registration */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Icon name="Shield" size={20} className="text-primary mr-2" />
          <h4 className="font-semibold text-foreground">Registro CREF</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Número CREF"
            type="text"
            placeholder="000000-G/SP"
            value={formData?.cref || ''}
            onChange={handleChange('cref')}
            error={errors?.cref}
            description="Formato: 000000-G/UF"
            required
          />

          <Input
            label="Estado do CREF"
            type="text"
            placeholder="SP"
            value={formData?.crefEstado || ''}
            onChange={handleChange('crefEstado')}
            error={errors?.crefEstado}
            description="UF do registro"
            required
          />
        </div>
      </div>
      {/* Education */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Icon name="GraduationCap" size={20} className="text-secondary mr-2" />
          <h4 className="font-semibold text-foreground">Formação Acadêmica</h4>
        </div>

        <div className="space-y-4">
          <Input
            label="Instituição de Ensino"
            type="text"
            placeholder="Nome da universidade/faculdade"
            value={formData?.instituicao || ''}
            onChange={handleChange('instituicao')}
            error={errors?.instituicao}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Curso"
              type="text"
              placeholder="Educação Física, Fisioterapia, etc."
              value={formData?.curso || ''}
              onChange={handleChange('curso')}
              error={errors?.curso}
              required
            />

            <Input
              label="Ano de Conclusão"
              type="number"
              placeholder="2020"
              value={formData?.anoConclusao || ''}
              onChange={handleChange('anoConclusao')}
              error={errors?.anoConclusao}
              min="1990"
              max="2025"
            />
          </div>
        </div>
      </div>
      {/* Specializations */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Icon name="Target" size={20} className="text-accent mr-2" />
          <h4 className="font-semibold text-foreground">Especializações</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {specializations?.map((spec) => (
            <Checkbox
              key={spec}
              label={spec}
              checked={formData?.especializacoes?.includes(spec) || false}
              onChange={(e) => {
                const current = formData?.especializacoes || [];
                const updated = e?.target?.checked
                  ? [...current, spec]
                  : current?.filter(s => s !== spec);
                if (onInputChange) {
                  onInputChange('especializacoes', updated);
                }
              }}
            />
          ))}
        </div>
      </div>
      {/* Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Anos de Experiência"
          type="number"
          placeholder="5"
          value={formData?.anosExperiencia || ''}
          onChange={handleChange('anosExperiencia')}
          error={errors?.anosExperiencia}
          min="0"
          max="50"
        />

        <Input
          label="Valor da Mensalidade (R$)"
          type="number"
          placeholder="200,00"
          value={formData?.valorMensalidade || ''}
          onChange={handleChange('valorMensalidade')}
          error={errors?.valorMensalidade}
          description="Valor sugerido para seus serviços"
          min="50"
          step="10"
        />
      </div>
      {/* Document Upload */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Icon name="Upload" size={20} className="text-warning mr-2" />
          <h4 className="font-semibold text-foreground">Documentos</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Diploma/Certificado
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange('diploma')}
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground mt-1">
              PDF, JPG ou PNG até 5MB
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Carteira CREF
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange('carteiraCref')}
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground mt-1">
              PDF, JPG ou PNG até 5MB
            </p>
          </div>
        </div>
      </div>
      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Apresentação Profissional
        </label>
        <textarea
          placeholder="Conte um pouco sobre sua experiência, metodologia e diferenciais como personal trainer..."
          value={formData?.bio || ''}
          onChange={handleChange('bio')}
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Máximo 500 caracteres
        </p>
      </div>
    </div>
  );
};

export default TrainerCredentialsForm;