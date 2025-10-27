import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

import Icon from '../../components/AppIcon';

// Components
import ExerciseTable from './components/ExerciseTable';
import ExerciseDetailsModal from './components/ExerciseDetailsModal';
import AddCustomExerciseModal from './components/AddCustomExerciseModal';
import ExerciseFilters from './components/ExerciseFilters';
import ExerciseStats from './components/ExerciseStats';

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // table, cards
  
  // Modals
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock exercise data
  const exercises = [
    {
      id: 1,
      nome: 'Supino Reto',
      categoria: 'Musculação',
      grupoMuscular: 'Peito',
      equipamento: 'Barras',
      dificuldade: 'Intermediário',
      instrucoes: 'Deite-se no banco, segure a barra com pegada pronada, desça controladamente até o peito e empurre para cima.',
      videoUrl: 'https://example.com/supino-reto.mp4',
      imagem: '/api/placeholder/300/200',
      alt: 'Homem executando supino reto no banco com barra olímpica',
      musculosAtivados: ['Peitoral maior', 'Tríceps', 'Deltóide anterior'],
      calorias: 8,
      tempo: '3-4 séries de 8-12 repetições',
      rating: 4.8,
      isFavorite: true,
      tags: ['força', 'hipertrofia', 'básico']
    },
    {
      id: 2,
      nome: 'Agachamento Livre',
      categoria: 'Musculação',
      grupoMuscular: 'Pernas',
      equipamento: 'Barras',
      dificuldade: 'Intermediário',
      instrucoes: 'Posicione a barra nas costas, desça flexionando joelhos e quadril, mantenha o tronco ereto.',
      videoUrl: 'https://example.com/agachamento.mp4',
      imagem: '/api/placeholder/300/200',
      alt: 'Atleta realizando agachamento livre com barra nas costas em academia',
      musculosAtivados: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
      calorias: 12,
      tempo: '3-4 séries de 6-10 repetições',
      rating: 4.9,
      isFavorite: false,
      tags: ['força', 'funcional', 'básico']
    },
    {
      id: 3,
      nome: 'Rosca Direta',
      categoria: 'Musculação',
      grupoMuscular: 'Braços',
      equipamento: 'Halteres',
      dificuldade: 'Iniciante',
      instrucoes: 'Segure os halteres com pegada supinada, flexione os cotovelos mantendo-os fixos.',
      videoUrl: 'https://example.com/rosca-direta.mp4',
      imagem: '/api/placeholder/300/200',
      alt: 'Personal trainer demonstrando rosca direta com halteres para fortalecimento dos bíceps',
      musculosAtivados: ['Bíceps', 'Braquial'],
      calorias: 5,
      tempo: '3 séries de 10-15 repetições',
      rating: 4.6,
      isFavorite: true,
      tags: ['hipertrofia', 'isolamento']
    },
    {
      id: 4,
      nome: 'Prancha',
      categoria: 'Funcional',
      grupoMuscular: 'Core',
      equipamento: 'Peso Corporal',
      dificuldade: 'Iniciante',
      instrucoes: 'Mantenha o corpo em linha reta apoiado nos antebraços e pés, contraindo o abdômen.',
      videoUrl: 'https://example.com/prancha.mp4',
      imagem: '/api/placeholder/300/200',
      alt: 'Mulher executando prancha abdominal em posição isométrica no solo',
      musculosAtivados: ['Reto abdominal', 'Transverso', 'Oblíquos'],
      calorias: 3,
      tempo: '3 séries de 30-60 segundos',
      rating: 4.7,
      isFavorite: false,
      tags: ['core', 'estabilidade', 'isométrico']
    },
    {
      id: 5,
      nome: 'Puxada Frontal',
      categoria: 'Musculação',
      grupoMuscular: 'Costas',
      equipamento: 'Máquinas',
      dificuldade: 'Intermediário',
      instrucoes: 'Sente-se na máquina, puxe a barra até o peito mantendo o tronco ereto.',
      videoUrl: 'https://example.com/puxada-frontal.mp4',
      imagem: '/api/placeholder/300/200',
      alt: 'Homem utilizando máquina de puxada frontal para exercitar músculos das costas',
      musculosAtivados: ['Latíssimo do dorso', 'Romboides', 'Bíceps'],
      calorias: 7,
      tempo: '3-4 séries de 8-12 repetições',
      rating: 4.5,
      isFavorite: true,
      tags: ['hipertrofia', 'largura']
    },
    {
      id: 6,
      nome: 'Desenvolvimento Militar',
      categoria: 'Musculação',
      grupoMuscular: 'Ombros',
      equipamento: 'Barras',
      dificuldade: 'Avançado',
      instrucoes: 'Em pé, empurre a barra desde os ombros até acima da cabeça, mantendo o core contraído.',
      videoUrl: 'https://example.com/desenvolvimento-militar.mp4',
      imagem: '/api/placeholder/300/200',
      alt: 'Atleta executando desenvolvimento militar com barra olímpica em posição em pé',
      musculosAtivados: ['Deltóides', 'Tríceps', 'Core'],
      calorias: 9,
      tempo: '3-4 séries de 6-8 repetições',
      rating: 4.4,
      isFavorite: false,
      tags: ['força', 'ombros', 'funcional']
    }
  ];

  // Filter options
  const filterOptions = {
    categories: ['Musculação', 'Funcional', 'Cardio', 'Flexibilidade'],
    muscleGroups: ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'],
    difficulties: ['Iniciante', 'Intermediário', 'Avançado'],
    equipment: ['Peso Corporal', 'Halteres', 'Barras', 'Máquinas', 'Cabos', 'Kettlebell']
  };

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return exercises?.filter(exercise => {
      const matchesSearch = exercise?.nome?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                          exercise?.grupoMuscular?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                          exercise?.tags?.some(tag => tag?.toLowerCase()?.includes(searchTerm?.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || exercise?.categoria === selectedCategory;
      const matchesMuscleGroup = selectedMuscleGroup === 'all' || exercise?.grupoMuscular === selectedMuscleGroup;
      const matchesDifficulty = selectedDifficulty === 'all' || exercise?.dificuldade === selectedDifficulty;
      const matchesEquipment = selectedEquipment === 'all' || exercise?.equipamento === selectedEquipment;

      return matchesSearch && matchesCategory && matchesMuscleGroup && matchesDifficulty && matchesEquipment;
    });
  }, [exercises, searchTerm, selectedCategory, selectedMuscleGroup, selectedDifficulty, selectedEquipment]);

  const handleViewExercise = (exercise) => {
    setSelectedExercise(exercise);
    setShowDetailsModal(true);
  };

  const handleAddToWorkout = (exercise) => {
    // Navigate to workout builder with selected exercise
    navigate('/criar-treinos', { state: { selectedExercise: exercise } });
  };

  const handleToggleFavorite = (exerciseId) => {
    // In a real app, this would update the backend
    console.log('Toggle favorite for exercise:', exerciseId);
  };

  const handleExportExercises = () => {
    // Export filtered exercises as PDF or CSV
    console.log('Exporting exercises:', filteredExercises);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                  Biblioteca de Exercícios
                </h1>
                <p className="text-muted-foreground">
                  Explore nossa base completa de exercícios com instruções detalhadas e demonstrações em vídeo
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportExercises}
                  iconName="Download"
                  iconPosition="left"
                >
                  Exportar Lista
                </Button>
                <Button
                  onClick={() => setShowAddModal(true)}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Adicionar Exercício
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <ExerciseStats 
            totalExercises={exercises?.length}
            filteredCount={filteredExercises?.length}
            favoriteCount={exercises?.filter(ex => ex?.isFavorite)?.length}
          />

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Buscar exercícios, grupos musculares ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  iconLeft="Search"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  iconName="Table"
                />
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  iconName="Grid3X3"
                />
              </div>
            </div>

            {/* Filters */}
            <ExerciseFilters
              selectedCategory={selectedCategory}
              selectedMuscleGroup={selectedMuscleGroup}
              selectedDifficulty={selectedDifficulty}
              selectedEquipment={selectedEquipment}
              onCategoryChange={setSelectedCategory}
              onMuscleGroupChange={setSelectedMuscleGroup}
              onDifficultyChange={setSelectedDifficulty}
              onEquipmentChange={setSelectedEquipment}
              filterOptions={filterOptions}
            />
          </div>

          {/* Results Info */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredExercises?.length} de {exercises?.length} exercícios
            </p>
            
            {(searchTerm || selectedCategory !== 'all' || selectedMuscleGroup !== 'all' || 
              selectedDifficulty !== 'all' || selectedEquipment !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedMuscleGroup('all');
                  setSelectedDifficulty('all');
                  setSelectedEquipment('all');
                }}
                iconName="X"
                iconPosition="left"
              >
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Exercise Table/Cards */}
          <ExerciseTable
            exercises={filteredExercises}
            viewMode={viewMode}
            onViewExercise={handleViewExercise}
            onAddToWorkout={handleAddToWorkout}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Empty State */}
          {filteredExercises?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Search" size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum exercício encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou termos de busca
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedMuscleGroup('all');
                  setSelectedDifficulty('all');
                  setSelectedEquipment('all');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showDetailsModal && selectedExercise && (
        <ExerciseDetailsModal
          exercise={selectedExercise}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedExercise(null);
          }}
          onAddToWorkout={() => handleAddToWorkout(selectedExercise)}
          onToggleFavorite={() => handleToggleFavorite(selectedExercise?.id)}
        />
      )}

      {showAddModal && (
        <AddCustomExerciseModal
          onClose={() => setShowAddModal(false)}
          onSave={(exerciseData) => {
            // In a real app, this would save to backend
            console.log('New exercise:', exerciseData);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ExerciseLibrary;