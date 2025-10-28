import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'bg-primary', 
  trend = null,
  actionLabel = null,
  onActionClick = null,
  className = ""
}) => {
  return (
    <div className={`bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon name={icon} size={24} color="white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend?.type === 'up' ? 'bg-success/10 text-success' : 
            trend?.type === 'down'? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
          }`}>
            <Icon 
              name={trend?.type === 'up' ? 'TrendingUp' : trend?.type === 'down' ? 'TrendingDown' : 'Minus'} 
              size={12} 
            />
            <span>{trend?.value}</span>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {/* Action */}
      {actionLabel && onActionClick && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onActionClick}
          className="w-full justify-start text-primary hover:text-primary"
        >
          {actionLabel}
          <Icon name="ArrowRight" size={14} className="ml-auto" />
        </Button>
      )}
    </div>
  );
};

export default StatsCard;