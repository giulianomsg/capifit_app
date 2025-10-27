import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import StatusBadge from './StatusBadge';
import ClientActionMenu from './ClientActionMenu';

const ClientsTable = ({ 
  clients = [], 
  onClientSelect = null,
  onBulkAction = null,
  onClientAction = null 
}) => {
  const [selectedClients, setSelectedClients] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subscription: 'all',
    paymentStatus: 'all',
    activityLevel: 'all'
  });

  // Filter and search logic
  const filteredClients = useMemo(() => {
    let filtered = clients?.filter(client => {
      const matchesSearch = client?.nome?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           client?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      
      const matchesSubscription = filters?.subscription === 'all' || 
                                 client?.planoAtivo === filters?.subscription;
      
      const matchesPayment = filters?.paymentStatus === 'all' || 
                            client?.statusPagamento === filters?.paymentStatus;
      
      const matchesActivity = filters?.activityLevel === 'all' || 
                             client?.nivelAtividade === filters?.activityLevel;
      
      return matchesSearch && matchesSubscription && matchesPayment && matchesActivity;
    });

    // Apply sorting
    if (sortConfig?.key) {
      filtered?.sort((a, b) => {
        let aValue = a?.[sortConfig?.key];
        let bValue = b?.[sortConfig?.key];
        
        if (sortConfig?.key === 'ultimoTreino' || sortConfig?.key === 'proximaAvaliacao') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [clients, searchTerm, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedClients(filteredClients?.map(client => client?.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelectClient = (clientId, checked) => {
    if (checked) {
      setSelectedClients(prev => [...prev, clientId]);
    } else {
      setSelectedClients(prev => prev?.filter(id => id !== clientId));
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
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('pt-BR');
  };

  const subscriptionOptions = [
    { value: 'all', label: 'Todos os Planos' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'anual', label: 'Anual' }
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'em-dia', label: 'Em Dia' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'atrasado', label: 'Atrasado' }
  ];

  const activityLevelOptions = [
    { value: 'all', label: 'Todos os Níveis' },
    { value: 'alto', label: 'Alto' },
    { value: 'medio', label: 'Médio' },
    { value: 'baixo', label: 'Baixo' },
    { value: 'inativo', label: 'Inativo' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Search and Filters */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              options={subscriptionOptions}
              value={filters?.subscription}
              onChange={(value) => setFilters(prev => ({ ...prev, subscription: value }))}
              placeholder="Filtrar por plano"
              className="w-full sm:w-48"
            />
            
            <Select
              options={paymentStatusOptions}
              value={filters?.paymentStatus}
              onChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}
              placeholder="Status pagamento"
              className="w-full sm:w-48"
            />
            
            <Select
              options={activityLevelOptions}
              value={filters?.activityLevel}
              onChange={(value) => setFilters(prev => ({ ...prev, activityLevel: value }))}
              placeholder="Nível atividade"
              className="w-full sm:w-48"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedClients?.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium text-foreground">
              {selectedClients?.length} cliente(s) selecionado(s)
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
          <span>{filteredClients?.length} cliente(s) encontrado(s)</span>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              iconName="X"
              iconPosition="left"
            >
              Limpar busca
            </Button>
          )}
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 p-4">
                <Checkbox
                  checked={selectedClients?.length === filteredClients?.length && filteredClients?.length > 0}
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
            {filteredClients?.map((client) => (
              <tr key={client?.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <Checkbox
                    checked={selectedClients?.includes(client?.id)}
                    onChange={(e) => handleSelectClient(client?.id, e?.target?.checked)}
                  />
                </td>
                
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                      {client?.avatar ? (
                        <img 
                          src={client?.avatar} 
                          alt={client?.avatarAlt}
                          className="w-full h-full object-cover"
                        />
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
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(client?.ultimoTreino)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client?.progressoTreino}% concluído
                    </p>
                  </div>
                </td>
                
                <td className="p-4">
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(client?.proximaAvaliacao)}
                  </p>
                </td>
                
                <td className="p-4">
                  <ClientActionMenu
                    client={client}
                    onAction={onClientAction}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden">
        {filteredClients?.map((client) => (
          <div key={client?.id} className="p-4 border-b border-border last:border-b-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedClients?.includes(client?.id)}
                  onChange={(e) => handleSelectClient(client?.id, e?.target?.checked)}
                />
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                  {client?.avatar ? (
                    <img 
                      src={client?.avatar} 
                      alt={client?.avatarAlt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="User" size={24} color="white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{client?.nome}</p>
                  <p className="text-sm text-muted-foreground">{client?.email}</p>
                </div>
              </div>
              
              <ClientActionMenu
                client={client}
                onAction={onClientAction}
                variant="mobile"
              />
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
      {/* Empty State */}
      {filteredClients?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum cliente encontrado
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filters?.subscription !== 'all' || filters?.paymentStatus !== 'all' || filters?.activityLevel !== 'all' ?'Tente ajustar os filtros ou termo de busca' :'Comece adicionando seu primeiro cliente'
            }
          </p>
          {(!searchTerm && filters?.subscription === 'all' && filters?.paymentStatus === 'all' && filters?.activityLevel === 'all') && (
            <Button
              variant="default"
              onClick={() => onClientAction && onClientAction('add', null)}
              iconName="UserPlus"
              iconPosition="left"
            >
              Adicionar Cliente
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientsTable;