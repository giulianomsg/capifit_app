import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { listClients } from '../../services/clientService';
import { createWorkout } from '../../services/workoutService';
import ExerciseLibraryPanel from './components/ExerciseLibraryPanel';
import WorkoutBuilder from './components/WorkoutBuilder';
import WorkoutMetadata from './components/WorkoutMetadata';
import WorkoutTemplates from './components/WorkoutTemplates';

const INITIAL_BLOCK = {
  id: 'block-main',
  title: 'Bloco principal',
  order: 0,
  exercises: [],
};

const INITIAL_METADATA = {
  title: '',
  clientId: '',
  startDate: '',
  frequency: 'weekly',
  difficulty: 'INTERMEDIATE',
  description: '',
  schedule: [],
  estimatedDuration: 0,
  estimatedCalories: 0,
  isTemplate: false,
};

const DEFAULT_EXERCISE_CONFIG = {
  sets: 3,
  reps: 12,
  restSeconds: 60,
};

const getMutationErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return error?.message ?? 'Não foi possível salvar o treino.';
};

const difficultyOptions = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

const frequencyOptions = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'muscle-group', label: 'Por grupo muscular' },
  { value: 'custom', label: 'Personalizado' },
];

const calculateDuration = (blocks) => {
  const totalSeconds = blocks.reduce((total, block) => {
    return (
      total +
      block.exercises.reduce((acc, exercise) => {
        const workTime = exercise.sets * exercise.reps * 2;
        const restTime = exercise.restSeconds ?? DEFAULT_EXERCISE_CONFIG.restSeconds;
        return acc + workTime + restTime;
      }, 0)
    );
  }, 0);

  return Math.max(0, Math.round(totalSeconds / 60));
};

const calculateCalories = (blocks) => {
  return blocks.reduce((total, block) => {
    return (
      total +
      block.exercises.reduce((acc, exercise) => {
        const calories = exercise.exercise?.caloriesPerSet ?? 6;
        return acc + calories * exercise.sets;
      }, 0)
    );
  }, 0);
};

const CriarTreinos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeView, setActiveView] = useState('builder');
  const [blocks, setBlocks] = useState([INITIAL_BLOCK]);
  const [metadata, setMetadata] = useState(INITIAL_METADATA);
  const [feedback, setFeedback] = useState(null);

  const { data: clientsResponse, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients', 'selector'],
    queryFn: async () => {
      const response = await listClients({ perPage: 100 });
      return response.data ?? [];
    },
  });

  const clients = clientsResponse ?? [];

  const totalExercises = useMemo(
    () => blocks.reduce((acc, block) => acc + block.exercises.length, 0),
    [blocks],
  );

  const computedMetadata = useMemo(() => {
    const estimatedDuration = calculateDuration(blocks);
    const estimatedCalories = calculateCalories(blocks);
    return {
      ...metadata,
      totalExercises,
      estimatedDuration,
      estimatedCalories,
    };
  }, [blocks, metadata, totalExercises]);

  const createWorkoutMutation = useMutation({
    mutationFn: (payload) => createWorkout(payload),
    onSuccess: (workout, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout-summary'] });
      setFeedback({ type: 'success', message: 'Treino salvo com sucesso.' });
      setBlocks([INITIAL_BLOCK]);
      setMetadata(INITIAL_METADATA);
      setActiveView('builder');
      if (!variables?.isTemplate && workout?.id) {
        navigate(`/workout-session-tracking/${workout.id}`);
      }
    },
    onError: (error) => {
      setFeedback({ type: 'error', message: getMutationErrorMessage(error) });
    },
  });

  const handleSidebarToggle = () => setIsSidebarOpen((prev) => !prev);

  const handleAddExercise = (exercise) => {
    setBlocks((prevBlocks) => {
      const next = [...prevBlocks];
      const block = next[0];
      const entry = {
        id: `${exercise.id}-${Date.now()}`,
        exercise,
        sets: DEFAULT_EXERCISE_CONFIG.sets,
        reps: DEFAULT_EXERCISE_CONFIG.reps,
        restSeconds: DEFAULT_EXERCISE_CONFIG.restSeconds,
        order: block.exercises.length,
      };
      block.exercises = [...block.exercises, entry];
      return next;
    });
    setIsLibraryOpen(false);
  };

  const handleUpdateExercise = (exerciseId, updates) => {
    setBlocks((prevBlocks) => {
      return prevBlocks.map((block) => ({
        ...block,
        exercises: block.exercises.map((exercise) =>
          exercise.id === exerciseId ? { ...exercise, ...updates } : exercise,
        ),
      }));
    });
  };

  const handleRemoveExercise = (exerciseId) => {
    setBlocks((prevBlocks) => {
      return prevBlocks.map((block) => ({
        ...block,
        exercises: block.exercises
          .filter((exercise) => exercise.id !== exerciseId)
          .map((exercise, index) => ({ ...exercise, order: index })),
      }));
    });
  };

  const handleReorderExercise = (exerciseId, direction) => {
    setBlocks((prevBlocks) => {
      return prevBlocks.map((block) => {
        const index = block.exercises.findIndex((exercise) => exercise.id === exerciseId);
        if (index === -1) return block;

        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= block.exercises.length) {
          return block;
        }

        const reordered = [...block.exercises];
        const [item] = reordered.splice(index, 1);
        reordered.splice(newIndex, 0, item);

        return {
          ...block,
          exercises: reordered.map((exercise, idx) => ({ ...exercise, order: idx })),
        };
      });
    });
  };

  const handleMetadataChange = (updates) => {
    setMetadata((prev) => ({ ...prev, ...updates }));
    setFeedback(null);
  };

  const buildPayload = (override = {}) => {
    const base = { ...metadata, ...override };

    if (!base.title?.trim()) {
      throw new Error('Informe um nome para o treino.');
    }

    if (!base.isTemplate && !base.clientId) {
      throw new Error('Selecione um cliente para o treino.');
    }

    if (totalExercises === 0) {
      throw new Error('Adicione ao menos um exercício ao treino.');
    }

    return {
      title: base.title,
      description: base.description || undefined,
      difficulty: base.difficulty,
      status: base.isTemplate ? 'DRAFT' : 'ACTIVE',
      frequency: base.frequency,
      schedule: base.schedule,
      startDate: base.startDate || undefined,
      estimatedDuration: computedMetadata.estimatedDuration,
      estimatedCalories: computedMetadata.estimatedCalories,
      isTemplate: Boolean(base.isTemplate),
      clientId: base.isTemplate ? undefined : base.clientId,
      blocks: blocks.map((block) => ({
        title: block.title,
        order: block.order,
        exercises: block.exercises.map((exercise, index) => ({
          exerciseId: exercise.exercise.id,
          order: index,
          sets: Number(exercise.sets) || DEFAULT_EXERCISE_CONFIG.sets,
          reps: Number(exercise.reps) || DEFAULT_EXERCISE_CONFIG.reps,
          restSeconds: Number(exercise.restSeconds) || DEFAULT_EXERCISE_CONFIG.restSeconds,
        })),
      })),
    };
  };

  const handleSave = async (asTemplate = false) => {
    try {
      const payload = buildPayload({ isTemplate: asTemplate });
      await createWorkoutMutation.mutateAsync(payload);
    } catch (error) {
      setFeedback({ type: 'error', message: getMutationErrorMessage(error) });
    }
  };

  const handleLoadTemplate = (template) => {
    const nextBlocks = template.blocks.map((block) => ({
      id: block.id,
      title: block.title,
      order: block.order,
      exercises: block.exercises.map((exercise) => ({
        id: `${exercise.exercise.id}-${Date.now()}`,
        exercise: exercise.exercise,
        sets: exercise.sets,
        reps: exercise.reps,
        restSeconds: exercise.restSeconds ?? DEFAULT_EXERCISE_CONFIG.restSeconds,
        order: exercise.order,
      })),
    }));

    setBlocks(nextBlocks.length > 0 ? nextBlocks : [INITIAL_BLOCK]);
    setMetadata((prev) => ({
      ...prev,
      title: template.title,
      description: template.description ?? '',
      difficulty: template.difficulty,
      schedule: template.schedule ?? [],
      frequency: template.frequency ?? 'weekly',
      estimatedDuration: template.estimatedDuration ?? 0,
      estimatedCalories: template.estimatedCalories ?? 0,
      isTemplate: false,
    }));
    setFeedback({ type: 'success', message: 'Template carregado. Personalize e salve para seu aluno.' });
    setActiveView('builder');
  };

  const viewTitle = useMemo(() => {
    if (activeView === 'metadata') return 'Informações do Treino';
    if (activeView === 'templates') return 'Templates Salvos';
    return 'Construtor de Treino';
  }, [activeView]);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={handleSidebarToggle} isMenuOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{viewTitle}</h1>
              <p className="text-muted-foreground">
                Organize os exercícios, defina metas e compartilhe com seus alunos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant={activeView === 'builder' ? 'default' : 'outline'} onClick={() => setActiveView('builder')}>
                Construtor
              </Button>
              <Button variant={activeView === 'metadata' ? 'default' : 'outline'} onClick={() => setActiveView('metadata')}>
                Informações
              </Button>
              <Button variant={activeView === 'templates' ? 'default' : 'outline'} onClick={() => setActiveView('templates')}>
                Templates
              </Button>
            </div>
          </div>

          {feedback && (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-red-400 bg-red-50 text-red-700'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <section className="xl:col-span-3 space-y-6">
              {activeView === 'builder' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <WorkoutBuilder
                      blocks={blocks}
                      onUpdateExercise={handleUpdateExercise}
                      onRemoveExercise={handleRemoveExercise}
                      onReorderExercise={handleReorderExercise}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <WorkoutMetadata
                      metadata={computedMetadata}
                      clients={clients}
                      clientsLoading={isLoadingClients}
                      difficultyOptions={difficultyOptions}
                      frequencyOptions={frequencyOptions}
                      onUpdate={handleMetadataChange}
                      onSaveWorkout={() => handleSave(false)}
                      onSaveTemplate={() => handleSave(true)}
                      isSaving={createWorkoutMutation.isPending}
                    />
                  </div>
                </div>
              )}

              {activeView === 'metadata' && (
                <WorkoutMetadata
                  metadata={computedMetadata}
                  clients={clients}
                  clientsLoading={isLoadingClients}
                  difficultyOptions={difficultyOptions}
                  frequencyOptions={frequencyOptions}
                  onUpdate={handleMetadataChange}
                  onSaveWorkout={() => handleSave(false)}
                  onSaveTemplate={() => handleSave(true)}
                  isSaving={createWorkoutMutation.isPending}
                  showExtended
                />
              )}

              {activeView === 'templates' && (
                <WorkoutTemplates onApplyTemplate={handleLoadTemplate} />
              )}
            </section>

            <aside className="xl:col-span-1">
              <ExerciseLibraryPanel
                isOpen={isLibraryOpen || activeView === 'builder'}
                onToggle={() => setIsLibraryOpen((prev) => !prev)}
                onAddExercise={handleAddExercise}
              />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CriarTreinos;
