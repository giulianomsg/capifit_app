import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [preferences, setPreferences] = useState({
    email: true,
    sms: false,
    push: true,
    quietHours: { start: '22:00', end: '07:00' },
    categories: {
      workouts: true,
      payments: true,
      messages: true,
      system: false
    }
  });

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('capifit_isAuthenticated');
    if (!isAuthenticated || isAuthenticated !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  // Mock notifications data - In production, fetch from Supabase
  const mockNotifications = [
    {
      id: 1,
      category: 'workout',
      title: 'Treino Agendado - Maria Santos',
      message: 'Treino de Pernas agendado para hoje às 18:00',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      isRead: false,
      priority: 'high',
      actionUrl: '/workout-session-tracking/123',
      client: 'Maria Santos'
    },
    {
      id: 2,
      category: 'payment',
      title: 'Pagamento Recebido',
      message: 'Carlos Silva - Plano Mensal R$ 200,00',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      priority: 'medium',
      amount: 200.00
    },
    {
      id: 3,
      category: 'message',
      title: 'Nova Mensagem - Ana Costa',
      message: 'Pergunta sobre exercícios para dor nas costas',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      isRead: true,
      priority: 'medium',
      actionUrl: '/chat-communication-hub'
    },
    {
      id: 4,
      category: 'assessment',
      title: 'Avaliação Física Agendada',
      message: 'Pedro Oliveira - Amanhã às 14:00',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      isRead: true,
      priority: 'low',
      actionUrl: '/physical-assessment-system'
    },
    {
      id: 5,
      category: 'system',
      title: 'Sistema Atualizado',
      message: 'CapiFit v2.1 - Novas funcionalidades disponíveis',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      priority: 'low'
    },
    {
      id: 6,
      category: 'achievement',
      title: 'Meta Alcançada - Júlia Santos',
      message: '30 dias consecutivos de treino completados! 🏆',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isRead: false,
      priority: 'high',
      client: 'Júlia Santos'
    }
  ];

  // Filter notifications
  const filteredNotifications = mockNotifications?.filter(notification => {
    const matchesCategory = filterCategory === 'all' || notification?.category === filterCategory;
    const matchesSearch = notification?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         notification?.message?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Notification stats
  const unreadCount = mockNotifications?.filter(n => !n?.isRead)?.length;
  const todayCount = mockNotifications?.filter(n => 
    new Date(n.timestamp)?.toDateString() === new Date()?.toDateString()
  )?.length;

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      workout: 'Dumbbell',
      payment: 'CreditCard',
      message: 'MessageSquare',
      system: 'Settings',
      assessment: 'Activity',
      achievement: 'Trophy'
    };
    return icons?.[category] || 'Bell';
  };

  const getCategoryColor = (category) => {
    const colors = {
      workout: 'text-primary',
      payment: 'text-success',
      message: 'text-accent',
      system: 'text-muted-foreground',
      assessment: 'text-secondary',
      achievement: 'text-yellow-500'
    };
    return colors?.[category] || 'text-muted-foreground';
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification?.isRead) {
      // In production: update in Supabase
      console.log('Marking notification as read:', notification?.id);
    }

    // Navigate to related page
    if (notification?.actionUrl) {
      navigate(notification?.actionUrl);
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk ${action} for notifications:`, selectedNotifications);
    // In production: perform bulk operations in Supabase
    setSelectedNotifications([]);
  };

  const handlePreferenceUpdate = (category, value) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev?.categories,
        [category]: value
      }
    }));
    // In production: save to Supabase
  };

  const tabs = [
    { id: 'feed', label: 'Feed de Notificações', icon: 'Bell' },
    { id: 'preferences', label: 'Preferências', icon: 'Settings' },
    { id: 'templates', label: 'Templates', icon: 'FileText' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' }
  ];

  const categories = [
    { value: 'all', label: 'Todas Categorias' },
    { value: 'workout', label: 'Treinos' },
    { value: 'payment', label: 'Pagamentos' },
    { value: 'message', label: 'Mensagens' },
    { value: 'assessment', label: 'Avaliações' },
    { value: 'achievement', label: 'Conquistas' },
    { value: 'system', label: 'Sistema' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Bell" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Centro de Notificações
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gerencie todas as comunicações da plataforma CapiFit
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {unreadCount} não lidas
              </div>
              <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {todayCount} hoje
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard-principal')}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs Navigation */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar notificações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  iconName="Search"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e?.target?.value)}
                  options={categories}
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications?.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedNotifications?.length} notificações selecionadas
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('read')}
                  >
                    Marcar como Lidas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications Feed */}
            <div className="space-y-4">
              {filteredNotifications?.map((notification) => (
                <div
                  key={notification?.id}
                  className={`bg-card border border-border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                    !notification?.isRead ? 'border-l-4 border-l-primary bg-primary/2' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      checked={selectedNotifications?.includes(notification?.id)}
                      onChange={(e) => {
                        e?.stopPropagation();
                        if (e?.target?.checked) {
                          setSelectedNotifications([...selectedNotifications, notification?.id]);
                        } else {
                          setSelectedNotifications(selectedNotifications?.filter(id => id !== notification?.id));
                        }
                      }}
                      onClick={(e) => e?.stopPropagation()}
                    />
                    
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notification?.priority === 'high' ? 'bg-destructive/10' :
                      notification?.priority === 'medium' ? 'bg-accent/10' : 'bg-muted'
                    }`}>
                      <Icon 
                        name={getCategoryIcon(notification?.category)} 
                        size={20} 
                        className={getCategoryColor(notification?.category)}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${
                          !notification?.isRead ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification?.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {notification?.priority === 'high' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                              Urgente
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification?.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification?.message}
                      </p>

                      {notification?.amount && (
                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                          + R$ {notification?.amount?.toFixed(2)}
                        </div>
                      )}

                      {notification?.client && (
                        <div className="mt-2 flex items-center space-x-2">
                          <Icon name="User" size={14} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {notification?.client}
                          </span>
                        </div>
                      )}
                    </div>

                    {notification?.actionUrl && (
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}

              {filteredNotifications?.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhuma notificação encontrada
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery || filterCategory !== 'all' ?'Tente ajustar os filtros de busca' :'Você está em dia com todas as notificações!'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="max-w-2xl space-y-8">
            {/* Delivery Methods */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Métodos de Entrega
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <p className="text-xs text-muted-foreground">Receber notificações por email</p>
                  </div>
                  <Checkbox
                    checked={preferences?.email}
                    onChange={(e) => setPreferences(prev => ({ ...prev, email: e?.target?.checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">SMS</label>
                    <p className="text-xs text-muted-foreground">Receber notificações por SMS</p>
                  </div>
                  <Checkbox
                    checked={preferences?.sms}
                    onChange={(e) => setPreferences(prev => ({ ...prev, sms: e?.target?.checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Push Notifications</label>
                    <p className="text-xs text-muted-foreground">Notificações no navegador</p>
                  </div>
                  <Checkbox
                    checked={preferences?.push}
                    onChange={(e) => setPreferences(prev => ({ ...prev, push: e?.target?.checked }))}
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Categorias de Notificação
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Treinos</label>
                    <p className="text-xs text-muted-foreground">Lembretes e agendamentos</p>
                  </div>
                  <Checkbox
                    checked={preferences?.categories?.workouts}
                    onChange={(e) => handlePreferenceUpdate('workouts', e?.target?.checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Pagamentos</label>
                    <p className="text-xs text-muted-foreground">Confirmações e cobranças</p>
                  </div>
                  <Checkbox
                    checked={preferences?.categories?.payments}
                    onChange={(e) => handlePreferenceUpdate('payments', e?.target?.checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Mensagens</label>
                    <p className="text-xs text-muted-foreground">Comunicação com clientes</p>
                  </div>
                  <Checkbox
                    checked={preferences?.categories?.messages}
                    onChange={(e) => handlePreferenceUpdate('messages', e?.target?.checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Sistema</label>
                    <p className="text-xs text-muted-foreground">Atualizações e manutenção</p>
                  </div>
                  <Checkbox
                    checked={preferences?.categories?.system}
                    onChange={(e) => handlePreferenceUpdate('system', e?.target?.checked)}
                  />
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Horário Silencioso
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Início
                  </label>
                  <Input
                    type="time"
                    value={preferences?.quietHours?.start}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      quietHours: { ...prev?.quietHours, start: e?.target?.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fim
                  </label>
                  <Input
                    type="time"
                    value={preferences?.quietHours?.end}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      quietHours: { ...prev?.quietHours, end: e?.target?.value }
                    }))}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Durante este período, apenas notificações urgentes serão enviadas
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => console.log('Saving preferences...', preferences)}>
                Salvar Preferências
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Templates de Mensagem
              </h3>
              <p className="text-muted-foreground mb-6">
                Personalize os templates de notificação automática do sistema
              </p>
              
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Lembrete de Treino</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enviado 1 hora antes do treino agendado
                  </p>
                  <textarea
                    className="w-full p-3 border border-border rounded-md text-sm"
                    rows={3}
                    defaultValue="Olá {{client_name}}! Seu treino de {{workout_type}} está agendado para {{time}}. Não se esqueça de trazer sua garrafa d'água! 💪"
                  />
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Parabéns por Meta Alcançada</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enviado quando cliente atinge objetivo
                  </p>
                  <textarea
                    className="w-full p-3 border border-border rounded-md text-sm"
                    rows={3}
                    defaultValue="🎉 Parabéns {{client_name}}! Você alcançou sua meta de {{goal_description}}. Continue assim, estou muito orgulhoso do seu progresso!"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Abertura</p>
                    <p className="text-2xl font-bold text-foreground">87.3%</p>
                  </div>
                  <Icon name="Mail" size={24} className="text-primary" />
                </div>
                <p className="text-xs text-success mt-2">+5.2% vs mês anterior</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Clique</p>
                    <p className="text-2xl font-bold text-foreground">23.8%</p>
                  </div>
                  <Icon name="MousePointer" size={24} className="text-accent" />
                </div>
                <p className="text-xs text-success mt-2">+2.1% vs mês anterior</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Enviadas Hoje</p>
                    <p className="text-2xl font-bold text-foreground">142</p>
                  </div>
                  <Icon name="Send" size={24} className="text-secondary" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">34 por usuário</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Falhas</p>
                    <p className="text-2xl font-bold text-foreground">3</p>
                  </div>
                  <Icon name="AlertTriangle" size={24} className="text-destructive" />
                </div>
                <p className="text-xs text-destructive mt-2">2.1% taxa de erro</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Engajamento por Categoria
              </h3>
              <div className="space-y-4">
                {[
                  { category: 'Treinos', sent: 45, opened: 42, clicked: 18 },
                  { category: 'Pagamentos', sent: 23, opened: 21, clicked: 8 },
                  { category: 'Mensagens', sent: 67, opened: 58, clicked: 23 },
                  { category: 'Avaliações', sent: 12, opened: 10, clicked: 4 }
                ]?.map((item) => (
                  <div key={item?.category} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item?.category}</span>
                    <div className="flex space-x-4 text-sm text-muted-foreground">
                      <span>{item?.sent} enviadas</span>
                      <span>{Math.round((item?.opened / item?.sent) * 100)}% abertas</span>
                      <span>{Math.round((item?.clicked / item?.sent) * 100)}% clicadas</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;