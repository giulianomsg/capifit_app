import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExerciseInstructions = ({ exercise }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('instructions'); // instructions, tips, video

  if (!exercise) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="BookOpen" size={20} className="mr-2" />
          Instruções do Exercício
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
        />
      </div>

      {/* Exercise Basic Info */}
      <div className="mb-4">
        <h5 className="font-semibold text-foreground mb-2">{exercise?.name}</h5>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
            {exercise?.category}
          </span>
          <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-md">
            {exercise?.muscleGroup}
          </span>
          <span className="px-2 py-1 bg-accent/10 text-accent rounded-md">
            {exercise?.equipment}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'instructions' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="List" size={16} className="mr-1 inline" />
              Execução
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tips' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Lightbulb" size={16} className="mr-1 inline" />
              Dicas
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'video' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Play" size={16} className="mr-1 inline" />
              Vídeo
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {/* Instructions Tab */}
            {activeTab === 'instructions' && (
              <div className="space-y-3">
                <h6 className="font-medium text-foreground">Como executar:</h6>
                <ol className="space-y-2">
                  {exercise?.instructions?.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {instruction}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tips Tab */}
            {activeTab === 'tips' && (
              <div className="space-y-4">
                <h6 className="font-medium text-foreground">Dicas importantes:</h6>
                
                {exercise?.tips && (
                  <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                      <p className="text-sm text-foreground">{exercise?.tips}</p>
                    </div>
                  </div>
                )}

                {/* Common Tips */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Icon name="Target" size={16} className="text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Foco na forma</p>
                      <p className="text-xs text-muted-foreground">Priorize a execução correta antes de aumentar o peso</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Icon name="Wind" size={16} className="text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Respiração</p>
                      <p className="text-xs text-muted-foreground">Expire na fase concêntrica (esforço), inspire na excêntrica</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Icon name="Clock" size={16} className="text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Tempo de execução</p>
                      <p className="text-xs text-muted-foreground">Controle a velocidade, evite movimentos balísticos</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Tab */}
            {activeTab === 'video' && (
              <div className="space-y-4">
                {exercise?.videoUrl ? (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Icon name="Play" size={48} className="text-primary mb-2 mx-auto" />
                      <p className="text-sm text-muted-foreground">Vídeo demonstrativo</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        iconName="ExternalLink"
                        iconPosition="left"
                      >
                        Abrir Vídeo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted/30 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Icon name="VideoOff" size={48} className="text-muted-foreground mb-2 mx-auto" />
                      <p className="text-sm text-muted-foreground">Vídeo não disponível</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Consulte as instruções escritas acima
                      </p>
                    </div>
                  </div>
                )}

                {/* Alternative Videos */}
                <div>
                  <h6 className="font-medium text-foreground mb-3">Vídeos relacionados:</h6>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      className="justify-start"
                      iconName="Play"
                      iconPosition="left"
                    >
                      Variação com halteres
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      className="justify-start"
                      iconName="Play"
                      iconPosition="left"
                    >
                      Erros comuns a evitar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Quick View */}
      {!isExpanded && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Target" size={14} />
            <span>Foque na forma correta durante a execução</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Wind" size={14} />
            <span>Mantenha a respiração controlada</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseInstructions;