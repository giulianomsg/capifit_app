import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const statusConfig = {
  scheduled: { label: 'Agendado', classes: 'bg-blue-100 text-blue-800 border-blue-200' },
  completed: { label: 'Concluído', classes: 'bg-green-100 text-green-800 border-green-200' },
  delayed: { label: 'Atrasado', classes: 'bg-red-100 text-red-800 border-red-200' },
  pending: { label: 'Pendente', classes: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const ClientAssessmentList = ({ clients, onClientSelect, onSchedule }) => {
  if (!clients?.length) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-2xl">
        <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum cliente encontrado</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Cadastre clientes e associe-os ao treinador para começar a registrar avaliações físicas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => {
        const status = statusConfig[client.status] ?? statusConfig.pending;
        const lastAssessmentDate = client.lastAssessment ? new Date(client.lastAssessment) : null;
        const nextAssessmentDate = client.nextAssessment ? new Date(client.nextAssessment) : null;

        return (
          <div
            key={client.clientId}
            className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {client.avatarUrl ? (
                    <img
                      src={client.avatarUrl}
                      alt={`Foto de ${client.name}`}
                      className="w-full h-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Icon name="User" size={24} className="text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-foreground">{client.name}</h4>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${status.classes}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                    <span>
                      Última avaliação:{' '}
                      <strong className="text-foreground">
                        {lastAssessmentDate ? lastAssessmentDate.toLocaleDateString('pt-BR') : '—'}
                      </strong>
                    </span>
                    <span>
                      Próxima avaliação:{' '}
                      <strong className="text-foreground">
                        {nextAssessmentDate ? nextAssessmentDate.toLocaleDateString('pt-BR') : '—'}
                      </strong>
                    </span>
                    <span>
                      Progresso:{' '}
                      <strong className="text-foreground">{client.progressPercentage ?? 0}%</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => onClientSelect?.(client)}>
                  <Icon name="BarChart2" size={16} className="mr-1" />
                  Ver evolução
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSchedule?.(client)}
                  className="flex items-center"
                >
                  <Icon name="Calendar" size={16} className="mr-1" />
                  Agendar
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClientAssessmentList;
