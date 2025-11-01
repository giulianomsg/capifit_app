import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AssessmentStatsCards = ({
  title,
  value,
  subtitle,
  icon,
  color = 'bg-primary',
  trend,
  actionLabel,
  onActionClick
}) => {
  const getTrendColor = (type) => {
    switch (type) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (type) => {
    switch (type) {
      case 'up':
        return 'TrendingUp';
      case 'down':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
              <Icon name={icon} size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{subtitle}</p>
            
            {trend && (
              <div className="flex items-center space-x-1">
                <Icon 
                  name={getTrendIcon(trend?.type)} 
                  size={14} 
                  className={getTrendColor(trend?.type)} 
                />
                <span className={`text-xs font-medium ${getTrendColor(trend?.type)}`}>
                  {trend?.value}
                </span>
                <span className="text-xs text-muted-foreground">vs mês anterior</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {actionLabel && onActionClick && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onActionClick}
            className="w-full justify-center"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssessmentStatsCards;