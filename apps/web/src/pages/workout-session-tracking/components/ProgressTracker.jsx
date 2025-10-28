import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressTracker = ({ exercises, currentExercise, completedSets, totalSets }) => {
  const overallProgress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="BarChart3" size={20} className="mr-2" />
          Progresso do Treino
        </h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">
            {Math.round(overallProgress)}%
          </p>
          <p className="text-xs text-muted-foreground">Completo</p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progresso Geral</span>
          <span className="text-sm text-muted-foreground">{completedSets}/{totalSets} séries</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Exercise Progress List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Exercícios</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {exercises?.map((exercise, index) => {
            const isCompleted = exercise?.completed?.length === exercise?.sets;
            const isCurrent = index === currentExercise;
            const exerciseProgress = exercise?.sets > 0 ? (exercise?.completed?.length / exercise?.sets) * 100 : 0;
            
            return (
              <div
                key={exercise?.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  isCurrent 
                    ? 'bg-primary/5 border-primary/20 ring-2 ring-primary/10' 
                    : isCompleted 
                    ? 'bg-success/5 border-success/20' :'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {isCompleted ? (
                      <Icon name="CheckCircle" size={16} className="text-success" />
                    ) : isCurrent ? (
                      <Icon name="Play" size={16} className="text-primary" />
                    ) : (
                      <Icon name="Circle" size={16} className="text-muted-foreground" />
                    )}
                    
                    <span className={`text-sm font-medium ${
                      isCurrent ? 'text-primary' : 
                      isCompleted ? 'text-success' : 'text-foreground'
                    }`}>
                      {exercise?.name}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {exercise?.completed?.length}/{exercise?.sets}
                    </p>
                  </div>
                </div>

                {/* Exercise Progress Bar */}
                <div className="w-full bg-muted/50 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-success' : isCurrent ?'bg-primary' : 'bg-muted-foreground'
                    }`}
                    style={{ width: `${exerciseProgress}%` }}
                  />
                </div>

                {/* Exercise Details */}
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{exercise?.sets} séries × {exercise?.reps}</span>
                  <span>{exercise?.weight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Statistics */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">{exercises?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Exercícios</p>
          </div>
          <div>
            <p className="text-lg font-bold text-success">{completedSets}</p>
            <p className="text-xs text-muted-foreground">Séries Feitas</p>
          </div>
          <div>
            <p className="text-lg font-bold text-muted-foreground">{totalSets - completedSets}</p>
            <p className="text-xs text-muted-foreground">Restantes</p>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {overallProgress >= 50 && overallProgress < 100 && (
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
          <p className="text-sm font-medium text-primary">
            🔥 Ótimo trabalho! Você já passou da metade!
          </p>
        </div>
      )}

      {overallProgress === 100 && (
        <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg text-center">
          <p className="text-sm font-medium text-success">
            🎉 Parabéns! Treino 100% concluído!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;