import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RestTimer = ({ timeRemaining, onSkip }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const formatTime = () => {
    return `${minutes?.toString()?.padStart(2, '0')}:${seconds?.toString()?.padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    // Assume default rest time of 90 seconds for progress calculation
    const totalRestTime = 90;
    return ((totalRestTime - timeRemaining) / totalRestTime) * 100;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 10) return 'text-destructive';
    if (timeRemaining <= 30) return 'text-warning';
    return 'text-primary';
  };

  const getBackgroundColor = () => {
    if (timeRemaining <= 10) return 'bg-destructive/5 border-destructive/20';
    if (timeRemaining <= 30) return 'bg-warning/5 border-warning/20';
    return 'bg-primary/5 border-primary/20';
  };

  return (
    <div className={`border rounded-lg p-6 ${getBackgroundColor()}`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Icon name="Timer" size={24} className={getTimeColor()} />
          <h4 className="text-lg font-semibold text-foreground ml-2">
            Tempo de Descanso
          </h4>
        </div>

        {/* Timer Display */}
        <div className="mb-6">
          <p className={`text-5xl font-bold font-mono ${getTimeColor()}`}>
            {formatTime()}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {timeRemaining <= 10 ? 'Quase lá!' : 'Descanse e hidrate-se'}
          </p>
        </div>

        {/* Progress Ring/Bar */}
        <div className="mb-6">
          <div className="w-full bg-muted/50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeRemaining <= 10 ? 'bg-destructive' :
                timeRemaining <= 30 ? 'bg-warning' : 'bg-primary'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Rest Tips */}
        <div className="mb-6 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            {timeRemaining > 60 ? (
              <>
                <Icon name="Droplets" size={16} className="mr-2" />
                <span>Beba água e respire profundamente</span>
              </>
            ) : timeRemaining > 30 ? (
              <>
                <Icon name="Heart" size={16} className="mr-2" />
                <span>Monitore sua frequência cardíaca</span>
              </>
            ) : timeRemaining > 10 ? (
              <>
                <Icon name="Target" size={16} className="mr-2" />
                <span>Prepare-se para a próxima série</span>
              </>
            ) : (
              <>
                <Icon name="Zap" size={16} className="mr-2" />
                <span>Vamos lá! Próxima série chegando!</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={onSkip}
            iconName="SkipForward"
            iconPosition="left"
          >
            Pular Descanso
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              iconName="Plus"
              iconPosition="left"
            >
              +30s
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              iconName="Minus"
              iconPosition="left"
            >
              -15s
            </Button>
          </div>
        </div>

        {/* Sound/Vibration Indicator */}
        {timeRemaining <= 5 && (
          <div className="mt-4 flex items-center justify-center text-xs text-muted-foreground">
            <Icon name="Volume2" size={14} className="mr-1" />
            <span>Alerta sonoro ativo</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestTimer;