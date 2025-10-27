import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const WorkoutTemplates = ({ onLoadTemplate, isOpen, onToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    {
      id: 1,
      nome: "Peito e Tríceps - Iniciante",
      categoria: "força",
      dificuldade: "Iniciante",
      exercicios: 6,
      duracao: 45,
      calorias: 280,
      descricao: "Treino focado no desenvolvimento do peitoral e tríceps para iniciantes",
      gruposMusculares: ["Peito", "Tríceps"],
      criadoEm: "2025-10-20",
      ultimoUso: "2025-10-25",
      vezesUsado: 12,
      exerciciosPreview: [
        "Supino Reto",
        "Supino Inclinado",
        "Crucifixo",
        "Tríceps Pulley",
        "Tríceps Francês",
        "Flexão de Braço"
      ]
    },
    {
      id: 2,
      nome: "Pernas Completo",
      categoria: "força",
      dificuldade: "Intermediário",
      exercicios: 8,
      duracao: 60,
      calorias: 420,
      descricao: "Treino completo para membros inferiores com foco em quadríceps e glúteos",
      gruposMusculares: ["Quadríceps", "Glúteos", "Posterior"],
      criadoEm: "2025-10-18",
      ultimoUso: "2025-10-26",
      vezesUsado: 18,
      exerciciosPreview: [
        "Agachamento Livre",
        "Leg Press",
        "Cadeira Extensora",
        "Mesa Flexora",
        "Stiff",
        "Panturrilha em Pé",
        "Afundo",
        "Glúteo 4 Apoios"
      ]
    },
    {
      id: 3,
      nome: "Cardio HIIT 20min",
      categoria: "cardio",
      dificuldade: "Avançado",
      exercicios: 5,
      duracao: 20,
      calorias: 320,
      descricao: "Treino intervalado de alta intensidade para queima de gordura",
      gruposMusculares: ["Corpo Todo"],
      criadoEm: "2025-10-15",
      ultimoUso: "2025-10-27",
      vezesUsado: 25,
      exerciciosPreview: [
        "Burpees",
        "Mountain Climbers",
        "Jump Squats",
        "High Knees",
        "Plank Jacks"
      ]
    },
    {
      id: 4,
      nome: "Costas e Bíceps",
      categoria: "força",
      dificuldade: "Intermediário",
      exercicios: 7,
      duracao: 50,
      calorias: 350,
      descricao: "Desenvolvimento da musculatura das costas e bíceps",
      gruposMusculares: ["Costas", "Bíceps"],
      criadoEm: "2025-10-12",
      ultimoUso: "2025-10-24",
      vezesUsado: 15,
      exerciciosPreview: [
        "Puxada Frontal",
        "Remada Curvada",
        "Pulldown",
        "Rosca Direta",
        "Rosca Martelo",
        "Rosca Concentrada",
        "Face Pull"
      ]
    },
    {
      id: 5,
      nome: "Alongamento Completo",
      categoria: "flexibilidade",
      dificuldade: "Iniciante",
      exercicios: 10,
      duracao: 30,
      calorias: 80,
      descricao: "Rotina completa de alongamento para todos os grupos musculares",
      gruposMusculares: ["Corpo Todo"],
      criadoEm: "2025-10-10",
      ultimoUso: "2025-10-26",
      vezesUsado: 8,
      exerciciosPreview: [
        "Alongamento Posterior",
        "Alongamento Quadríceps",
        "Alongamento Panturrilha",
        "Alongamento Ombros",
        "Alongamento Pescoço",
        "Alongamento Lombar",
        "Alongamento Glúteos",
        "Alongamento Peito",
        "Alongamento Bíceps",
        "Relaxamento Final"
      ]
    }
  ];

  const categoryOptions = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'força', label: 'Força' },
    { value: 'flexibilidade', label: 'Flexibilidade' }
  ];

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template?.nome?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         template?.descricao?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template?.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('pt-BR');
  };

  return (
    <div className={`bg-card border border-border rounded-lg h-full flex flex-col ${isOpen ? 'block' : 'hidden lg:block'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Templates Salvos</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="lg:hidden"
        >
          <Icon name="X" size={20} />
        </Button>
      </div>
      {/* Filters */}
      <div className="p-4 space-y-4 border-b border-border">
        <Input
          type="search"
          placeholder="Buscar templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)}
        />
        
        <Select
          placeholder="Categoria"
          options={categoryOptions}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredTemplates?.length} template{filteredTemplates?.length !== 1 ? 's' : ''}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          >
            Limpar
          </Button>
        </div>
      </div>
      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredTemplates?.map((template) => (
          <div
            key={template?.id}
            className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            {/* Template Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon 
                    name={getCategoryIcon(template?.categoria)} 
                    size={16} 
                    className="text-primary"
                  />
                  <h3 className="font-semibold text-foreground">{template?.nome}</h3>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template?.descricao}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLoadTemplate(template)}
                iconName="Download"
                iconPosition="left"
              >
                Usar
              </Button>
            </div>

            {/* Template Stats */}
            <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
              <div className="text-center">
                <div className="font-semibold text-foreground">{template?.exercicios}</div>
                <div className="text-muted-foreground">Exercícios</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">{template?.duracao}min</div>
                <div className="text-muted-foreground">Duração</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">{template?.calorias}</div>
                <div className="text-muted-foreground">Calorias</div>
              </div>
            </div>

            {/* Muscle Groups */}
            <div className="flex flex-wrap gap-1 mb-3">
              {template?.gruposMusculares?.map((grupo, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {grupo}
                </span>
              ))}
            </div>

            {/* Exercise Preview */}
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Exercícios inclusos:
              </p>
              <div className="text-xs text-muted-foreground">
                {template?.exerciciosPreview?.slice(0, 3)?.join(', ')}
                {template?.exerciciosPreview?.length > 3 && ` +${template?.exerciciosPreview?.length - 3} mais`}
              </div>
            </div>

            {/* Template Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
              <div className="flex items-center space-x-3">
                <span className={`font-medium ${getDifficultyColor(template?.dificuldade)}`}>
                  {template?.dificuldade}
                </span>
                <span>Usado {template?.vezesUsado}x</span>
              </div>
              <span>Último uso: {formatDate(template?.ultimoUso)}</span>
            </div>
          </div>
        ))}

        {filteredTemplates?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum template encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie seu primeiro template salvando um treino
            </p>
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          iconName="Plus"
          iconPosition="left"
        >
          Criar Novo Template
        </Button>
      </div>
    </div>
  );
};

export default WorkoutTemplates;