import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import ExerciseFilters from './components/ExerciseFilters';
import ExerciseStats from './components/ExerciseStats';
import ExerciseTable from './components/ExerciseTable';
import ExerciseDetailsModal from './components/ExerciseDetailsModal';
import AddCustomExerciseModal from './components/AddCustomExerciseModal';
import { listExercises, createExercise } from '../../services/exerciseService';

const defaultFilters = {
  search: '',
  category: '',
  muscleGroup: '',
  difficulty: '',
};

const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  return error?.message ?? 'Não foi possível carregar os exercícios.';
};

const ExerciseLibrary = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [viewMode, setViewMode] = useState('table');
  const [page, setPage] = useState(1);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [listError, setListError] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['exercise-library', { ...filters, page }],
    queryFn: () =>
      listExercises({
        search: filters.search.trim() || undefined,
        category: filters.category || undefined,
        muscleGroup: filters.muscleGroup || undefined,
        difficulty: filters.difficulty || undefined,
        page,
        perPage: 12,
      }),
    keepPreviousData: true,
    retry: 1,
    onSuccess: () => {
      setListError(null);
    },
    onError: (err) => {
      setListError(getErrorMessage(err));
    },
  });

  const createExerciseMutation = useMutation({
    mutationFn: (payload) => createExercise(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-library'] });
      setShowCreateModal(false);
      setFeedback({ type: 'success', message: 'Exercício cadastrado com sucesso.' });
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    },
  });

  const exercises = data?.data ?? [];
  const pagination = data?.pagination;

  const stats = useMemo(() => {
    const byDifficulty = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 };
    const byCategory = {};
    exercises.forEach((exercise) => {
      if (exercise.difficulty in byDifficulty) {
        byDifficulty[exercise.difficulty] += 1;
      }
      byCategory[exercise.category] = (byCategory[exercise.category] ?? 0) + 1;
    });
    return { byDifficulty, byCategory };
  }, [exercises]);

  const handleFilterChange = (partial) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
    setFeedback(null);
    setListError(null);
  };

  const handleSearch = (event) => {
    handleFilterChange({ search: event.target.value });
  };

  const canLoadMore = pagination ? pagination.page < pagination.totalPages : false;

  const handleCreateExercise = async (payload) => {
    await createExerciseMutation.mutateAsync(payload);
  };

  const showPaginationSpinner = isFetching && !isLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} isMenuOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Biblioteca de exercícios</h1>
              <p className="text-muted-foreground">
                Explore e cadastre exercícios reais para montar treinos personalizados.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant={viewMode === 'table' ? 'default' : 'outline'} onClick={() => setViewMode('table')}>
                Tabela
              </Button>
              <Button variant={viewMode === 'cards' ? 'default' : 'outline'} onClick={() => setViewMode('cards')}>
                Cards
              </Button>
              <Button iconName="Plus" onClick={() => setShowCreateModal(true)}>
                Novo exercício
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

          {listError && (
            <div className="rounded-md border border-red-400 bg-red-50 text-red-700 px-4 py-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Icon name="AlertTriangle" size={16} /> {listError}
              </span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Input
              type="search"
              placeholder="Buscar por nome ou descrição"
              value={filters.search}
              onChange={handleSearch}
            />
            <ExerciseStats stats={stats} total={pagination?.total ?? exercises.length} />
          </div>

          <ExerciseFilters filters={filters} onChange={handleFilterChange} />

          <ExerciseTable
            exercises={exercises}
            viewMode={viewMode}
            isLoading={isLoading}
            isRefreshing={showPaginationSpinner}
            onViewExercise={(exercise) => setSelectedExercise(exercise)}
          />

          <div className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-card">
            <span className="text-xs text-muted-foreground">
              Página {pagination?.page ?? 1} de {pagination?.totalPages ?? 1}
            </span>
            <div className="flex gap-2 items-center">
              {showPaginationSpinner && <Icon name="Loader2" className="animate-spin text-muted-foreground" />}
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
        </div>
      </main>

      <ExerciseDetailsModal
        exercise={selectedExercise}
        open={Boolean(selectedExercise)}
        onClose={() => setSelectedExercise(null)}
      />

      <AddCustomExerciseModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateExercise}
        isSubmitting={createExerciseMutation.isPending}
      />
    </div>
  );
};

export default ExerciseLibrary;
