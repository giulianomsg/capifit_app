import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ExerciseTable = ({ 
  exercises, 
  viewMode, 
  onViewExercise, 
  onAddToWorkout, 
  onToggleFavorite 
}) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Iniciante': return 'text-green-600 bg-green-100';
      case 'Intermediário': return 'text-yellow-600 bg-yellow-100';
      case 'Avançado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises?.map((exercise) => (
          <div key={exercise?.id} className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
            {/* Exercise Image */}
            <div className="relative h-48 bg-muted">
              <img
                src={exercise?.imagem}
                alt={exercise?.alt}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onToggleFavorite(exercise?.id)}
                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  exercise?.isFavorite 
                    ? 'bg-red-500 text-white' :'bg-white/80 text-gray-600 hover:bg-white'
                }`}
              >
                <Icon name="Heart" size={16} fill={exercise?.isFavorite} />
              </button>
            </div>

            {/* Card Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                  {exercise?.nome}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Icon name="Star" size={14} className="mr-1 text-yellow-500" fill />
                  {exercise?.rating}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Grupo Muscular:</span>
                  <span className="text-sm font-medium text-foreground">{exercise?.grupoMuscular}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Equipamento:</span>
                  <span className="text-sm text-foreground">{exercise?.equipamento}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dificuldade:</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(exercise?.dificuldade)}`}>
                    {exercise?.dificuldade}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {exercise?.tags?.slice(0, 3)?.map((tag, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewExercise(exercise)}
                  className="flex-1"
                  iconName="Eye"
                  iconPosition="left"
                >
                  Ver Detalhes
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAddToWorkout(exercise)}
                  className="flex-1"
                  iconName="Plus"
                  iconPosition="left"
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table view
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground">Exercício</th>
              <th className="text-left p-4 font-semibold text-foreground">Categoria</th>
              <th className="text-left p-4 font-semibold text-foreground">Grupo Muscular</th>
              <th className="text-left p-4 font-semibold text-foreground">Equipamento</th>
              <th className="text-left p-4 font-semibold text-foreground">Dificuldade</th>
              <th className="text-left p-4 font-semibold text-foreground">Avaliação</th>
              <th className="text-center p-4 font-semibold text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {exercises?.map((exercise, index) => (
              <tr key={exercise?.id} className={`border-t border-border hover:bg-muted/30 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={exercise?.imagem}
                      alt={exercise?.alt}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-foreground">{exercise?.nome}</h4>
                        {exercise?.isFavorite && (
                          <Icon name="Heart" size={14} className="text-red-500" fill />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{exercise?.categoria}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-foreground">{exercise?.categoria}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-foreground">{exercise?.grupoMuscular}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-foreground">{exercise?.equipamento}</span>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(exercise?.dificuldade)}`}>
                    {exercise?.dificuldade}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={14} className="text-yellow-500" fill />
                    <span className="text-sm text-foreground">{exercise?.rating}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleFavorite(exercise?.id)}
                      iconName="Heart"
                      className={exercise?.isFavorite ? 'text-red-500' : 'text-muted-foreground'}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewExercise(exercise)}
                      iconName="Eye"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddToWorkout(exercise)}
                      iconName="Plus"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExerciseTable;