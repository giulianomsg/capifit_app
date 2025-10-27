import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingSchedule = ({ events = [], userRole = 'trainer', className = "" }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'workout':
        return 'Dumbbell';
      case 'assessment':
        return 'FileText';
      case 'consultation':
        return 'MessageCircle';
      case 'nutrition':
        return 'Apple';
      default:
        return 'Calendar';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'workout':
        return 'bg-primary/10 text-primary';
      case 'assessment':
        return 'bg-accent/10 text-accent';
      case 'consultation':
        return 'bg-secondary/10 text-secondary';
      case 'nutrition':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {userRole === 'trainer' ? 'Próximos Agendamentos' : 'Minha Agenda'}
        </h3>
        <Icon name="Calendar" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {events?.length > 0 ? (
          events?.map((event) => (
            <div key={event?.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEventColor(event?.type)}`}>
                <Icon name={getEventIcon(event?.type)} size={16} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {event?.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {event?.client && `${event?.client} • `}{event?.time}
                </p>
                {event?.location && (
                  <p className="text-xs text-muted-foreground">
                    📍 {event?.location}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-1">
                {event?.status === 'confirmed' && (
                  <div className="w-2 h-2 bg-success rounded-full" />
                )}
                {event?.status === 'pending' && (
                  <div className="w-2 h-2 bg-warning rounded-full" />
                )}
                <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Icon name="Calendar" size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Nenhum agendamento próximo
            </p>
            <Button
              variant="outline"
              size="sm"
              iconName="Plus"
              iconPosition="left"
            >
              Agendar Sessão
            </Button>
          </div>
        )}
      </div>
      {events?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-primary hover:text-primary"
          >
            Ver agenda completa
            <Icon name="ArrowRight" size={14} className="ml-auto" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default UpcomingSchedule;