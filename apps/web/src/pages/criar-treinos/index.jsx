import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import ExerciseLibraryPanel from './components/ExerciseLibraryPanel';
import WorkoutBuilder from './components/WorkoutBuilder';
import WorkoutMetadata from './components/WorkoutMetadata';
import WorkoutTemplates from './components/WorkoutTemplates';

const CriarTreinos = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [activeView, setActiveView] = useState('builder'); // 'builder', 'metadata', 'templates'
  
  // Workout state
  const [exercises, setExercises] = useState([]);
  const [workoutMetadata, setWorkoutMetadata] = useState({
    nome: '',
    clienteId: '',
    dataInicio: new Date()?.toISOString()?.split('T')?.[0],
    frequencia: 'weekly',
    dificuldade: 'intermediario',
    descricao: '',
    schedule: [],
    totalExercicios: 0,
    duracaoEstimada: 0,
    caloriasEstimadas: 0
  });

  // Update metadata when exercises change
  useEffect(() => {
    const totalExercicios = exercises?.length;
    const duracaoEstimada = Math.ceil(
      exercises?.reduce((total, ex) => total + (ex?.series * ex?.repeticoes * 3) + ex?.tempoDescanso, 0) / 60
    );
    const caloriasEstimadas = exercises?.reduce((total, ex) => total + (ex?.calorias * ex?.series), 0);

    setWorkoutMetadata(prev => ({
      ...prev,
      totalExercicios,
      duracaoEstimada,
      caloriasEstimadas
    }));
  }, [exercises]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddExercise = (exercise) => {
    setExercises(prev => [...prev, exercise]);
    setIsLibraryOpen(false); // Close library on mobile after adding
  };

  const handleUpdateExercise = (index, updates) => {
    setExercises(prev => prev?.map((ex, i) => i === index ? { ...ex, ...updates } : ex));
  };

  const handleRemoveExercise = (index) => {
    setExercises(prev => prev?.filter((_, i) => i !== index));
  };

  const handleReorderExercises = (fromIndex, toIndex) => {
    setExercises(prev => {
      const newExercises = [...prev];
      const [movedExercise] = newExercises?.splice(fromIndex, 1);
      newExercises?.splice(toIndex, 0, movedExercise);
      return newExercises;
    });
  };

  const handleUpdateMetadata = (updates) => {
    setWorkoutMetadata(prev => ({ ...prev, ...updates }));
  };

  const handleSaveWorkout = () => {
    if (!workoutMetadata?.nome || !workoutMetadata?.clienteId || exercises?.length === 0) {
      alert('Preencha todas as informações obrigatórias e adicione pelo menos um exercício');
      return;
    }

    // Simulate save
    console.log('Saving workout:', { metadata: workoutMetadata, exercises });
    alert('Treino salvo com sucesso!');
    
    // Reset form
    setExercises([]);
    setWorkoutMetadata({
      nome: '',
      clienteId: '',
      dataInicio: new Date()?.toISOString()?.split('T')?.[0],
      frequencia: 'weekly',
      dificuldade: 'intermediario',
      descricao: '',
      schedule: [],
      totalExercicios: 0,
      duracaoEstimada: 0,
      caloriasEstimadas: 0
    });
    setActiveView('builder');
  };

  const handleSaveTemplate = () => {
    if (!workoutMetadata?.nome || exercises?.length === 0) {
      alert('Adicione um nome e pelo menos um exercício para salvar como template');
      return;
    }

    // Simulate template save
    console.log('Saving template:', { metadata: workoutMetadata, exercises });
    alert('Template salvo com sucesso!');
  };

  const handleLoadTemplate = (template) => {
    // Simulate loading template exercises
    const templateExercises = template?.exerciciosPreview?.map((nome, index) => ({
      id: index + 1,
      nome,
      categoria: template?.categoria,
      grupoMuscular: 'geral',
      series: 3,
      repeticoes: 12,
      peso: 0,
      tempoDescanso: 60,
      calorias: 5
    }));

    setExercises(templateExercises);
    setWorkoutMetadata(prev => ({
      ...prev,
      nome: template?.nome,
      dificuldade: template?.dificuldade?.toLowerCase()
    }));
    
    setActiveView('builder');
    setIsTemplatesOpen(false);
    alert(`Template "${template?.nome}" carregado com sucesso!`);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'metadata': return 'Informações do Treino';
      case 'templates': return 'Templates Salvos';
      default: return 'Construtor de Treino';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={handleSidebarToggle} isMenuOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Criar Treinos
                </h1>
                <p className="text-muted-foreground mt-1">
                  Construa treinos personalizados para seus clientes
                </p>
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="flex items-center space-x-2 lg:hidden">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
                >
                  <Icon name="FileText" size={20} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                >
                  <Icon name="Library" size={20} />
                </Button>
              </div>
            </div>

            {/* Navigation Tabs - Mobile */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg lg:hidden">
              <button
                onClick={() => setActiveView('builder')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'builder' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Dumbbell" size={16} className="inline mr-2" />
                Construtor
              </button>
              <button
                onClick={() => setActiveView('metadata')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'metadata' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Settings" size={16} className="inline mr-2" />
                Detalhes
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="mt-4 bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Progresso do Treino</span>
                <span className="text-sm text-muted-foreground">
                  {exercises?.length > 0 && workoutMetadata?.nome && workoutMetadata?.clienteId ? '100%' : 
                   exercises?.length > 0 || workoutMetadata?.nome ? '50%' : '0%'}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: exercises?.length > 0 && workoutMetadata?.nome && workoutMetadata?.clienteId ? '100%' : 
                           exercises?.length > 0 || workoutMetadata?.nome ? '50%' : '0%'
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Exercícios: {exercises?.length}</span>
                <span>Duração: ~{workoutMetadata?.duracaoEstimada}min</span>
                <span>Calorias: ~{workoutMetadata?.caloriasEstimadas}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
            {/* Templates Panel - Desktop */}
            <div className="hidden lg:block lg:col-span-3">
              <WorkoutTemplates
                onLoadTemplate={handleLoadTemplate}
                isOpen={true}
                onToggle={() => {}}
              />
            </div>

            {/* Main Workspace */}
            <div className="lg:col-span-6">
              {activeView === 'builder' && (
                <WorkoutBuilder
                  exercises={exercises}
                  onUpdateExercise={handleUpdateExercise}
                  onRemoveExercise={handleRemoveExercise}
                  onReorderExercises={handleReorderExercises}
                />
              )}
              
              {activeView === 'metadata' && (
                <WorkoutMetadata
                  metadata={workoutMetadata}
                  onUpdateMetadata={handleUpdateMetadata}
                  onSaveWorkout={handleSaveWorkout}
                  onSaveTemplate={handleSaveTemplate}
                />
              )}

              {activeView === 'templates' && (
                <div className="lg:hidden">
                  <WorkoutTemplates
                    onLoadTemplate={handleLoadTemplate}
                    isOpen={true}
                    onToggle={() => setActiveView('builder')}
                  />
                </div>
              )}
            </div>

            {/* Exercise Library Panel - Desktop */}
            <div className="hidden lg:block lg:col-span-3">
              <ExerciseLibraryPanel
                onAddExercise={handleAddExercise}
                isOpen={true}
                onToggle={() => {}}
              />
            </div>
          </div>

          {/* Mobile Panels */}
          {isLibraryOpen && (
            <div className="fixed inset-0 z-50 bg-background lg:hidden">
              <ExerciseLibraryPanel
                onAddExercise={handleAddExercise}
                isOpen={isLibraryOpen}
                onToggle={() => setIsLibraryOpen(false)}
              />
            </div>
          )}

          {isTemplatesOpen && (
            <div className="fixed inset-0 z-50 bg-background lg:hidden">
              <WorkoutTemplates
                onLoadTemplate={handleLoadTemplate}
                isOpen={isTemplatesOpen}
                onToggle={() => setIsTemplatesOpen(false)}
              />
            </div>
          )}

          {/* Quick Actions - Mobile */}
          <div className="fixed bottom-4 right-4 flex flex-col space-y-2 lg:hidden">
            {activeView === 'builder' && exercises?.length > 0 && (
              <Button
                onClick={() => setActiveView('metadata')}
                className="w-14 h-14 rounded-full shadow-lg"
                iconName="ArrowRight"
              />
            )}
            
            <Button
              onClick={() => setIsLibraryOpen(true)}
              variant="secondary"
              className="w-14 h-14 rounded-full shadow-lg"
              iconName="Plus"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CriarTreinos;