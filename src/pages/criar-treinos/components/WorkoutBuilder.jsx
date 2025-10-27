import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';


const WorkoutBuilder = ({ exercises, onUpdateExercise, onRemoveExercise, onReorderExercises }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e?.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorderExercises(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleExerciseUpdate = (index, field, value) => {
    onUpdateExercise(index, { [field]: value });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Iniciante': return 'text-success';
      case 'Intermediário': return 'text-warning';
      case 'Avançado': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cardio': return 'Heart';
      case 'força': return 'Dumbbell';
      case 'flexibilidade': return 'Zap';
      default: return 'Activity';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Construtor de Treino</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={16} />
            <span>
              {exercises?.length > 0 
                ? `${Math.ceil(exercises?.reduce((total, ex) => total + (ex?.series * ex?.repeticoes * 3) + ex?.tempoDescanso, 0) / 60)} min estimados`
                : '0 min'
              }
            </span>
          </div>
        </div>
        
        {exercises?.length > 0 && (
          <div className="mt-3 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Icon name="Target" size={14} className="text-primary" />
              <span className="text-muted-foreground">
                {exercises?.length} exercício{exercises?.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Zap" size={14} className="text-accent" />
              <span className="text-muted-foreground">
                ~{exercises?.reduce((total, ex) => total + (ex?.calorias * ex?.series), 0)} cal
              </span>
            </div>
          </div>
        )}
      </div>
      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4">
        {exercises?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Icon name="Plus" size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Comece adicionando exercícios
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Selecione exercícios da biblioteca ao lado para construir seu treino personalizado
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises?.map((exercise, index) => (
              <div
                key={`${exercise?.id}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  bg-muted/30 rounded-lg p-4 border-2 border-transparent
                  hover:border-primary/20 transition-all cursor-move
                  ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                `}
              >
                {/* Exercise Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      <Icon name="GripVertical" size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-foreground">{exercise?.nome}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1">
                          <Icon 
                            name={getCategoryIcon(exercise?.categoria)} 
                            size={14} 
                            className="text-primary"
                          />
                          <span className="text-xs text-muted-foreground capitalize">
                            {exercise?.categoria}
                          </span>
                        </div>
                        <span className={`text-xs font-medium ${getDifficultyColor(exercise?.dificuldade)}`}>
                          {exercise?.dificuldade}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveExercise(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>

                {/* Exercise Parameters */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Séries
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={exercise?.series}
                      onChange={(e) => handleExerciseUpdate(index, 'series', parseInt(e?.target?.value) || 1)}
                      className="text-center"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Repetições
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={exercise?.repeticoes}
                      onChange={(e) => handleExerciseUpdate(index, 'repeticoes', parseInt(e?.target?.value) || 1)}
                      className="text-center"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Peso (kg)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={exercise?.peso}
                      onChange={(e) => handleExerciseUpdate(index, 'peso', parseFloat(e?.target?.value) || 0)}
                      className="text-center"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Descanso (seg)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="15"
                      value={exercise?.tempoDescanso}
                      onChange={(e) => handleExerciseUpdate(index, 'tempoDescanso', parseInt(e?.target?.value) || 0)}
                      className="text-center"
                    />
                  </div>
                </div>

                {/* Exercise Summary */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-muted-foreground">
                        Volume: <span className="font-medium text-foreground">
                          {exercise?.series} × {exercise?.repeticoes}
                          {exercise?.peso > 0 && ` × ${exercise?.peso}kg`}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Descanso: <span className="font-medium text-foreground">
                          {formatTime(exercise?.tempoDescanso)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-accent">
                      <Icon name="Zap" size={14} />
                      <span className="font-medium">
                        {exercise?.calorias * exercise?.series} cal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="mt-3">
                  <Input
                    placeholder="Observações para este exercício..."
                    value={exercise?.observacoes || ''}
                    onChange={(e) => handleExerciseUpdate(index, 'observacoes', e?.target?.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Footer Actions */}
      {exercises?.length > 0 && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Total: {exercises?.length} exercício{exercises?.length !== 1 ? 's' : ''} • 
              ~{Math.ceil(exercises?.reduce((total, ex) => total + (ex?.series * ex?.repeticoes * 3) + ex?.tempoDescanso, 0) / 60)} min
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Clear all exercises
                  exercises?.forEach((_, index) => onRemoveExercise(0));
                }}
                iconName="Trash2"
                iconPosition="left"
              >
                Limpar Tudo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutBuilder;