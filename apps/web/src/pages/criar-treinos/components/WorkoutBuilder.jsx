import React from 'react';

import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const categoryLabel = {
  STRENGTH: 'Força',
  CARDIO: 'Cardio',
  FLEXIBILITY: 'Flexibilidade',
  MOBILITY: 'Mobilidade',
  BALANCE: 'Equilíbrio',
};

const muscleLabel = {
  CHEST: 'Peito',
  BACK: 'Costas',
  SHOULDERS: 'Ombros',
  LEGS: 'Pernas',
  ARMS: 'Braços',
  CORE: 'Core',
  FULL_BODY: 'Corpo inteiro',
  GLUTES: 'Glúteos',
  OTHER: 'Outros',
};

const WorkoutBuilder = ({ blocks, onUpdateExercise, onRemoveExercise, onReorderExercise }) => {
  const renderExercise = (exercise, index, block) => (
    <div key={exercise.id} className="bg-muted/40 border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onReorderExercise(exercise.id, -1)}
              disabled={index === 0}
              className="h-6 w-6"
            >
              <Icon name="ChevronUp" size={16} />
            </Button>
            <span className="text-xs font-medium text-foreground mt-1">{index + 1}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onReorderExercise(exercise.id, 1)}
              disabled={index === block.exercises.length - 1}
              className="h-6 w-6"
            >
              <Icon name="ChevronDown" size={16} />
            </Button>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{exercise.exercise.name}</h3>
            <p className="text-xs text-muted-foreground">
              {categoryLabel[exercise.exercise.category] ?? exercise.exercise.category} •{' '}
              {muscleLabel[exercise.exercise.primaryMuscle] ?? exercise.exercise.primaryMuscle}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onRemoveExercise(exercise.id)}
        >
          <Icon name="Trash2" size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input
          type="number"
          label="Séries"
          min={1}
          value={exercise.sets}
          onChange={(event) => onUpdateExercise(exercise.id, { sets: Number(event.target.value) })}
        />
        <Input
          type="number"
          label="Repetições"
          min={1}
          value={exercise.reps}
          onChange={(event) => onUpdateExercise(exercise.id, { reps: Number(event.target.value) })}
        />
        <Input
          type="number"
          label="Descanso (s)"
          min={0}
          value={exercise.restSeconds}
          onChange={(event) => onUpdateExercise(exercise.id, { restSeconds: Number(event.target.value) })}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-6">
      {blocks.map((block) => (
        <section key={block.id} className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{block.title}</h2>
              <p className="text-sm text-muted-foreground">
                Configure os parâmetros de cada exercício e personalize conforme o aluno.
              </p>
            </div>
          </header>

          {block.exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Icon name="Plus" size={24} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Comece adicionando exercícios</h3>
                <p className="text-sm text-muted-foreground">
                  Utilize a biblioteca ao lado para incluir exercícios no plano.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {block.exercises.map((exercise, index) => renderExercise(exercise, index, block))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
};

export default WorkoutBuilder;
