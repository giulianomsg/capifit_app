import React from 'react';

import AppImage from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const difficultyBadge = {
  BEGINNER: 'bg-emerald-100 text-emerald-700',
  INTERMEDIATE: 'bg-amber-100 text-amber-700',
  ADVANCED: 'bg-rose-100 text-rose-700',
};

const difficultyLabel = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

const ExerciseTable = ({ exercises, viewMode, isLoading, onViewExercise, isRefreshing }) => {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 flex items-center justify-center text-muted-foreground">
        <span className="flex items-center gap-2 text-sm">
          <Icon name="Loader2" className="animate-spin" /> Carregando exercícios...
        </span>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center space-y-3">
        <Icon name="Search" size={32} className="mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nenhum exercício encontrado com os filtros atuais.
        </p>
      </div>
    );
  }

  if (viewMode === 'cards') {
    return (
      <div className="relative">
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/60 dark:bg-background/60 flex items-center justify-center rounded-lg z-10">
            <Icon name="Loader2" className="animate-spin text-muted-foreground" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="h-40 bg-muted">
                <AppImage
                  src={exercise.imageUrl || '/assets/images/no_image.png'}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{exercise.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {exercise.category.toLowerCase()} • {exercise.primaryMuscle.toLowerCase()}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyBadge[exercise.difficulty]}`}>
                    {difficultyLabel[exercise.difficulty] ?? exercise.difficulty}
                  </span>
                </div>
                {exercise.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{exercise.description}</p>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={() => onViewExercise(exercise)}>
                  Ver detalhes
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-card border border-border rounded-lg overflow-hidden">
      {isRefreshing && (
        <div className="absolute inset-0 bg-white/60 dark:bg-background/60 flex items-center justify-center z-10">
          <Icon name="Loader2" className="animate-spin text-muted-foreground" />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-muted/50 text-sm text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Exercício</th>
              <th className="text-left px-4 py-3">Categoria</th>
              <th className="text-left px-4 py-3">Grupo muscular</th>
              <th className="text-left px-4 py-3">Dificuldade</th>
              <th className="text-left px-4 py-3">Calorias</th>
              <th className="text-left px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {exercises.map((exercise) => (
              <tr key={exercise.id} className="text-sm">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <AppImage
                      src={exercise.imageUrl || '/assets/images/no_image.png'}
                      alt={exercise.name}
                      className="w-12 h-12 rounded-md object-cover border border-border"
                    />
                    <div>
                      <p className="font-medium text-foreground">{exercise.name}</p>
                      {exercise.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{exercise.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{exercise.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{exercise.primaryMuscle}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyBadge[exercise.difficulty]}`}>
                    {difficultyLabel[exercise.difficulty] ?? exercise.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {exercise.caloriesPerSet ? `${exercise.caloriesPerSet} kcal` : '—'}
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" onClick={() => onViewExercise(exercise)}>
                    Detalhes
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExerciseTable;
