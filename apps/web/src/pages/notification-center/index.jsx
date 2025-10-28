import React, { useMemo, useState } from 'react';

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';

const NotificationCenter = () => {
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
      system: false,
    },
  });

  const mockNotifications = [
    {
      id: 1,
      category: 'workout',
      title: 'Treino Agendado - Maria Santos',
      message: 'Treino de Pernas agendado para hoje às 18:00',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      priority: 'high',
      actionUrl: '/workout-session-tracking/123',
      client: 'Maria Santos',
    },
    {
      id: 2,
      category: 'payment',
      title: 'Pagamento Recebido',
      message: 'Carlos Silva - Plano Mensal R$ 200,00',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      priority: 'medium',
      amount: 200.0,
    },
    {
      id: 3,
      category: 'message',
      title: 'Nova Mensagem - Ana Costa',
      message: 'Pergunta sobre exercícios para dor nas costas',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      priority: 'medium',
      actionUrl: '/chat-communication-hub',
    },
    {
      id: 4,
      category: 'assessment',
      title: 'Avaliação Física Agendada',
      message: 'Pedro Oliveira - Amanhã às 14:00',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isRead: true,
      priority: 'low',
      actionUrl: '/physical-assessment-system',
    },
    {
      id: 5,
      category: 'system',
      title: 'Atualização disponível',
      message: 'Nova versão do app com melhorias de desempenho',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
      priority: 'low',
    },
  ];

  const filteredNotifications = useMemo(() => {
    return mockNotifications.filter((notification) => {
      const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [filterCategory, mockNotifications, searchQuery]);

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId],
    );
  };

  const markSelectedAsRead = () => {
    // TODO: integrate with backend notifications API
    setSelectedNotifications([]);
  };

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateCategoryPreference = (category) => {
    setPreferences((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category],
      },
    }));
  };

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Central de Notificações</h1>
          <p className="text-muted-foreground">Gerencie alertas, mensagens e preferências de comunicação.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" iconName="Mail" onClick={() => updatePreference('email', !preferences.email)}>
            E-mail {preferences.email ? 'ativado' : 'desativado'}
          </Button>
          <Button variant="outline" iconName="Smartphone" onClick={() => updatePreference('sms', !preferences.sms)}>
            SMS {preferences.sms ? 'ativado' : 'desativado'}
          </Button>
          <Button iconName="Bell" onClick={() => updatePreference('push', !preferences.push)}>
            Push {preferences.push ? 'ativado' : 'desativado'}
          </Button>
        </div>
      </header>

      <section className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <Button variant={activeTab === 'feed' ? 'default' : 'outline'} onClick={() => setActiveTab('feed')}>
              Feed
            </Button>
            <Button variant={activeTab === 'preferences' ? 'default' : 'outline'} onClick={() => setActiveTab('preferences')}>
              Preferências
            </Button>
            <Button variant={activeTab === 'reports' ? 'default' : 'outline'} onClick={() => setActiveTab('reports')}>
              Relatórios
            </Button>
          </div>
          {activeTab === 'feed' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={filterCategory}
                onChange={(event) => setFilterCategory(event.target.value)}
                options={[
                  { label: 'Todas categorias', value: 'all' },
                  { label: 'Treinos', value: 'workout' },
                  { label: 'Pagamentos', value: 'payment' },
                  { label: 'Mensagens', value: 'message' },
                  { label: 'Avaliações', value: 'assessment' },
                  { label: 'Sistema', value: 'system' },
                ]}
              />
              <Input
                placeholder="Buscar notificações"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          )}
        </div>

        {activeTab === 'feed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="select-all"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onCheckedChange={(checked) =>
                    setSelectedNotifications(checked ? filteredNotifications.map((notification) => notification.id) : [])
                  }
                />
                <label htmlFor="select-all" className="text-sm text-muted-foreground">
                  Selecionar todos
                </label>
              </div>
              <Button
                variant="outline"
                iconName="Check"
                disabled={selectedNotifications.length === 0}
                onClick={markSelectedAsRead}
              >
                Marcar como lidas
              </Button>
            </div>

            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => toggleNotificationSelection(notification.id)}
                  className={`w-full text-left border rounded-xl p-4 transition-all duration-200 ${
                    selectedNotifications.includes(notification.id)
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon name="Bell" size={16} className="text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">{notification.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{notification.timestamp.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>Prioridade: {notification.priority}</span>
                        {notification.client && <span>Cliente: {notification.client}</span>}
                      </div>
                    </div>
                    {!notification.isRead && <span className="w-2 h-2 bg-primary rounded-full mt-2" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Canais de comunicação</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm text-foreground">
                  <Checkbox checked={preferences.email} onCheckedChange={(checked) => updatePreference('email', !!checked)} />
                  Notificações por e-mail
                </label>
                <label className="flex items-center gap-3 text-sm text-foreground">
                  <Checkbox checked={preferences.sms} onCheckedChange={(checked) => updatePreference('sms', !!checked)} />
                  Notificações por SMS
                </label>
                <label className="flex items-center gap-3 text-sm text-foreground">
                  <Checkbox checked={preferences.push} onCheckedChange={(checked) => updatePreference('push', !!checked)} />
                  Notificações push
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Categorias</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(preferences.categories).map(([category, value]) => (
                  <label key={category} className="flex items-center gap-3 text-sm text-foreground capitalize">
                    <Checkbox checked={value} onCheckedChange={() => updateCategoryPreference(category)} />
                    {category}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="p-6 border border-border rounded-xl bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground">Resumo semanal</h3>
              <p className="text-sm text-muted-foreground mt-2">
                42 notificações enviadas, 89% de taxa de leitura, 12 ações geradas.
              </p>
              <Button variant="outline" iconName="Download" className="mt-4">
                Exportar relatório completo
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationCenter;
