import React from 'react';

const StatusBadge = ({ type, status, className = "" }) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'subscription':
        switch (status) {
          case 'mensal':
            return {
              label: 'Mensal',
              className: 'bg-primary/10 text-primary border-primary/20'
            };
          case 'trimestral':
            return {
              label: 'Trimestral',
              className: 'bg-secondary/10 text-secondary border-secondary/20'
            };
          case 'anual':
            return {
              label: 'Anual',
              className: 'bg-accent/10 text-accent border-accent/20'
            };
          default:
            return {
              label: 'Sem Plano',
              className: 'bg-muted text-muted-foreground border-border'
            };
        }
      
      case 'payment':
        switch (status) {
          case 'em-dia':
            return {
              label: 'Em Dia',
              className: 'bg-success/10 text-success border-success/20'
            };
          case 'pendente':
            return {
              label: 'Pendente',
              className: 'bg-warning/10 text-warning border-warning/20'
            };
          case 'atrasado':
            return {
              label: 'Atrasado',
              className: 'bg-destructive/10 text-destructive border-destructive/20'
            };
          default:
            return {
              label: 'Indefinido',
              className: 'bg-muted text-muted-foreground border-border'
            };
        }
      
      case 'activity':
        switch (status) {
          case 'alto':
            return {
              label: 'Alto',
              className: 'bg-success/10 text-success border-success/20'
            };
          case 'medio':
            return {
              label: 'Médio',
              className: 'bg-warning/10 text-warning border-warning/20'
            };
          case 'baixo':
            return {
              label: 'Baixo',
              className: 'bg-accent/10 text-accent border-accent/20'
            };
          case 'inativo':
            return {
              label: 'Inativo',
              className: 'bg-destructive/10 text-destructive border-destructive/20'
            };
          default:
            return {
              label: 'Indefinido',
              className: 'bg-muted text-muted-foreground border-border'
            };
        }
      
      default:
        return {
          label: status || 'Indefinido',
          className: 'bg-muted text-muted-foreground border-border'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`
      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
      ${config?.className} ${className}
    `}>
      {config?.label}
    </span>
  );
};

export default StatusBadge;