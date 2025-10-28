import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SetLogger = ({ exercise, onSetComplete, sessionStatus }) => {
  const [currentSet, setCurrentSet] = useState({
    reps: exercise?.reps?.split('-')?.[0] || '10',
    weight: exercise?.weight?.replace(/[^\d.]/g, '') || '0',
    notes: ''
  });
  
  const [isLogging, setIsLogging] = useState(false);

  const handleInputChange = (field, value) => {
    setCurrentSet(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCompleteSet = async () => {
    if (!currentSet?.reps || !currentSet?.weight) return;
    
    setIsLogging(true);
    
    // Simulate API call delay
    setTimeout(() => {
      onSetComplete(currentSet);
      
      // Auto-increment weight for next set (optional)
      const nextWeight = parseFloat(currentSet?.weight) + 0.5;
      setCurrentSet(prev => ({
        ...prev,
        weight: nextWeight?.toString(),
        notes: ''
      }));
      
      setIsLogging(false);
    }, 500);
  };

  const completedSets = exercise?.completed?.length || 0;
  const totalSets = exercise?.sets || 0;
  const remainingSets = totalSets - completedSets;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="Target" size={20} className="mr-2" />
          Registrar Série
        </h4>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">
            {completedSets + 1} / {totalSets}
          </p>
          <p className="text-xs text-muted-foreground">
            {remainingSets} série{remainingSets !== 1 ? 's' : ''} restante{remainingSets !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      {/* Completed Sets History */}
      {completedSets > 0 && (
        <div className="mb-6">
          <h5 className="text-sm font-medium text-foreground mb-3">Séries Completadas</h5>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {exercise?.completed?.map((set, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                <span className="font-medium">Série {set?.setNumber}</span>
                <div className="flex items-center space-x-4">
                  <span>{set?.reps} reps</span>
                  <span>{set?.weight}kg</span>
                  <Icon name="CheckCircle" size={16} className="text-success" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Current Set Input */}
      {remainingSets > 0 && sessionStatus === 'active' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Repetitions */}
            <Input
              label="Repetições"
              type="number"
              min="1"
              max="100"
              value={currentSet?.reps}
              onChange={(e) => handleInputChange('reps', e?.target?.value)}
              placeholder="Ex: 12"
              disabled={isLogging}
            />

            {/* Weight */}
            <Input
              label="Peso (kg)"
              type="number"
              step="0.5"
              min="0"
              value={currentSet?.weight}
              onChange={(e) => handleInputChange('weight', e?.target?.value)}
              placeholder="Ex: 20.5"
              disabled={isLogging}
            />
          </div>

          {/* Notes */}
          <Input
            label="Observações (opcional)"
            type="text"
            value={currentSet?.notes}
            onChange={(e) => handleInputChange('notes', e?.target?.value)}
            placeholder="Ex: Série pesada, senti dificuldade"
            disabled={isLogging}
          />

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInputChange('reps', (parseInt(currentSet?.reps) - 1)?.toString())}
              disabled={isLogging || parseInt(currentSet?.reps) <= 1}
              iconName="Minus"
            >
              -1 Rep
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInputChange('reps', (parseInt(currentSet?.reps) + 1)?.toString())}
              disabled={isLogging}
              iconName="Plus"
            >
              +1 Rep
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInputChange('weight', (parseFloat(currentSet?.weight) + 1.25)?.toString())}
              disabled={isLogging}
              iconName="Plus"
            >
              +1.25kg
            </Button>
          </div>

          {/* Complete Set Button */}
          <Button
            onClick={handleCompleteSet}
            disabled={!currentSet?.reps || !currentSet?.weight || isLogging}
            loading={isLogging}
            size="lg"
            fullWidth
            iconName="CheckCircle"
            iconPosition="left"
          >
            {isLogging ? 'Registrando...' : `Completar Série ${completedSets + 1}`}
          </Button>

          {/* Alternative Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              iconName="SkipForward"
              iconPosition="left"
              disabled={isLogging}
            >
              Pular Série
            </Button>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              iconName="RotateCcw"
              iconPosition="left"
              disabled={isLogging}
            >
              Falha
            </Button>
          </div>
        </div>
      )}
      {/* Exercise Completed Message */}
      {remainingSets === 0 && (
        <div className="text-center p-6 bg-success/5 border border-success/20 rounded-lg">
          <Icon name="CheckCircle" size={48} className="mx-auto text-success mb-4" />
          <h5 className="text-lg font-semibold text-foreground mb-2">
            Exercício Concluído! 🎉
          </h5>
          <p className="text-sm text-muted-foreground">
            Parabéns! Todas as {totalSets} séries foram completadas.
          </p>
        </div>
      )}
      {/* Session Paused Message */}
      {sessionStatus === 'paused' && (
        <div className="text-center p-4 bg-warning/5 border border-warning/20 rounded-lg">
          <Icon name="Pause" size={24} className="mx-auto text-warning mb-2" />
          <p className="text-sm text-muted-foreground">
            Sessão pausada. Continue para registrar séries.
          </p>
        </div>
      )}
    </div>
  );
};

export default SetLogger;