import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SessionHeader = ({ 
  workoutName, 
  clientName, 
  sessionStatus, 
  sessionStartTime, 
  progress, 
  onExit, 
  onTogglePause 
}) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Update elapsed time
  useEffect(() => {
    let interval = null;
    if (sessionStatus === 'active' && sessionStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - sessionStartTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        
        setElapsedTime(
          `${hours?.toString()?.padStart(2, '0')}:${minutes?.toString()?.padStart(2, '0')}:${seconds?.toString()?.padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStatus, sessionStartTime]);

  const getStatusColor = () => {
    switch (sessionStatus) {
      case 'active': return 'text-success';
      case 'paused': return 'text-warning';
      case 'completed': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = () => {
    switch (sessionStatus) {
      case 'active': return 'Em Andamento';
      case 'paused': return 'Pausado';
      case 'completed': return 'Concluído';
      default: return 'Aguardando';
    }
  };

  return (
    <div className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left Section - Workout Info */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🦫</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">
                {workoutName}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="User" size={14} />
                <span>{clientName}</span>
                <span>•</span>
                <span className={`font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
            </div>
          </div>

          {/* Center Section - Timer & Progress */}
          <div className="flex items-center space-x-6">
            {sessionStartTime && (
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground font-mono">
                  {elapsedTime}
                </p>
                <p className="text-xs text-muted-foreground">Tempo Decorrido</p>
              </div>
            )}
            
            {progress > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {Math.round(progress)}%
                </p>
                <p className="text-xs text-muted-foreground">Progresso</p>
              </div>
            )}
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center space-x-2">
            {sessionStatus === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onTogglePause}
                iconName="Pause"
                iconPosition="left"
              >
                Pausar
              </Button>
            )}
            
            {sessionStatus === 'paused' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onTogglePause}
                iconName="Play"
                iconPosition="left"
              >
                Continuar
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onExit}
              iconName="X"
              iconPosition="left"
            >
              Sair
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionHeader;