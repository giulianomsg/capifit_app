import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities = [], className = "" }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'workout':
        return 'Dumbbell';
      case 'message':
        return 'MessageSquare';
      case 'assessment':
        return 'FileText';
      case 'subscription':
        return 'CreditCard';
      case 'achievement':
        return 'Trophy';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'workout':
        return 'text-primary';
      case 'message':
        return 'text-secondary';
      case 'assessment':
        return 'text-accent';
      case 'subscription':
        return 'text-success';
      case 'achievement':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Atividades Recentes</h3>
        <Icon name="Clock" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {activities?.length > 0 ? (
          activities?.map((activity) => (
            <div key={activity?.id} className="flex items-start space-x-3 pb-3 border-b border-border last:border-b-0 last:pb-0">
              <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon 
                  name={getActivityIcon(activity?.type)} 
                  size={14} 
                  className={getActivityColor(activity?.type)}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity?.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity?.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity?.timestamp}
                </p>
              </div>

              {activity?.badge && (
                <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {activity?.badge}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Icon name="Activity" size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade recente
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;