import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AchievementNotifications = ({ achievements = [], className = "" }) => {
  const getAchievementIcon = (type) => {
    switch (type) {
      case 'streak':
        return 'Flame';
      case 'goal':
        return 'Target';
      case 'milestone':
        return 'Trophy';
      case 'improvement':
        return 'TrendingUp';
      case 'consistency':
        return 'Calendar';
      default:
        return 'Award';
    }
  };

  const getAchievementColor = (type) => {
    switch (type) {
      case 'streak':
        return 'bg-accent text-accent-foreground';
      case 'goal':
        return 'bg-success text-success-foreground';
      case 'milestone':
        return 'bg-warning text-warning-foreground';
      case 'improvement':
        return 'bg-primary text-primary-foreground';
      case 'consistency':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Conquistas Recentes</h3>
        <Icon name="Award" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {achievements?.length > 0 ? (
          achievements?.map((achievement) => (
            <div key={achievement?.id} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-accent/5 to-transparent rounded-lg border border-accent/20">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAchievementColor(achievement?.type)} shadow-sm`}>
                <Icon name={getAchievementIcon(achievement?.type)} size={16} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-foreground">
                    {achievement?.title}
                  </p>
                  {achievement?.isNew && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-full">
                      Novo!
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {achievement?.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {achievement?.earnedAt}
                </p>
                
                {achievement?.progress && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progresso</span>
                      <span>{achievement?.progress?.current}/{achievement?.progress?.total}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-accent h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(achievement?.progress?.current / achievement?.progress?.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {achievement?.points && (
                <div className="text-right">
                  <p className="text-xs font-medium text-accent">
                    +{achievement?.points} pts
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Icon name="Award" size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Nenhuma conquista recente
            </p>
            <p className="text-xs text-muted-foreground">
              Continue treinando para desbloquear conquistas!
            </p>
          </div>
        )}
      </div>
      {achievements?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-primary hover:text-primary"
          >
            Ver todas as conquistas
            <Icon name="ArrowRight" size={14} className="ml-auto" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AchievementNotifications;