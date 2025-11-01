import React from 'react';

import Select from '../../../components/ui/Select';

const categoryOptions = [
  { value: '', label: 'Todas as categorias' },
  { value: 'STRENGTH', label: 'Força' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'FLEXIBILITY', label: 'Flexibilidade' },
  { value: 'MOBILITY', label: 'Mobilidade' },
  { value: 'BALANCE', label: 'Equilíbrio' },
];

const muscleOptions = [
  { value: '', label: 'Todos os grupos' },
  { value: 'CHEST', label: 'Peito' },
  { value: 'BACK', label: 'Costas' },
  { value: 'LEGS', label: 'Pernas' },
  { value: 'ARMS', label: 'Braços' },
  { value: 'CORE', label: 'Core' },
  { value: 'SHOULDERS', label: 'Ombros' },
  { value: 'GLUTES', label: 'Glúteos' },
];

const difficultyOptions = [
  { value: '', label: 'Todas as dificuldades' },
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

const ExerciseFilters = ({ filters, onChange }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Select
        label="Categoria"
        value={filters.category}
        onChange={(value) => onChange({ category: value })}
        options={categoryOptions}
      />
      <Select
        label="Grupo muscular"
        value={filters.muscleGroup}
        onChange={(value) => onChange({ muscleGroup: value })}
        options={muscleOptions}
      />
      <Select
        label="Dificuldade"
        value={filters.difficulty}
        onChange={(value) => onChange({ difficulty: value })}
        options={difficultyOptions}
      />
    </div>
  );
};

export default ExerciseFilters;
