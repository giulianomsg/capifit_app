import React from 'react';
import Select from '../../../components/ui/Select';

const ExerciseFilters = ({
  selectedCategory,
  selectedMuscleGroup,
  selectedDifficulty,
  selectedEquipment,
  onCategoryChange,
  onMuscleGroupChange,
  onDifficultyChange,
  onEquipmentChange,
  filterOptions
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Select
        label="Categoria"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e?.target?.value)}
        options={[
          { value: 'all', label: 'Todas as categorias' },
          ...filterOptions?.categories?.map(cat => ({ value: cat, label: cat }))
        ]}
      />

      <Select
        label="Grupo Muscular"
        value={selectedMuscleGroup}
        onChange={(e) => onMuscleGroupChange(e?.target?.value)}
        options={[
          { value: 'all', label: 'Todos os grupos' },
          ...filterOptions?.muscleGroups?.map(group => ({ value: group, label: group }))
        ]}
      />

      <Select
        label="Dificuldade"
        value={selectedDifficulty}
        onChange={(e) => onDifficultyChange(e?.target?.value)}
        options={[
          { value: 'all', label: 'Todas as dificuldades' },
          ...filterOptions?.difficulties?.map(diff => ({ value: diff, label: diff }))
        ]}
      />

      <Select
        label="Equipamento"
        value={selectedEquipment}
        onChange={(e) => onEquipmentChange(e?.target?.value)}
        options={[
          { value: 'all', label: 'Todos os equipamentos' },
          ...filterOptions?.equipment?.map(eq => ({ value: eq, label: eq }))
        ]}
      />
    </div>
  );
};

export default ExerciseFilters;