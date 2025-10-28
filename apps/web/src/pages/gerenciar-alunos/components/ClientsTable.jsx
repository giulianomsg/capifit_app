import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import StatusBadge from './StatusBadge';
import ClientActionMenu from './ClientActionMenu';

const ClientsTable = ({
  clients = [],
  onBulkAction = null,
  onClientAction = null,
  searchTerm = '',
  onSearchChange = () => {},
  filters = { subscription: 'all', paymentStatus: 'all', activityLevel: 'all' },
  onFiltersChange = () => {},
}) => {
  const [selectedClients, setSelectedClients] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filteredClients = useMemo(() => {
    let filtered = clients;

    if (filters.subscription !== 'all') {
      filtered = filtered.filter((client) => client?.planoAtivo === filters.subscription);
    }

    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter((client) => client?.statusPagamento === filters.paymentStatus);
    }

    if (filters.activityLevel !== 'all') {
      filtered = filtered.filter((client) => client?.nivelAtividade === filters.activityLevel);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((client) => {
        return (
          client?.nome?.toLowerCase().includes(term) ||
          client?.email?.toLowerCase().includes(term) ||
          client?.telefone?.toLowerCase().includes(term)
        );
      });
    }

    if (sortConfig?.key) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a?.[sortConfig.key];
        let bValue = b?.[sortConfig.key];

        if (['ultimoTreino', 'proximaAvaliacao', 'dataInscricao'].includes(sortConfig.key)) {
          aValue = aValue ? new Date(aValue) : new Date(0);
          bValue = bValue ? new Date(bValue) : new Date(0);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [clients, filters, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedClients(filteredClients.map((client) => client?.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelectClient = (clientId, checked) => {
    if (checked) {
      setSelectedClients((prev) => [...prev, clientId]);
    } else {
      setSelectedClients((prev) => prev.filter((id) => id !== clientId));
    }
  };

  const handleBulkAction = (action) => {
    if (onBulkAction) {
      onBulkAction(action, selectedClients);
    }
    setSelectedClients([]);
  };

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return 'ArrowUpDown';
    return sortConfig.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('pt-BR');
  };

  const subscriptionOptions = [
    { value: 'all', label: 'Todos os Planos' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'anual', label: 'Anual' },
    { value: 'personalizado', label: 'Personalizado' },
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'em-dia', label: 'Em Dia' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'atrasado', label: 'Atrasado' },
  ];

  const activityLevelOptions = [
    { value: 'all', label: 'Todos os Níveis' },
    { value: 'alto', label: 'Alto' },
    { value: 'medio', label: 'Médio' },
    { value: 'baixo', label: 'Baixo' },
    { value: 'inativo', label: 'Inativo' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-6 border-b border-border bg-muted/30 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <Input
            type="search"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e?.target?.value)}
            className="w-full"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              options={subscriptionOptions}
              value={filters.subscription}
              onChange={(value) => onFiltersChange({ ...filters, subscription: value })}
              placeholder="Filtrar por plano"
              className="w-full sm:w-48"
            />

            <Select
              options={paymentStatusOptions}
              value={filters.paymentStatus}
              onChange={(value) => onFiltersChange({ ...filters, paymentStatus: value })}
              placeholder="Status pagamento"
              className="w-full sm:w-48"
            />

            <Select
              options={activityLevelOptions}
              value={filters.activityLevel}
              onChange={(value) => onFiltersChange({ ...filters, activityLevel: value })}
              placeholder="Nível atividade"
              className="w-full sm:w-48"
            />
          </div>
        </div>

        {selectedClients.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium text-foreground">
              {selectedClients.length} cliente(s) selecionado(s)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('message')}
                iconName="MessageSquare"
                iconPosition="left"
              >
                Enviar Mensagem
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('export')}
                iconName="Download"
                iconPosition="left"
              >
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('updatePlan')}
                iconName="Edit"
                iconPosition="left"
              >
                Atualizar Plano
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredClients.length} cliente(s) encontrado(s)</span>
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => onSearchChange('')} iconName="X" iconPosition="left">
              Limpar busca
            </Button>
          )}
        </div>
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 p-4">
                <Checkbox
                  checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                />
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('nome')}
                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Nome</span>
                  <Icon name={getSortIcon('nome')} size={16} />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('planoAtivo')}
                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Plano Ativo</span>
                  <Icon name={getSortIcon('planoAtivo')} size={16} />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('statusPagamento')}
                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Status Pagamento</span>
                  <Icon name={getSortIcon('statusPagamento')} size={16} />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('ultimoTreino')}
                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Último Treino</span>
                  <Icon name={getSortIcon('ultimoTreino')} size={16} />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('proximaAvaliacao')}
                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Próxima Avaliação</span>
                  <Icon name={getSortIcon('proximaAvaliacao')} size={16} />
                </button>
              </th>
              <th className="text-center p-4 w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client?.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <Checkbox
                    checked={selectedClients.includes(client?.id)}
                    onChange={(e) => handleSelectClient(client?.id, e?.target?.checked)}
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                      {client?.avatar ? (
                        <img src={client?.avatar} alt={client?.avatarAlt} className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="User" size={20} color="white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{client?.nome}</p>
                      <p className="text-sm text-muted-foreground">{client?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <StatusBadge type="subscription" status={client?.planoAtivo} />
                </td>
                <td className="p-4">
                  <StatusBadge type="payment" status={client?.statusPagamento} />
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatDate(client?.ultimoTreino)}</p>
                    <p className="text-xs text-muted-foreground">{client?.progressoTreino}% concluído</p>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm font-medium text-foreground">{formatDate(client?.proximaAvaliacao)}</p>
                </td>
                <td className="p-4">
                  <ClientActionMenu client={client} onAction={onClientAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden">
        {filteredClients.map((client) => (
          <div key={client?.id} className="p-4 border-b border-border last:border-b-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedClients.includes(client?.id)}
                  onChange={(e) => handleSelectClient(client?.id, e?.target?.checked)}
                />
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                  {client?.avatar ? (
                    <img src={client?.avatar} alt={client?.avatarAlt} className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="User" size={24} color="white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{client?.nome}</p>
                  <p className="text-sm text-muted-foreground">{client?.email}</p>
                </div>
              </div>

              <ClientActionMenu client={client} onAction={onClientAction} variant="mobile" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Plano</p>
                <StatusBadge type="subscription" status={client?.planoAtivo} />
              </div>
              <div>
                <p className="text-muted-foreground">Pagamento</p>
                <StatusBadge type="payment" status={client?.statusPagamento} />
              </div>
              <div>
                <p className="text-muted-foreground">Último Treino</p>
                <p className="font-medium text-foreground">{formatDate(client?.ultimoTreino)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Próxima Avaliação</p>
                <p className="font-medium text-foreground">{formatDate(client?.proximaAvaliacao)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum cliente encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filters.subscription !== 'all' || filters.paymentStatus !== 'all' || filters.activityLevel !== 'all'
              ? 'Tente ajustar os filtros ou termo de busca'
              : 'Comece adicionando seu primeiro cliente'}
          </p>
          {(!searchTerm && filters.subscription === 'all' && filters.paymentStatus === 'all' && filters.activityLevel === 'all') && (
            <Button variant="default" onClick={() => onClientAction && onClientAction('add', null)} iconName="UserPlus" iconPosition="left">
              Adicionar Cliente
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientsTable;
