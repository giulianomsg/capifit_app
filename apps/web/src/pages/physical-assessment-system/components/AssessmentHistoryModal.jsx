import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const sortOptions = [
  { value: 'date_desc', label: 'Data (mais recente)' },
  { value: 'date_asc', label: 'Data (mais antiga)' },
  { value: 'client', label: 'Nome do cliente' },
];

const AssessmentHistoryModal = ({ isOpen, onClose, history = [], clients = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  const clientOptions = useMemo(
    () => [{ value: 'all', label: 'Todos os clientes' }, ...clients.map((client) => ({ value: client.clientId, label: client.name }))],
    [clients],
  );

  const filteredHistory = useMemo(() => {
    let result = history;

    if (filterClient !== 'all') {
      result = result.filter((item) => item.client?.id === filterClient);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        return (
          item.client?.name?.toLowerCase().includes(term) ||
          item.template?.name?.toLowerCase().includes(term) ||
          item.notes?.toLowerCase().includes(term)
        );
      });
    }

    switch (sortBy) {
      case 'date_asc':
        result = [...result].sort((a, b) => new Date(a.performedAt ?? a.scheduledFor ?? 0) - new Date(b.performedAt ?? b.scheduledFor ?? 0));
        break;
      case 'client':
        result = [...result].sort((a, b) => (a.client?.name ?? '').localeCompare(b.client?.name ?? ''));
        break;
      default:
        result = [...result].sort((a, b) => new Date(b.performedAt ?? b.scheduledFor ?? 0) - new Date(a.performedAt ?? a.scheduledFor ?? 0));
    }

    return result;
  }, [history, filterClient, searchTerm, sortBy]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Histórico de avaliações</h3>
            <p className="text-sm text-muted-foreground">
              Visualize as avaliações concluídas e agendadas de todos os clientes.
            </p>
          </div>
          <Button variant="ghost" iconName="X" onClick={onClose} />
        </div>

        <div className="p-6 space-y-4 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar por cliente ou observação"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Select value={filterClient} onChange={setFilterClient} options={clientOptions} />
            <Select value={sortBy} onChange={setSortBy} options={sortOptions} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredHistory.length ? (
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredHistory.map((assessment) => {
                  const status = assessment.status === 'COMPLETED' ? 'Concluída' : assessment.status === 'SCHEDULED' ? 'Agendada' : 'Pendente';
                  const statusColor =
                    assessment.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : assessment.status === 'SCHEDULED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800';

                  return (
                    <tr key={assessment.id}>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {new Date(assessment.performedAt ?? assessment.scheduledFor ?? Date.now()).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{assessment.client?.name ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{assessment.template?.name ?? 'Avaliação'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>{status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {assessment.notes ? assessment.notes : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <Icon name="ClipboardList" size={36} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma avaliação encontrada com os filtros selecionados.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentHistoryModal;
