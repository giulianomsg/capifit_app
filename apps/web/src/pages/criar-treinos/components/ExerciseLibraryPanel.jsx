import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { listExercises } from '../../../services/exerciseService';

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

const difficultyLabel = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

const difficultyColor = {
  BEGINNER: 'text-success',
  INTERMEDIATE: 'text-warning',
  ADVANCED: 'text-destructive',
};

const categoryLabel = Object.fromEntries(categoryOptions.filter((option) => option.value).map((option) => [option.value, option.label]));
const muscleLabel = Object.fromEntries(muscleOptions.filter((option) => option.value).map((option) => [option.value, option.label]));

const ExerciseLibraryPanel = ({ isOpen, onToggle, onAddExercise }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['exercises', { search, category, muscleGroup, difficulty, page }],
    queryFn: () =>
      listExercises({
        search: search.trim() || undefined,
        category: category || undefined,
        muscleGroup: muscleGroup || undefined,
        difficulty: difficulty || undefined,
        page,
        perPage: 10,
      }),
    keepPreviousData: true,
  });

  const exercises = data?.data ?? [];
  const pagination = data?.pagination;

  const canLoadMore = useMemo(() => {
    if (!pagination) return false;
    return pagination.page < pagination.totalPages;
  }, [pagination]);

  const resetPage = () => setPage(1);

  const handleAdd = (exercise) => {
    onAddExercise(exercise);
  };

  return (
    <div className={`bg-card border border-border rounded-lg flex flex-col ${isOpen ? 'block' : 'hidden lg:block'}`}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Biblioteca de exercícios</h2>
          <p className="text-sm text-muted-foreground">
            Busque exercícios reais cadastrados na plataforma.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden">
          <Icon name="X" size={18} />
        </Button>
      </div>

      <div className="p-4 space-y-3 border-b border-border">
        <Input
          type="search"
          placeholder="Buscar por nome ou instruções"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            resetPage();
          }}
        />
        <Select
          value={category}
          onChange={(value) => {
            setCategory(value);
            resetPage();
          }}
          options={categoryOptions}
        />
        <Select
          value={muscleGroup}
          onChange={(value) => {
            setMuscleGroup(value);
            resetPage();
          }}
          options={muscleOptions}
        />
        <Select
          value={difficulty}
          onChange={(value) => {
            setDifficulty(value);
            resetPage();
          }}
          options={difficultyOptions}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <span className="flex items-center gap-2 text-sm">
              <Icon name="Loader2" className="animate-spin" /> Carregando exercícios...
            </span>
          </div>
        ) : exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-6">
            <Icon name="Search" size={32} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum exercício encontrado com os filtros selecionados.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {exercises.map((exercise) => (
              <li key={exercise.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Image
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{exercise.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {categoryLabel[exercise.category] ?? exercise.category}{' '}
                          • {muscleLabel[exercise.primaryMuscle] ?? exercise.primaryMuscle}
                        </p>
                      </div>
                      <span className={`text-xs font-medium ${difficultyColor[exercise.difficulty]}`}>
                        {difficultyLabel[exercise.difficulty]}
                      </span>
                    </div>
                    {exercise.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {exercise.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {exercise.caloriesPerSet && (
                      <span className="flex items-center gap-1">
                        <Icon name="Flame" size={14} />
                        {exercise.caloriesPerSet} kcal / série
                      </span>
                    )}
                    {exercise.videoUrl && (
                      <a
                        href={exercise.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Icon name="Play" size={14} /> Vídeo
                      </a>
                    )}
                  </div>
                  <Button size="sm" onClick={() => handleAdd(exercise)}>
                    Adicionar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Página {pagination?.page ?? 1} de {pagination?.totalPages ?? 1}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canLoadMore || isFetching}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibraryPanel;
