import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ExerciseDetailsModal = ({ 
  exercise, 
  onClose, 
  onAddToWorkout, 
  onToggleFavorite 
}) => {
  const [activeTab, setActiveTab] = useState('instructions');

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Iniciante': return 'text-green-600 bg-green-100';
      case 'Intermediário': return 'text-yellow-600 bg-yellow-100';
      case 'Avançado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'instructions', label: 'Instruções', icon: 'FileText' },
    { id: 'muscles', label: 'Músculos', icon: 'User' },
    { id: 'tips', label: 'Dicas', icon: 'Lightbulb' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-card rounded-lg border border-border max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <img
              src={exercise?.imagem}
              alt={exercise?.alt}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold text-foreground">{exercise?.nome}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-muted-foreground">{exercise?.categoria}</span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{exercise?.grupoMuscular}</span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(exercise?.dificuldade)}`}>
                  {exercise?.dificuldade}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => onToggleFavorite(exercise?.id)}
              iconName="Heart"
              className={exercise?.isFavorite ? 'text-red-500' : 'text-muted-foreground'}
            />
            <Button variant="ghost" onClick={onClose} iconName="X" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Video/Image Section */}
          <div className="lg:w-1/2 p-6">
            <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
              {exercise?.videoUrl ? (
                <video
                  controls
                  className="w-full h-full rounded-lg"
                  poster={exercise?.imagem}
                >
                  <source src={exercise?.videoUrl} type="video/mp4" />
                  Seu navegador não suporta vídeo.
                </video>
              ) : (
                <div className="text-center">
                  <Icon name="Play" size={48} className="text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Vídeo em breve</p>
                </div>
              )}
            </div>

            {/* Exercise Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon name="Zap" size={16} className="text-orange-500" />
                    <span className="text-sm font-medium text-foreground">Calorias</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{exercise?.calorias}/min</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon name="Clock" size={16} className="text-blue-500" />
                    <span className="text-sm font-medium text-foreground">Duração</span>
                  </div>
                  <p className="text-sm text-foreground">{exercise?.tempo}</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Star" size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">Avaliação</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5]?.map((star) => (
                      <Icon
                        key={star}
                        name="Star"
                        size={16}
                        className={star <= Math.floor(exercise?.rating) ? 'text-yellow-500' : 'text-gray-300'}
                        fill={star <= Math.floor(exercise?.rating)}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{exercise?.rating}</span>
                  <span className="text-sm text-muted-foreground">(247 avaliações)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:w-1/2 border-l border-border">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab?.id
                      ? 'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              {activeTab === 'instructions' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Como Executar</h3>
                    <p className="text-foreground leading-relaxed">{exercise?.instrucoes}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Equipamento Necessário</h4>
                    <span className="inline-block px-3 py-1 bg-muted text-foreground rounded-full text-sm">
                      {exercise?.equipamento}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {exercise?.tags?.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'muscles' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Músculos Ativados</h3>
                  <div className="space-y-2">
                    {exercise?.musculosAtivados?.map((muscle, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-muted/50 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-foreground">{muscle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tips' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Dicas Importantes</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>Respiração:</strong> Inspire na fase excêntrica e expire na fase concêntrica do movimento.
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                      <p className="text-sm text-green-800">
                        <strong>Segurança:</strong> Mantenha sempre o controle do movimento, evite usar momentum.
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>Progressão:</strong> Aumente a carga gradualmente conforme sua evolução.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Última atualização: 15 de outubro, 2024
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={onAddToWorkout} iconName="Plus" iconPosition="left">
              Adicionar ao Treino
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailsModal;