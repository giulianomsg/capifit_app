import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ExerciseLibraryPanel = ({ onAddExercise, isOpen, onToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
  const [previewExercise, setPreviewExercise] = useState(null);

  const exercises = [
  {
    id: 1,
    nome: "Supino Reto",
    categoria: "força",
    grupoMuscular: "peito",
    equipamento: "Barra",
    dificuldade: "Intermediário",
    descricao: "Exercício fundamental para desenvolvimento do peitoral maior, deltoides anterior e tríceps.",
    instrucoes: "Deite no banco, posicione a barra na altura do peito, desça controladamente e empurre para cima.",
    videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
    imagem: "https://images.unsplash.com/photo-1725381083327-e5dc71002769",
    imagemAlt: "Homem executando supino reto com barra em academia",
    tempoExecucao: "45-60 segundos",
    calorias: 8
  },
  {
    id: 2,
    nome: "Agachamento Livre",
    categoria: "força",
    grupoMuscular: "pernas",
    equipamento: "Peso Corporal",
    dificuldade: "Iniciante",
    descricao: "Movimento funcional que trabalha quadríceps, glúteos e core.",
    instrucoes: "Pés na largura dos ombros, desça como se fosse sentar, mantenha o peito ereto.",
    videoUrl: "https://www.youtube.com/embed/Dy28eq2PjcM",
    imagem: "https://images.unsplash.com/photo-1641808888839-4d3e74b298a4",
    imagemAlt: "Mulher fazendo agachamento livre em posição correta",
    tempoExecucao: "30-45 segundos",
    calorias: 6
  },
  {
    id: 3,
    nome: "Corrida Esteira",
    categoria: "cardio",
    grupoMuscular: "corpo-todo",
    equipamento: "Esteira",
    dificuldade: "Iniciante",
    descricao: "Exercício cardiovascular para queima de gordura e condicionamento.",
    instrucoes: "Mantenha postura ereta, passadas naturais, controle a respiração.",
    videoUrl: "https://www.youtube.com/embed/wRkeBVMQSgg",
    imagem: "https://images.unsplash.com/photo-1714356422650-ec750a460407",
    imagemAlt: "Pessoa correndo na esteira em academia moderna",
    tempoExecucao: "20-30 minutos",
    calorias: 12
  },
  {
    id: 4,
    nome: "Alongamento Posterior",
    categoria: "flexibilidade",
    grupoMuscular: "posterior",
    equipamento: "Nenhum",
    dificuldade: "Iniciante",
    descricao: "Alongamento para músculos posteriores da coxa e lombar.",
    instrucoes: "Sente com pernas estendidas, incline o tronco para frente suavemente.",
    videoUrl: "https://www.youtube.com/embed/4BOTvaRaDjI",
    imagem: "https://images.unsplash.com/photo-1617372591452-9adad3e8070e",
    imagemAlt: "Mulher fazendo alongamento sentada tocando os pés",
    tempoExecucao: "60-90 segundos",
    calorias: 2
  },
  {
    id: 5,
    nome: "Rosca Direta",
    categoria: "força",
    grupoMuscular: "bracos",
    equipamento: "Halteres",
    dificuldade: "Iniciante",
    descricao: "Exercício isolado para desenvolvimento do bíceps braquial.",
    instrucoes: "Braços ao lado do corpo, flexione os cotovelos elevando os halteres.",
    videoUrl: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    imagem: "https://images.unsplash.com/photo-1694383030805-588bc27713cf",
    imagemAlt: "Homem executando rosca direta com halteres em pé",
    tempoExecucao: "30-45 segundos",
    calorias: 4
  },
  {
    id: 6,
    nome: "Prancha Abdominal",
    categoria: "força",
    grupoMuscular: "core",
    equipamento: "Nenhum",
    dificuldade: "Intermediário",
    descricao: "Exercício isométrico para fortalecimento do core e estabilidade.",
    instrucoes: "Posição de flexão, apoie nos antebraços, mantenha corpo alinhado.",
    videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
    imagem: "https://images.unsplash.com/photo-1593538388530-93111b779aa7",
    imagemAlt: "Pessoa mantendo posição de prancha abdominal no solo",
    tempoExecucao: "30-60 segundos",
    calorias: 5
  }];


  const categoryOptions = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'força', label: 'Força' },
  { value: 'flexibilidade', label: 'Flexibilidade' }];


  const muscleGroupOptions = [
  { value: 'all', label: 'Todos os Grupos' },
  { value: 'peito', label: 'Peito' },
  { value: 'costas', label: 'Costas' },
  { value: 'pernas', label: 'Pernas' },
  { value: 'bracos', label: 'Braços' },
  { value: 'core', label: 'Core' },
  { value: 'posterior', label: 'Posterior' },
  { value: 'corpo-todo', label: 'Corpo Todo' }];


  const filteredExercises = useMemo(() => {
    return exercises?.filter((exercise) => {
      const matchesSearch = exercise?.nome?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      exercise?.descricao?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || exercise?.categoria === selectedCategory;
      const matchesMuscleGroup = selectedMuscleGroup === 'all' || exercise?.grupoMuscular === selectedMuscleGroup;

      return matchesSearch && matchesCategory && matchesMuscleGroup;
    });
  }, [searchTerm, selectedCategory, selectedMuscleGroup]);

  const handleAddExercise = (exercise) => {
    onAddExercise({
      ...exercise,
      series: 3,
      repeticoes: 12,
      peso: 0,
      tempoDescanso: 60
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Iniciante':return 'text-success';
      case 'Intermediário':return 'text-warning';
      case 'Avançado':return 'text-destructive';
      default:return 'text-muted-foreground';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cardio':return 'Heart';
      case 'força':return 'Dumbbell';
      case 'flexibilidade':return 'Zap';
      default:return 'Activity';
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg h-full flex flex-col ${isOpen ? 'block' : 'hidden lg:block'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Biblioteca de Exercícios</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="lg:hidden">

          <Icon name="X" size={20} />
        </Button>
      </div>
      {/* Filters */}
      <div className="p-4 space-y-4 border-b border-border">
        <Input
          type="search"
          placeholder="Buscar exercícios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)} />

        
        <div className="grid grid-cols-1 gap-3">
          <Select
            placeholder="Categoria"
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory} />

          
          <Select
            placeholder="Grupo Muscular"
            options={muscleGroupOptions}
            value={selectedMuscleGroup}
            onChange={setSelectedMuscleGroup} />

        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredExercises?.length} exercícios encontrados</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedMuscleGroup('all');
            }}>

            Limpar Filtros
          </Button>
        </div>
      </div>
      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredExercises?.map((exercise) =>
        <div
          key={exercise?.id}
          className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => setPreviewExercise(exercise)}>

            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                src={exercise?.imagem}
                alt={exercise?.imagemAlt}
                className="w-full h-full object-cover" />

              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-foreground text-sm truncate">
                    {exercise?.nome}
                  </h3>
                  <Icon
                  name={getCategoryIcon(exercise?.categoria)}
                  size={16}
                  className="text-primary flex-shrink-0 ml-2" />

                </div>
                
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {exercise?.descricao}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={`font-medium ${getDifficultyColor(exercise?.dificuldade)}`}>
                      {exercise?.dificuldade}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{exercise?.equipamento}</span>
                  </div>
                  
                  <Button
                  variant="outline"
                  size="xs"
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleAddExercise(exercise);
                  }}
                  iconName="Plus"
                  iconPosition="left">

                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredExercises?.length === 0 &&
        <div className="text-center py-8">
            <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum exercício encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tente ajustar os filtros de busca
            </p>
          </div>
        }
      </div>
      {/* Exercise Preview Modal */}
      {previewExercise &&
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                {previewExercise?.nome}
              </h3>
              <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreviewExercise(null)}>

                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Video */}
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                width="100%"
                height="100%"
                src={previewExercise?.videoUrl}
                title={`Vídeo demonstrativo: ${previewExercise?.nome}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full" />

              </div>
              
              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Categoria:</span>
                  <p className="font-medium text-foreground capitalize">{previewExercise?.categoria}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Dificuldade:</span>
                  <p className={`font-medium ${getDifficultyColor(previewExercise?.dificuldade)}`}>
                    {previewExercise?.dificuldade}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Equipamento:</span>
                  <p className="font-medium text-foreground">{previewExercise?.equipamento}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tempo:</span>
                  <p className="font-medium text-foreground">{previewExercise?.tempoExecucao}</p>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <h4 className="font-medium text-foreground mb-2">Descrição</h4>
                <p className="text-sm text-muted-foreground">{previewExercise?.descricao}</p>
              </div>
              
              {/* Instructions */}
              <div>
                <h4 className="font-medium text-foreground mb-2">Instruções</h4>
                <p className="text-sm text-muted-foreground">{previewExercise?.instrucoes}</p>
              </div>
              
              {/* Action */}
              <div className="flex justify-end pt-4">
                <Button
                onClick={() => {
                  handleAddExercise(previewExercise);
                  setPreviewExercise(null);
                }}
                iconName="Plus"
                iconPosition="left">

                  Adicionar ao Treino
                </Button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default ExerciseLibraryPanel;