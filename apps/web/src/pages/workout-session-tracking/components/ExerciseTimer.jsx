import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ExerciseTimer = ({ sessionStartTime, sessionStatus }) => {
  const [sessionDuration, setSessionDuration] = useState('00:00');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate session duration
  useEffect(() => {
    if (sessionStartTime && sessionStatus === 'active') {
      const elapsed = Math.floor((currentTime - sessionStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setSessionDuration(
        `${minutes?.toString()?.padStart(2, '0')}:${seconds?.toString()?.padStart(2, '0')}`
      );
    }
  }, [currentTime, sessionStartTime, sessionStatus]);

  const formatTime = (date) => {
    return date?.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground flex items-center">
          <Icon name="Clock" size={18} className="mr-2" />
          Timer da Sessão
        </h4>
        <div className={`w-3 h-3 rounded-full ${
          sessionStatus === 'active' ? 'bg-success animate-pulse' :
          sessionStatus === 'paused'? 'bg-warning' : 'bg-muted-foreground'
        }`} />
      </div>

      <div className="space-y-4">
        {/* Current Time */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-3xl font-bold font-mono text-foreground">
            {formatTime(currentTime)}
          </p>
          <p className="text-sm text-muted-foreground">Horário Atual</p>
        </div>

        {/* Session Duration */}
        {sessionStartTime && (
          <div className="text-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-2xl font-bold font-mono text-primary">
              {sessionDuration}
            </p>
            <p className="text-sm text-muted-foreground">Duração da Sessão</p>
          </div>
        )}

        {/* Session Start Time */}
        {sessionStartTime && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Início:</span>
            <span className="font-medium text-foreground">
              {formatTime(sessionStartTime)}
            </span>
          </div>
        )}

        {/* Estimated End Time */}
        {sessionStartTime && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Previsão de Término:</span>
            <span className="font-medium text-foreground">
              {formatTime(new Date(sessionStartTime.getTime() + (60 * 60 * 1000)))} {/* +1 hour */}
            </span>
          </div>
        )}
      </div>

      {/* Session Status Indicator */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            sessionStatus === 'active' ? 'bg-success' :
            sessionStatus === 'paused'? 'bg-warning' : 'bg-muted-foreground'
          }`} />
          <span className="text-sm text-muted-foreground">
            {sessionStatus === 'active' ? 'Treino em andamento' :
             sessionStatus === 'paused' ? 'Treino pausado' :
             'Aguardando início'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExerciseTimer;