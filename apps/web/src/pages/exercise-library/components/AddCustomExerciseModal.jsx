import React, { useEffect, useState } from 'react';

import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const categoryOptions = [
  { value: 'STRENGTH', label: 'Força' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'FLEXIBILITY', label: 'Flexibilidade' },
  { value: 'MOBILITY', label: 'Mobilidade' },
  { value: 'BALANCE', label: 'Equilíbrio' },
];

const muscleOptions = [
  { value: 'CHEST', label: 'Peito' },
  { value: 'BACK', label: 'Costas' },
  { value: 'LEGS', label: 'Pernas' },
  { value: 'ARMS', label: 'Braços' },
  { value: 'CORE', label: 'Core' },
  { value: 'SHOULDERS', label: 'Ombros' },
  { value: 'GLUTES', label: 'Glúteos' },
  { value: 'FULL_BODY', label: 'Corpo inteiro' },
];

const difficultyOptions = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

const initialFormState = {
  name: '',
  category: 'STRENGTH',
  primaryMuscle: 'CHEST',
  secondaryMuscle: '',
  equipment: '',
  difficulty: 'INTERMEDIATE',
  description: '',
  instructions: '',
  videoUrl: '',
  imageUrl: '',
  caloriesPerSet: '',
};

const extractErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  return error?.message ?? 'Não foi possível salvar o exercício.';
};

const AddCustomExerciseModal = ({ open, onClose, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(initialFormState);
      setError(null);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleChange = (field) => (eventOrValue) => {
    if (typeof eventOrValue === 'string') {
      setForm((prev) => ({ ...prev, [field]: eventOrValue }));
      return;
    }

    const { value } = eventOrValue.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Informe o nome do exercício.');
      return;
    }
    if (!form.instructions.trim()) {
      setError('Adicione instruções para execução.');
      return;
    }

    const caloriesValue = form.caloriesPerSet === '' ? undefined : Number(form.caloriesPerSet);
    if (caloriesValue !== undefined) {
      if (!Number.isFinite(caloriesValue) || caloriesValue < 0) {
        setError('Calorias por série deve ser um número positivo.');
        return;
      }
    }

    const payload = {
      name: form.name,
      category: form.category,
      primaryMuscle: form.primaryMuscle,
      secondaryMuscle: form.secondaryMuscle || undefined,
      equipment: form.equipment || undefined,
      difficulty: form.difficulty,
      description: form.description || undefined,
      instructions: form.instructions,
      videoUrl: form.videoUrl || undefined,
      imageUrl: form.imageUrl || undefined,
      caloriesPerSet: caloriesValue !== undefined ? Math.round(caloriesValue) : undefined,
    };

    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(extractErrorMessage(submitError));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg max-w-2xl w-full mx-4 shadow-xl">
        <header className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Adicionar exercício personalizado</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar modal">
            <Icon name="X" size={18} />
          </Button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Input
            label="Nome do exercício"
            value={form.name}
            onChange={handleChange('name')}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Categoria"
              value={form.category}
              onChange={handleChange('category')}
              options={categoryOptions}
            />
            <Select
              label="Grupo muscular principal"
              value={form.primaryMuscle}
              onChange={handleChange('primaryMuscle')}
              options={muscleOptions}
            />
            <Select
              label="Grupo muscular secundário"
              value={form.secondaryMuscle}
              onChange={handleChange('secondaryMuscle')}
              options={[{ value: '', label: 'Nenhum' }, ...muscleOptions]}
            />
            <Select
              label="Dificuldade"
              value={form.difficulty}
              onChange={handleChange('difficulty')}
              options={difficultyOptions}
            />
          </div>
          <Input
            label="Equipamento"
            placeholder="Ex: Halteres, barra, peso corporal"
            value={form.equipment}
            onChange={handleChange('equipment')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="URL da imagem"
              value={form.imageUrl}
              onChange={handleChange('imageUrl')}
              placeholder="https://..."
            />
            <Input
              label="URL do vídeo"
              value={form.videoUrl}
              onChange={handleChange('videoUrl')}
              placeholder="https://..."
            />
          </div>
          <Input
            label="Calorias por série (opcional)"
            type="number"
            min={0}
            value={form.caloriesPerSet}
            onChange={handleChange('caloriesPerSet')}
          />
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Descrição</label>
            <textarea
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Contextualize o exercício, principais benefícios e cuidados."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Instruções de execução*</label>
            <textarea
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              value={form.instructions}
              onChange={handleChange('instructions')}
              required
              placeholder="Descreva passo a passo como o exercício deve ser realizado."
            />
          </div>

          <footer className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar exercício'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddCustomExerciseModal;
