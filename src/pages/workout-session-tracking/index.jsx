import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

import SessionHeader from './components/SessionHeader';
import ExerciseTimer from './components/ExerciseTimer';
import SetLogger from './components/SetLogger';
import RestTimer from './components/RestTimer';
import SessionNotes from './components/SessionNotes';
import ProgressTracker from './components/ProgressTracker';
import ExerciseInstructions from './components/ExerciseInstructions';
import SessionSummary from './components/SessionSummary';

const WorkoutSessionTracking = () => {
  const navigate = useNavigate();
  const { workoutId } = useParams();
  
  // Session state management
  const [sessionStatus, setSessionStatus] = useState('ready'); // ready, active, paused, completed
  const [currentExercise, setCurrentExercise] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  
  // Session data
  const [sessionData, setSessionData] = useState({
    workoutName: 'Treino Peito e Tríceps',
    clientName: 'Maria Santos',
    estimatedDuration: 60, // minutes
    completedSets: 0,
    totalSets: 0
  });

  // Mock workout data - CapiFit themed
  const [workoutPlan] = useState({
    id: workoutId || 'workout-001',
    name: 'Treino Peito e Tríceps - Força',
    client: {
      id: 'client-001',
      name: 'Maria Santos',
      level: 'Intermediário',
      currentWeight: '65kg',
      targetWeight: '60kg'
    },
    exercises: [
      {
        id: 'ex-001',
        name: 'Supino Reto com Barra',
        category: 'Peito',
        muscleGroup: 'Peitoral Maior',
        equipment: 'Barra + Anilhas',
        sets: 4,
        reps: '8-10',
        restTime: 90, // seconds
        weight: '50kg',
        instructions: [
          'Deite no banco com os pés apoiados no chão',
          'Segure a barra com pegada um pouco mais larga que os ombros',
          'Desça a barra até tocar o peito controladamente',
          'Empurre a barra para cima até extensão completa dos braços'
        ],
        tips: 'Mantenha os ombros retraídos e core contraído durante todo o movimento',
        videoUrl: 'https://example.com/supino-reto-demo.mp4',
        completed: []
      },
      {
        id: 'ex-002',
        name: 'Supino Inclinado com Halteres',
        category: 'Peito',
        muscleGroup: 'Peitoral Superior',
        equipment: 'Halteres + Banco Inclinado',
        sets: 3,
        reps: '10-12',
        restTime: 75,
        weight: '22kg (cada)',
        instructions: [
          'Ajuste o banco em inclinação de 30-45 graus',
          'Deite com um halter em cada mão',
          'Desça os halteres até sentir alongamento no peito',
          'Empurre os halteres para cima convergindo no topo'
        ],
        tips: 'Controle a descida e evite chocar os halteres no topo',
        completed: []
      },
      {
        id: 'ex-003',
        name: 'Crucifixo com Halteres',
        category: 'Peito',
        muscleGroup: 'Peitoral',
        equipment: 'Halteres + Banco',
        sets: 3,
        reps: '12-15',
        restTime: 60,
        weight: '15kg (cada)',
        instructions: [
          'Deite no banco com halteres nas mãos',
          'Mantenha braços levemente flexionados',
          'Desça os halteres em arco até sentir alongamento',
          'Retorne à posição inicial contraindo o peito'
        ],
        tips: 'Movimento deve ser fluido, sem "balançar" os halteres',
        completed: []
      },
      {
        id: 'ex-004',
        name: 'Tríceps Testa com Barra W',
        category: 'Tríceps',
        muscleGroup: 'Tríceps',
        equipment: 'Barra W + Anilhas',
        sets: 4,
        reps: '10-12',
        restTime: 75,
        weight: '30kg',
        instructions: [
          'Deite no banco segurando a barra W',
          'Mantenha os cotovelos fixos apontando para cima',
          'Desça a barra até próximo da testa',
          'Estenda os braços retornando à posição inicial'
        ],
        tips: 'Apenas o antebraço deve se mover, cotovelos fixos',
        completed: []
      },
      {
        id: 'ex-005',
        name: 'Tríceps Mergulho no Banco',
        category: 'Tríceps',
        muscleGroup: 'Tríceps',
        equipment: 'Banco',
        sets: 3,
        reps: '12-15',
        restTime: 60,
        weight: 'Peso Corporal',
        instructions: [
          'Apoie as mãos na borda do banco',
          'Estenda as pernas à frente',
          'Desça o corpo flexionando os cotovelos',
          'Empurre o corpo para cima até extensão completa'
        ],
        tips: 'Mantenha o corpo próximo ao banco durante o movimento',
        completed: []
      }
    ],
    notes: '',
    startedAt: null,
    completedAt: null
  });

  // Calculate total sets
  useEffect(() => {
    const totalSets = workoutPlan?.exercises?.reduce((sum, ex) => sum + ex?.sets, 0) || 0;
    setSessionData(prev => ({ ...prev, totalSets }));
  }, [workoutPlan]);

  // Session timer effect
  useEffect(() => {
    let interval = null;
    if (sessionStatus === 'active' && sessionStartTime) {
      interval = setInterval(() => {
        // Update session duration - implemented in SessionHeader
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStatus, sessionStartTime]);

  // Rest timer effect
  useEffect(() => {
    let interval = null;
    if (isRestTimerActive && restTimeRemaining > 0) {
      interval = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            // Vibration feedback if supported
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestTimerActive, restTimeRemaining]);

  // Start workout session
  const startSession = () => {
    setSessionStatus('active');
    setSessionStartTime(new Date());
    setSessionData(prev => ({
      ...prev,
      startedAt: new Date()?.toISOString()
    }));
  };

  // Pause/Resume session
  const togglePauseSession = () => {
    setSessionStatus(prev => prev === 'active' ? 'paused' : 'active');
  };

  // Complete current set
  const completeSet = (setData) => {
    const updatedWorkout = { ...workoutPlan };
    const exercise = updatedWorkout?.exercises?.[currentExercise];
    
    exercise?.completed?.push({
      setNumber: exercise?.completed?.length + 1,
      reps: setData?.reps,
      weight: setData?.weight,
      notes: setData?.notes,
      completedAt: new Date()?.toISOString()
    });

    setSessionData(prev => ({
      ...prev,
      completedSets: prev?.completedSets + 1
    }));

    // Start rest timer if not last set
    const remainingSets = exercise?.sets - exercise?.completed?.length;
    if (remainingSets > 0) {
      setRestTimeRemaining(exercise?.restTime || 60);
      setIsRestTimerActive(true);
    }
  };

  // Move to next exercise
  const nextExercise = () => {
    if (currentExercise < workoutPlan?.exercises?.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setIsRestTimerActive(false);
      setRestTimeRemaining(0);
    } else {
      // Workout completed
      completeSession();
    }
  };

  // Move to previous exercise
  const previousExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(prev => prev - 1);
      setIsRestTimerActive(false);
      setRestTimeRemaining(0);
    }
  };

  // Complete entire session
  const completeSession = () => {
    setSessionStatus('completed');
    setSessionData(prev => ({
      ...prev,
      completedAt: new Date()?.toISOString()
    }));
    setIsRestTimerActive(false);
  };

  // Exit session
  const exitSession = () => {
    if (sessionStatus === 'active' || sessionStatus === 'paused') {
      if (window.confirm('Tem certeza que deseja sair? O progresso da sessão será perdido.')) {
        navigate('/criar-treinos');
      }
    } else {
      navigate('/criar-treinos');
    }
  };

  const currentExerciseData = workoutPlan?.exercises?.[currentExercise];
  const sessionProgress = sessionData?.totalSets > 0 ? (sessionData?.completedSets / sessionData?.totalSets) * 100 : 0;

  // Show session summary if completed
  if (sessionStatus === 'completed') {
    return (
      <SessionSummary 
        workoutPlan={workoutPlan}
        sessionData={sessionData}
        startTime={sessionStartTime}
        onFinish={() => navigate('/dashboard-principal')}
        onSaveAndExit={() => navigate('/criar-treinos')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Session Header */}
      <SessionHeader
        workoutName={sessionData?.workoutName}
        clientName={sessionData?.clientName}
        sessionStatus={sessionStatus}
        sessionStartTime={sessionStartTime}
        progress={sessionProgress}
        onExit={exitSession}
        onTogglePause={togglePauseSession}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {sessionStatus === 'ready' ? (
          /* Pre-session Setup */
          (<div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Play" size={32} className="text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Pronto para começar?
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Seu treino <strong>{workoutPlan?.name}</strong> está configurado e pronto para iniciar.
                Duração estimada: <strong>{sessionData?.estimatedDuration} minutos</strong>.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-2 px-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Total de Exercícios:</span>
                  <span className="text-sm text-muted-foreground">{workoutPlan?.exercises?.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Total de Séries:</span>
                  <span className="text-sm text-muted-foreground">{sessionData?.totalSets}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Cliente:</span>
                  <span className="text-sm text-muted-foreground">{workoutPlan?.client?.name}</span>
                </div>
              </div>

              <Button
                onClick={startSession}
                size="lg"
                className="w-full"
                iconName="Play"
                iconPosition="left"
              >
                Iniciar Sessão de Treino
              </Button>
            </div>
          </div>)
        ) : (
          /* Active Session Interface */
          (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Exercise Details & Timer */}
            <div className="lg:col-span-2 space-y-6">
              {/* Exercise Progress */}
              <ProgressTracker
                exercises={workoutPlan?.exercises}
                currentExercise={currentExercise}
                completedSets={sessionData?.completedSets}
                totalSets={sessionData?.totalSets}
              />

              {/* Current Exercise Info */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {currentExerciseData?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentExerciseData?.category} • {currentExerciseData?.muscleGroup}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {currentExercise + 1}/{workoutPlan?.exercises?.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Exercício</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-semibold text-foreground">{currentExerciseData?.sets}</p>
                    <p className="text-xs text-muted-foreground">Séries</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-semibold text-foreground">{currentExerciseData?.reps}</p>
                    <p className="text-xs text-muted-foreground">Repetições</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-semibold text-foreground">{currentExerciseData?.weight}</p>
                    <p className="text-xs text-muted-foreground">Peso</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-semibold text-foreground">{currentExerciseData?.restTime}s</p>
                    <p className="text-xs text-muted-foreground">Descanso</p>
                  </div>
                </div>

                {/* Exercise Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={previousExercise}
                    disabled={currentExercise === 0}
                    iconName="ChevronLeft"
                    iconPosition="left"
                  >
                    Anterior
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={nextExercise}
                    iconName="ChevronRight"
                    iconPosition="right"
                  >
                    {currentExercise === workoutPlan?.exercises?.length - 1 ? 'Finalizar' : 'Próximo'}
                  </Button>
                </div>
              </div>

              {/* Set Logger */}
              <SetLogger
                exercise={currentExerciseData}
                onSetComplete={completeSet}
                sessionStatus={sessionStatus}
              />

              {/* Exercise Instructions */}
              <ExerciseInstructions
                exercise={currentExerciseData}
              />
            </div>
            {/* Right Column - Timers & Notes */}
            <div className="space-y-6">
              {/* Session Timer */}
              <ExerciseTimer
                sessionStartTime={sessionStartTime}
                sessionStatus={sessionStatus}
              />

              {/* Rest Timer */}
              {isRestTimerActive && (
                <RestTimer
                  timeRemaining={restTimeRemaining}
                  onSkip={() => {
                    setIsRestTimerActive(false);
                    setRestTimeRemaining(0);
                  }}
                />
              )}

              {/* Session Notes */}
              <SessionNotes
                notes={workoutPlan?.notes || ''}
                onNotesChange={(notes) => {
                  // Update workout notes
                  workoutPlan.notes = notes;
                }}
              />

              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-4">Ações Rápidas</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    iconName="Camera"
                    iconPosition="left"
                  >
                    Tirar Foto do Progresso
                  </Button>
                  
                  <Button
                    variant="outline" 
                    size="sm"
                    fullWidth
                    iconName="MessageSquare"
                    iconPosition="left"
                    onClick={() => navigate('/chat-communication-hub')}
                  >
                    Enviar Mensagem
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    iconName="RefreshCw"
                    iconPosition="left"
                  >
                    Substituir Exercício
                  </Button>
                </div>
              </div>
            </div>
          </div>)
        )}
      </div>
    </div>
  );
};

export default WorkoutSessionTracking;