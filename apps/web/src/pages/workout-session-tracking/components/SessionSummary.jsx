import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SessionSummary = ({ workoutPlan, sessionData, startTime, onFinish, onSaveAndExit }) => {
  const navigate = useNavigate();
  
  // Calculate session statistics
  const endTime = new Date();
  const duration = startTime ? Math.floor((endTime - startTime) / 1000 / 60) : 0; // minutes
  const totalExercises = workoutPlan?.exercises?.length || 0;
  const completedExercises = workoutPlan?.exercises?.filter(ex => ex?.completed?.length === ex?.sets)?.length || 0;
  const totalSets = workoutPlan?.exercises?.reduce((sum, ex) => sum + ex?.sets, 0) || 0;
  const completedSets = workoutPlan?.exercises?.reduce((sum, ex) => sum + ex?.completed?.length, 0) || 0;
  const completionRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  // Calculate calories burned (rough estimate)
  const estimatedCalories = Math.round(duration * 8); // 8 calories per minute average

  // Calculate total weight lifted
  const totalWeight = workoutPlan?.exercises?.reduce((total, exercise) => {
    return total + exercise?.completed?.reduce((exerciseTotal, set) => {
      const weight = parseFloat(set?.weight) || 0;
      const reps = parseInt(set?.reps) || 0;
      return exerciseTotal + (weight * reps);
    }, 0);
  }, 0) || 0;

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} minutos`;
  };

  const getPerformanceLevel = () => {
    if (completionRate >= 90) return { level: 'Excelente', color: 'text-success', emoji: '🏆' };
    if (completionRate >= 75) return { level: 'Muito Bom', color: 'text-primary', emoji: '💪' };
    if (completionRate >= 50) return { level: 'Bom', color: 'text-warning', emoji: '👍' };
    return { level: 'Precisa Melhorar', color: 'text-muted-foreground', emoji: '💡' };
  };

  const performance = getPerformanceLevel();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} className="text-success" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Sessão Concluída! 🎉
            </h1>
            <p className="text-muted-foreground">
              Parabéns por completar seu treino no CapiFit
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Overview */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {performance?.emoji} Desempenho: {performance?.level}
            </h2>
            <div className="text-6xl font-bold mb-2">
              <span className={performance?.color}>{completionRate}%</span>
            </div>
            <p className="text-muted-foreground">Taxa de conclusão</p>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Icon name="Clock" size={24} className="mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{formatDuration(duration)}</p>
              <p className="text-sm text-muted-foreground">Duração</p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Icon name="Target" size={24} className="mx-auto text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">{completedSets}/{totalSets}</p>
              <p className="text-sm text-muted-foreground">Séries</p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Icon name="Zap" size={24} className="mx-auto text-accent mb-2" />
              <p className="text-2xl font-bold text-foreground">{estimatedCalories}</p>
              <p className="text-sm text-muted-foreground">Calorias</p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Icon name="Weight" size={24} className="mx-auto text-success mb-2" />
              <p className="text-2xl font-bold text-foreground">{totalWeight?.toLocaleString()}kg</p>
              <p className="text-sm text-muted-foreground">Volume Total</p>
            </div>
          </div>
        </div>

        {/* Exercise Breakdown */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
            <Icon name="BarChart3" size={20} className="mr-2" />
            Resumo dos Exercícios
          </h3>
          
          <div className="space-y-4">
            {workoutPlan?.exercises?.map((exercise, index) => {
              const exerciseCompletion = exercise?.sets > 0 ? (exercise?.completed?.length / exercise?.sets) * 100 : 0;
              const isCompleted = exerciseCompletion === 100;
              
              return (
                <div key={exercise?.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Icon 
                        name={isCompleted ? "CheckCircle" : "Circle"} 
                        size={20} 
                        className={isCompleted ? "text-success" : "text-muted-foreground"} 
                      />
                      <div>
                        <h4 className="font-medium text-foreground">{exercise?.name}</h4>
                        <p className="text-sm text-muted-foreground">{exercise?.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {exercise?.completed?.length}/{exercise?.sets}
                      </p>
                      <p className="text-xs text-muted-foreground">séries</p>
                    </div>
                  </div>

                  {/* Exercise Sets Details */}
                  {exercise?.completed?.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-foreground">Séries realizadas:</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {exercise?.completed?.map((set, setIndex) => (
                          <div key={setIndex} className="text-xs p-2 bg-muted/50 rounded text-center">
                            <span className="font-medium">{set?.reps} × {set?.weight}kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${exerciseCompletion}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Personal Records & Achievements */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
            <Icon name="Award" size={20} className="mr-2" />
            Conquistas da Sessão
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completionRate >= 100 && (
              <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Trophy" size={24} className="text-success" />
                  <div>
                    <h4 className="font-medium text-foreground">Treino Completo!</h4>
                    <p className="text-sm text-muted-foreground">100% das séries realizadas</p>
                  </div>
                </div>
              </div>
            )}
            
            {duration >= 45 && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Clock" size={24} className="text-primary" />
                  <div>
                    <h4 className="font-medium text-foreground">Resistência!</h4>
                    <p className="text-sm text-muted-foreground">Treino de {formatDuration(duration)}</p>
                  </div>
                </div>
              </div>
            )}
            
            {totalWeight >= 1000 && (
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Weight" size={24} className="text-accent" />
                  <div>
                    <h4 className="font-medium text-foreground">Força Máxima!</h4>
                    <p className="text-sm text-muted-foreground">{totalWeight?.toLocaleString()}kg de volume total</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="Flame" size={24} className="text-warning" />
                <div>
                  <h4 className="font-medium text-foreground">Queima de Calorias!</h4>
                  <p className="text-sm text-muted-foreground">≈ {estimatedCalories} calorias queimadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/dashboard-principal')}
            size="lg"
            iconName="Home"
            iconPosition="left"
          >
            Ir para Dashboard
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/chat-communication-hub')}
            size="lg"
            iconName="MessageSquare"
            iconPosition="left"
          >
            Compartilhar Progresso
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/physical-assessment-system')}
            size="lg"
            iconName="BarChart3"
            iconPosition="left"
          >
            Ver Evolução
          </Button>
        </div>

        {/* Next Session Suggestion */}
        <div className="mt-8 text-center p-6 bg-muted/30 rounded-lg border border-border">
          <Icon name="Calendar" size={32} className="mx-auto text-primary mb-3" />
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Próxima Sessão Sugerida
          </h4>
          <p className="text-muted-foreground mb-4">
            Baseado no seu progresso, recomendamos um treino de <strong>Costas e Bíceps</strong> 
            em 48 horas para otimizar sua recuperação.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/criar-treinos')}
            iconName="Plus"
            iconPosition="left"
          >
            Agendar Próximo Treino
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;