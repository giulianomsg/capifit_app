import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ClientsTable from './components/ClientsTable';
import ClientMetricsPanel from './components/ClientMetricsPanel';
import AddClientModal from './components/AddClientModal';
import {
  createClient,
  deleteClient,
  listClients,
  updateClient,
} from '../../services/clientService';

const subscriptionMap = {
  MONTHLY: 'mensal',
  QUARTERLY: 'trimestral',
  ANNUAL: 'anual',
  CUSTOM: 'personalizado',
};

const paymentMap = {
  ON_TIME: 'em-dia',
  PENDING: 'pendente',
  LATE: 'atrasado',
};

const activityMap = {
  HIGH: 'alto',
  MEDIUM: 'medio',
  LOW: 'baixo',
  INACTIVE: 'inativo',
};

const inverseSubscriptionMap = {
  mensal: 'MONTHLY',
  trimestral: 'QUARTERLY',
  anual: 'ANNUAL',
};

const inversePaymentMap = {
  'em-dia': 'ON_TIME',
  pendente: 'PENDING',
  atrasado: 'LATE',
};

const experienceToActivityMap = {
  iniciante: 'LOW',
  intermediario: 'MEDIUM',
  avancado: 'HIGH',
};

const activityToApiMap = {
  alto: 'HIGH',
  medio: 'MEDIUM',
  baixo: 'LOW',
  inativo: 'INACTIVE',
};

const transformClient = (assignment) => {
  const profile = assignment?.client?.clientProfile ?? {};

  return {
    id: assignment?.id,
    assignmentId: assignment?.id,
    userId: assignment?.clientId,
    nome: assignment?.client?.name ?? 'Cliente',
    email: assignment?.client?.email ?? '',
    avatar: assignment?.client?.avatarUrl ?? '',
    avatarAlt: assignment?.client?.name ? `Foto de ${assignment.client.name}` : 'Avatar do cliente',
    planoAtivo: subscriptionMap[profile?.subscriptionPlan] ?? 'personalizado',
    statusPagamento: paymentMap[profile?.paymentStatus] ?? 'pendente',
    ultimoTreino: profile?.lastWorkoutAt ?? assignment?.updatedAt,
    proximaAvaliacao: profile?.nextAssessmentAt ?? null,
    progressoTreino: profile?.progressPercentage ?? 0,
    nivelAtividade: activityMap[profile?.activityLevel] ?? 'medio',
    telefone: assignment?.client?.phone ?? '',
    dataInscricao: assignment?.startedAt,
    statusRelacionamento: assignment?.status ?? 'ACTIVE',
    raw: assignment,
  };
};

const transformMetrics = (metrics) => {
  if (!metrics) return null;

  return {
    totalClients: metrics.totalClients,
    activeClients: metrics.activeClients,
    pausedClients: metrics.pausedClients,
    endedClients: metrics.endedClients,
    newThisMonth: metrics.newThisMonth,
    averageProgress: metrics.averageProgress,
    subscriptionDistribution: [
      { name: 'Mensal', value: metrics.subscriptionDistribution.MONTHLY, color: 'var(--color-primary)' },
      { name: 'Trimestral', value: metrics.subscriptionDistribution.QUARTERLY, color: 'var(--color-secondary)' },
      { name: 'Anual', value: metrics.subscriptionDistribution.ANNUAL, color: 'var(--color-accent)' },
      { name: 'Personalizado', value: metrics.subscriptionDistribution.CUSTOM, color: 'var(--color-warning)' },
    ],
    paymentStatus: {
      emDia: metrics.paymentStatus.ON_TIME,
      pendente: metrics.paymentStatus.PENDING,
      atrasado: metrics.paymentStatus.LATE,
    },
    activityLevels: {
      alto: metrics.activityLevels.HIGH,
      medio: metrics.activityLevels.MEDIUM,
      baixo: metrics.activityLevels.LOW,
      inativo: metrics.activityLevels.INACTIVE,
    },
  };
};

const GerenciarAlunos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subscription: 'all',
    paymentStatus: 'all',
    activityLevel: 'all',
  });
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    document.title = 'Gerenciar Alunos - CapiFit';
  }, []);

  const subscriptionFilter = filters.subscription !== 'all' ? inverseSubscriptionMap[filters.subscription] : undefined;
  const paymentFilter = filters.paymentStatus !== 'all' ? inversePaymentMap[filters.paymentStatus] : undefined;
  const activityFilter = filters.activityLevel !== 'all' ? activityToApiMap[filters.activityLevel] : undefined;

  const clientsQuery = useQuery({
    queryKey: ['clients', searchTerm, filters],
    queryFn: () =>
      listClients({
        search: searchTerm || undefined,
        subscription: subscriptionFilter ? [subscriptionFilter] : undefined,
        paymentStatus: paymentFilter ? [paymentFilter] : undefined,
        activityLevel: activityFilter ? [activityFilter] : undefined,
      }),
    staleTime: 60_000,
  });

  const createClientMutation = useMutation({
    mutationFn: (payload) => createClient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setFeedback({ type: 'success', message: 'Cliente adicionado com sucesso.' });
      setShowAddModal(false);
    },
    onError: (error) => {
      const message = error?.response?.data?.message ?? 'Não foi possível adicionar o cliente.';
      setFeedback({ type: 'error', message });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ assignmentId, payload }) => updateClient(assignmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setFeedback({ type: 'success', message: 'Dados do cliente atualizados.' });
    },
    onError: (error) => {
      const message = error?.response?.data?.message ?? 'Não foi possível atualizar o cliente.';
      setFeedback({ type: 'error', message });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (assignmentId) => deleteClient(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setFeedback({ type: 'success', message: 'Cliente removido da carteira.' });
    },
    onError: (error) => {
      const message = error?.response?.data?.message ?? 'Não foi possível remover o cliente.';
      setFeedback({ type: 'error', message });
    },
  });

  const transformedClients = useMemo(() => {
    return clientsQuery.data?.data?.map(transformClient) ?? [];
  }, [clientsQuery.data]);

  const metrics = useMemo(() => transformMetrics(clientsQuery.data?.metrics), [clientsQuery.data?.metrics]);

  const handleClientAction = async (action, client) => {
    switch (action) {
      case 'add':
        setShowAddModal(true);
        break;
      case 'view':
        navigate('/perfil-do-personal', { state: { clientId: client?.userId } });
        break;
      case 'message':
        navigate('/chat-communication-hub', { state: { clientId: client?.userId } });
        break;
      case 'progress':
        navigate('/workout-session-tracking', { state: { clientId: client?.userId } });
        break;
      case 'workout':
        navigate('/criar-treinos', { state: { clientId: client?.userId } });
        break;
      case 'suspend':
        if (client?.assignmentId) {
          updateClientMutation.mutate({ assignmentId: client.assignmentId, payload: { status: 'PAUSED' } });
        }
        break;
      case 'delete':
        if (client?.assignmentId) {
          deleteClientMutation.mutate(client.assignmentId);
        }
        break;
      default:
        break;
    }
  };

  const handleBulkAction = (action, selectedClientIds) => {
    const selectedClients = transformedClients.filter((client) => selectedClientIds.includes(client?.id));

    switch (action) {
      case 'message':
        navigate('/chat-communication-hub', { state: { bulkClients: selectedClients.map((client) => client.userId) } });
        break;
      case 'export':
        setFeedback({ type: 'info', message: 'Exportação em desenvolvimento.' });
        break;
      case 'updatePlan':
        setFeedback({ type: 'info', message: 'Atualização em massa indisponível no momento.' });
        break;
      default:
        break;
    }
  };

  const handleAddClient = async (clientData) => {
    const payload = {
      name: clientData?.nome,
      email: clientData?.email,
      phone: clientData?.telefone,
      subscriptionPlan: inverseSubscriptionMap[clientData?.planoAssinatura] ?? 'CUSTOM',
      paymentStatus: inversePaymentMap[clientData?.statusPagamento ?? 'em-dia'] ?? 'ON_TIME',
      activityLevel: experienceToActivityMap[clientData?.nivelExperiencia] ?? 'MEDIUM',
      goals: clientData?.objetivos ?? [],
      experienceLevel: clientData?.nivelExperiencia,
      gender: clientData?.genero || undefined,
      notes: clientData?.observacoes || undefined,
      medicalConditions: clientData?.condicoesMedicas || undefined,
      dateOfBirth: clientData?.dataNascimento || undefined,
      sendInvitation: clientData?.enviarConvite,
    };

    await createClientMutation.mutateAsync(payload);
  };

  const handleRefresh = () => {
    clientsQuery.refetch();
  };

  const isLoading = clientsQuery.isLoading || clientsQuery.isFetching;
  const isError = clientsQuery.isError;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciar Alunos</h1>
            <p className="text-muted-foreground">Gerencie seus clientes, assinaturas e acompanhe o progresso</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                iconName="Table"
                iconPosition="left"
                className="rounded-md"
              >
                Tabela
              </Button>
              <Button
                variant={viewMode === 'metrics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('metrics')}
                iconName="BarChart3"
                iconPosition="left"
                className="rounded-md"
              >
                Métricas
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} iconName="RefreshCw" iconPosition="left">
                Atualizar
              </Button>
              <Button
                variant="default"
                onClick={() => setShowAddModal(true)}
                iconName="UserPlus"
                iconPosition="left"
              >
                Adicionar Cliente
              </Button>
            </div>
          </div>
        </div>

        {feedback && (
          <div
            className={`mb-6 rounded-lg border p-4 ${
              feedback.type === 'error'
                ? 'border-destructive/40 bg-destructive/10 text-destructive'
                : feedback.type === 'success'
                ? 'border-success/40 bg-success/10 text-success'
                : 'border-muted text-muted-foreground'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Icon name="Loader2" size={32} className="animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-destructive">
            Ocorreu um erro ao carregar os dados dos clientes.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-8">
            {viewMode === 'metrics' ? (
              <ClientMetricsPanel metrics={metrics} />
            ) : (
              <ClientsTable
                clients={transformedClients}
                onClientAction={handleClientAction}
                onBulkAction={handleBulkAction}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onFiltersChange={setFilters}
              />
            )}
          </div>
        )}

        {!isLoading && !isError && viewMode === 'table' && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon name="Users" size={24} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{transformedClients.length}</h3>
              <p className="text-sm text-muted-foreground">Total de Clientes (página)</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon name="CheckCircle" size={24} className="text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {transformedClients.filter((c) => c?.statusPagamento === 'em-dia').length}
              </h3>
              <p className="text-sm text-muted-foreground">Pagamentos em Dia</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon name="TrendingUp" size={24} className="text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {transformedClients.filter((c) => c?.nivelAtividade === 'alto').length}
              </h3>
              <p className="text-sm text-muted-foreground">Alta Atividade</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon name="AlertTriangle" size={24} className="text-warning" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {transformedClients.filter((c) => ['pendente', 'atrasado'].includes(c?.statusPagamento)).length}
              </h3>
              <p className="text-sm text-muted-foreground">Requer Atenção</p>
            </div>
          </div>
        )}
      </div>

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddClient}
        isSubmitting={createClientMutation.isPending}
      />
    </div>
  );
};

export default GerenciarAlunos;
