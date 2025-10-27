import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ClientsTable from './components/ClientsTable';
import ClientMetricsPanel from './components/ClientMetricsPanel';
import AddClientModal from './components/AddClientModal';

const GerenciarAlunos = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'metrics'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Mock clients data
  const [clients] = useState([
  {
    id: 1,
    nome: "Maria Santos Silva",
    email: "maria.santos@email.com",
    avatar: "https://images.unsplash.com/photo-1665023024202-4c8671802bf6",
    avatarAlt: "Professional headshot of woman with shoulder-length brown hair wearing white blouse",
    planoAtivo: "mensal",
    statusPagamento: "em-dia",
    ultimoTreino: "2025-10-26",
    proximaAvaliacao: "2025-11-02",
    progressoTreino: 85,
    nivelAtividade: "alto",
    telefone: "(11) 99999-1234",
    dataInscricao: "2025-08-15"
  },
  {
    id: 2,
    nome: "Carlos Eduardo Oliveira",
    email: "carlos.oliveira@email.com",
    avatar: "https://images.unsplash.com/photo-1534734104609-f283d18e2478",
    avatarAlt: "Professional headshot of man with short dark hair wearing navy blue shirt",
    planoAtivo: "trimestral",
    statusPagamento: "em-dia",
    ultimoTreino: "2025-10-25",
    proximaAvaliacao: "2025-11-05",
    progressoTreino: 92,
    nivelAtividade: "alto",
    telefone: "(11) 98888-5678",
    dataInscricao: "2025-07-20"
  },
  {
    id: 3,
    nome: "Ana Paula Costa",
    email: "ana.costa@email.com",
    avatar: "https://images.unsplash.com/photo-1651818428737-0bb5f3adc6e9",
    avatarAlt: "Professional headshot of woman with long blonde hair wearing light blue top",
    planoAtivo: "anual",
    statusPagamento: "pendente",
    ultimoTreino: "2025-10-24",
    proximaAvaliacao: "2025-11-08",
    progressoTreino: 67,
    nivelAtividade: "medio",
    telefone: "(11) 97777-9012",
    dataInscricao: "2025-06-10"
  },
  {
    id: 4,
    nome: "Pedro Henrique Lima",
    email: "pedro.lima@email.com",
    avatar: "https://images.unsplash.com/photo-1492140377033-831754a4702f",
    avatarAlt: "Professional headshot of young man with curly hair wearing gray sweater",
    planoAtivo: "mensal",
    statusPagamento: "atrasado",
    ultimoTreino: "2025-10-20",
    proximaAvaliacao: "2025-11-12",
    progressoTreino: 45,
    nivelAtividade: "baixo",
    telefone: "(11) 96666-3456",
    dataInscricao: "2025-09-05"
  },
  {
    id: 5,
    nome: "Juliana Ferreira",
    email: "juliana.ferreira@email.com",
    avatar: "https://images.unsplash.com/photo-1727784892015-4f4b8d67a083",
    avatarAlt: "Professional headshot of woman with short dark hair wearing black blazer",
    planoAtivo: "trimestral",
    statusPagamento: "em-dia",
    ultimoTreino: "2025-10-26",
    proximaAvaliacao: "2025-10-30",
    progressoTreino: 78,
    nivelAtividade: "medio",
    telefone: "(11) 95555-7890",
    dataInscricao: "2025-05-18"
  },
  {
    id: 6,
    nome: "Roberto Silva Junior",
    email: "roberto.junior@email.com",
    avatar: "https://images.unsplash.com/photo-1587776535733-b4c80a99ef82",
    avatarAlt: "Professional headshot of man with beard wearing white dress shirt",
    planoAtivo: "mensal",
    statusPagamento: "em-dia",
    ultimoTreino: "2025-10-23",
    proximaAvaliacao: "2025-11-15",
    progressoTreino: 56,
    nivelAtividade: "medio",
    telefone: "(11) 94444-2468",
    dataInscricao: "2025-08-30"
  },
  {
    id: 7,
    nome: "Fernanda Rodrigues",
    email: "fernanda.rodrigues@email.com",
    avatar: "https://images.unsplash.com/photo-1605980625744-8d816a169f60",
    avatarAlt: "Professional headshot of woman with wavy brown hair wearing red top",
    planoAtivo: "anual",
    statusPagamento: "em-dia",
    ultimoTreino: "2025-10-26",
    proximaAvaliacao: "2025-11-01",
    progressoTreino: 89,
    nivelAtividade: "alto",
    telefone: "(11) 93333-1357",
    dataInscricao: "2025-04-12"
  },
  {
    id: 8,
    nome: "Lucas Martins",
    email: "lucas.martins@email.com",
    avatar: "https://images.unsplash.com/photo-1632866892073-0b6bfafb2947",
    avatarAlt: "Professional headshot of young man with short brown hair wearing casual shirt",
    planoAtivo: "mensal",
    statusPagamento: "pendente",
    ultimoTreino: "2025-10-18",
    proximaAvaliacao: "2025-11-20",
    progressoTreino: 34,
    nivelAtividade: "inativo",
    telefone: "(11) 92222-9876",
    dataInscricao: "2025-09-22"
  }]
  );

  useEffect(() => {
    document.title = "Gerenciar Alunos - CapiFit";
  }, []);

  const handleClientAction = (action, client) => {
    switch (action) {
      case 'add':
        setShowAddModal(true);
        break;
      case 'view':console.log('Ver perfil do cliente:', client);
        // Navigate to client profile
        break;
      case 'message':console.log('Enviar mensagem para:', client);
        navigate('/mensagens', { state: { clientId: client?.id } });
        break;
      case 'progress':console.log('Ver progresso do cliente:', client);
        // Navigate to progress page
        break;
      case 'workout':console.log('Criar treino para:', client);
        navigate('/criar-treinos', { state: { clientId: client?.id } });
        break;
      case 'assessment':console.log('Agendar avaliação para:', client);
        // Navigate to assessment scheduling
        break;
      case 'edit':console.log('Editar cliente:', client);
        // Open edit modal
        break;
      case 'suspend':console.log('Suspender cliente:', client);
        // Handle suspension
        break;
      case 'delete':
        console.log('Remover cliente:', client);
        // Handle deletion with confirmation
        break;
      default:
        console.log('Ação não reconhecida:', action);
    }
  };

  const handleBulkAction = (action, selectedClientIds) => {
    const selectedClients = clients?.filter((client) => selectedClientIds?.includes(client?.id));

    switch (action) {
      case 'message':console.log('Enviar mensagem em massa para:', selectedClients);
        navigate('/mensagens', { state: { bulkClients: selectedClientIds } });
        break;
      case 'export':
        console.log('Exportar dados dos clientes:', selectedClients);
        // Handle export functionality
        break;
      case 'updatePlan':console.log('Atualizar planos dos clientes:', selectedClients);
        // Handle bulk plan update
        break;
      default:
        console.log('Ação em massa não reconhecida:', action);
    }
  };

  const handleAddClient = async (clientData) => {
    console.log('Adicionando novo cliente:', clientData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Trigger refresh
    setRefreshTrigger((prev) => prev + 1);

    console.log('Cliente adicionado com sucesso!');
  };

  const handleExportData = () => {
    console.log('Exportando dados dos clientes...');
    // Handle export functionality
  };

  const handleImportData = () => {
    console.log('Importando dados dos clientes...');
    // Handle import functionality
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gerenciar Alunos
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus clientes, assinaturas e acompanhe o progresso
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* View Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                iconName="Table"
                iconPosition="left"
                className="rounded-md">

                Tabela
              </Button>
              <Button
                variant={viewMode === 'metrics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('metrics')}
                iconName="BarChart3"
                iconPosition="left"
                className="rounded-md">

                Métricas
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleImportData}
                iconName="Upload"
                iconPosition="left">

                Importar
              </Button>
              
              <Button
                variant="outline"
                onClick={handleExportData}
                iconName="Download"
                iconPosition="left">

                Exportar
              </Button>
              
              <Button
                variant="default"
                onClick={() => setShowAddModal(true)}
                iconName="UserPlus"
                iconPosition="left">

                Adicionar Cliente
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {viewMode === 'metrics' ?
          <ClientMetricsPanel /> :

          <ClientsTable
            clients={clients}
            onClientAction={handleClientAction}
            onBulkAction={handleBulkAction} />

          }
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="Users" size={24} className="text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{clients?.length}</h3>
            <p className="text-sm text-muted-foreground">Total de Clientes</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="CheckCircle" size={24} className="text-success" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {clients?.filter((c) => c?.statusPagamento === 'em-dia')?.length}
            </h3>
            <p className="text-sm text-muted-foreground">Pagamentos em Dia</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="TrendingUp" size={24} className="text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {clients?.filter((c) => c?.nivelAtividade === 'alto')?.length}
            </h3>
            <p className="text-sm text-muted-foreground">Alta Atividade</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="AlertTriangle" size={24} className="text-warning" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {clients?.filter((c) => c?.statusPagamento === 'pendente' || c?.statusPagamento === 'atrasado')?.length}
            </h3>
            <p className="text-sm text-muted-foreground">Requer Atenção</p>
          </div>
        </div>
      </div>
      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddClient} />

    </div>);

};

export default GerenciarAlunos;