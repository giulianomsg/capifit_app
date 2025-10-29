import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import {
  deleteNotifications,
  fetchNotificationPreferences,
  fetchNotifications,
  markNotificationsAsRead,
  updateNotificationPreferences,
} from '../../services/notificationService';
import { useRealtime } from '../../contexts/RealtimeContext';

const CATEGORY_OPTIONS = [
  { label: 'Todas categorias', value: 'ALL' },
  { label: 'Treinos', value: 'WORKOUT' },
  { label: 'Mensagens', value: 'MESSAGE' },
  { label: 'Avaliações', value: 'ASSESSMENT' },
  { label: 'Nutrição', value: 'NUTRITION' },
  { label: 'Pagamentos', value: 'PAYMENT' },
  { label: 'Sistema', value: 'SYSTEM' },
];

const PRIORITY_VARIANTS = {
  LOW: 'bg-muted text-muted-foreground',
  NORMAL: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const categoryLabels = CATEGORY_OPTIONS.reduce((acc, option) => {
  if (option.value !== 'ALL') {
    acc[option.value] = option.label;
  }
  return acc;
}, {});

const pageSize = 20;

function formatDate(dateString) {
  if (!dateString) return '';
  return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm");
}

const NotificationCenter = () => {
  const queryClient = useQueryClient();
  const { socket } = useRealtime();

  const [activeTab, setActiveTab] = useState('feed');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filters, setFilters] = useState({ category: 'ALL', search: '', unreadOnly: false });
  const [page, setPage] = useState(1);
  const [preferencesDraft, setPreferencesDraft] = useState(null);

  const queryParams = useMemo(
    () => ({
      page,
      perPage: pageSize,
      category: filters.category === 'ALL' ? undefined : filters.category,
      unreadOnly: filters.unreadOnly,
      search: filters.search.trim() ? filters.search.trim() : undefined,
    }),
    [filters.category, filters.search, filters.unreadOnly, page],
  );

  const notificationsQuery = useQuery({
    queryKey: ['notifications', queryParams],
    queryFn: () => fetchNotifications(queryParams),
    keepPreviousData: true,
  });

  const preferencesQuery = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: fetchNotificationPreferences,
  });

  useEffect(() => {
    if (preferencesQuery.data) {
      setPreferencesDraft(preferencesQuery.data);
    }
  }, [preferencesQuery.data]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleIncomingNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification:new', handleIncomingNotification);
    return () => {
      socket.off('notification:new', handleIncomingNotification);
    };
  }, [queryClient, socket]);

  const markMutation = useMutation({
    mutationFn: (ids) => markNotificationsAsRead(ids),
    onSuccess: () => {
      setSelectedNotifications([]);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids) => deleteNotifications(ids),
    onSuccess: () => {
      setSelectedNotifications([]);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (data) => {
      setPreferencesDraft(data);
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
    },
  });

  const notifications = notificationsQuery.data?.data ?? [];
  const pagination = notificationsQuery.data?.meta ?? { page: 1, totalPages: 1, total: 0 };
  const isLoading = notificationsQuery.isLoading;

  const toggleSelection = (notificationId) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId],
    );
  };

  const isSelected = (id) => selectedNotifications.includes(id);

  const markAllAsRead = () => {
    if (!notifications.length) return;
    const unreadIds = notifications.filter((notification) => !notification.readAt).map((notification) => notification.id);
    if (unreadIds.length === 0) return;
    markMutation.mutate(unreadIds);
  };

  const markSelectedAsRead = () => {
    if (!selectedNotifications.length) return;
    markMutation.mutate(selectedNotifications);
  };

  const deleteSelected = () => {
    if (!selectedNotifications.length) return;
    deleteMutation.mutate(selectedNotifications);
  };

  const handleCategoryChange = (event) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, category: event.target.value }));
  };

  const handleSearchChange = (event) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, search: event.target.value }));
  };

  const handleToggleUnread = () => {
    setPage(1);
    setFilters((prev) => ({ ...prev, unreadOnly: !prev.unreadOnly }));
  };

  const togglePreferenceChannel = (key) => {
    setPreferencesDraft((prev) => ({
      ...prev,
      [key]: !prev?.[key],
    }));
  };

  const togglePreferenceCategory = (category) => {
    setPreferencesDraft((prev) => {
      const categories = prev?.categories ?? [];
      const includes = categories.includes(category);
      return {
        ...prev,
        categories: includes
          ? categories.filter((item) => item !== category)
          : [...categories, category],
      };
    });
  };

  const savePreferences = () => {
    if (!preferencesDraft) return;
    updatePreferencesMutation.mutate({
      emailEnabled: preferencesDraft.emailEnabled,
      pushEnabled: preferencesDraft.pushEnabled,
      smsEnabled: preferencesDraft.smsEnabled,
      categories: preferencesDraft.categories,
      quietHoursStart: preferencesDraft.quietHoursStart,
      quietHoursEnd: preferencesDraft.quietHoursEnd,
    });
  };

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Central de Notificações</h1>
          <p className="text-muted-foreground">Gerencie alertas, mensagens e preferências de comunicação.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant={filters.unreadOnly ? 'default' : 'outline'} iconName="EyeOff" onClick={handleToggleUnread}>
            {filters.unreadOnly ? 'Exibindo não lidas' : 'Mostrar apenas não lidas'}
          </Button>
          <Button variant="outline" iconName="CheckCheck" onClick={markAllAsRead} disabled={markMutation.isLoading}>
            Marcar todas como lidas
          </Button>
          <Button variant="outline" iconName="Trash2" onClick={deleteSelected} disabled={!selectedNotifications.length || deleteMutation.isLoading}>
            Excluir selecionadas
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
            <Button variant={activeTab === 'reports' ? 'default' : 'outline'} onClick={() => setActiveTab('reports')} disabled>
              Relatórios
            </Button>
          </div>
          {activeTab === 'feed' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filters.category} onChange={handleCategoryChange} options={CATEGORY_OPTIONS} />
              <Input placeholder="Buscar notificações" value={filters.search} onChange={handleSearchChange} />
            </div>
          )}
        </div>

        {activeTab === 'feed' && (
          <div className="space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Icon name="Loader2" className="animate-spin mr-2" /> Carregando notificações...
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Icon name="BellOff" size={40} className="mb-3" />
                Nenhuma notificação encontrada para os filtros selecionados.
              </div>
            )}

            {!isLoading && notifications.length > 0 && (
              <ul className="space-y-3">
                {notifications.map((notification) => {
                  const isUnread = !notification.readAt;
                  return (
                    <li
                      key={notification.id}
                      className={`border rounded-xl p-4 transition-colors ${
                        isUnread ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Checkbox checked={isSelected(notification.id)} onCheckedChange={() => toggleSelection(notification.id)} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${PRIORITY_VARIANTS[notification.priority]}`}>
                                {notification.priority}
                              </span>
                              <span className="text-xs uppercase text-muted-foreground">
                                {categoryLabels[notification.category] ?? notification.category}
                              </span>
                              {isUnread && <span className="text-xs text-primary">• Não lida</span>}
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mt-1">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">{formatDate(notification.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <Button
                              size="sm"
                              variant="ghost"
                              iconName="Check"
                              onClick={() => markMutation.mutate([notification.id])}
                              disabled={markMutation.isLoading}
                            >
                              Marcar como lida
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            iconName="Trash2"
                            onClick={() => deleteMutation.mutate([notification.id])}
                            disabled={deleteMutation.isLoading}
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} notificações)
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={pagination.page <= 1}>
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}

            {selectedNotifications.length > 0 && (
              <div className="flex items-center justify-between border border-dashed border-primary/40 rounded-xl p-4 bg-primary/5">
                <span className="text-sm text-foreground">
                  {selectedNotifications.length} notificação(ões) selecionada(s)
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={markSelectedAsRead} disabled={markMutation.isLoading}>
                    Marcar selecionadas como lidas
                  </Button>
                  <Button variant="outline" size="sm" onClick={deleteSelected} disabled={deleteMutation.isLoading}>
                    Excluir selecionadas
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'preferences' && preferencesDraft && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Canais de comunicação</h2>
              <div className="space-y-2">
                <Button
                  variant={preferencesDraft.emailEnabled ? 'default' : 'outline'}
                  iconName="Mail"
                  onClick={() => togglePreferenceChannel('emailEnabled')}
                >
                  E-mail {preferencesDraft.emailEnabled ? 'ativado' : 'desativado'}
                </Button>
                <Button
                  variant={preferencesDraft.pushEnabled ? 'default' : 'outline'}
                  iconName="Bell"
                  onClick={() => togglePreferenceChannel('pushEnabled')}
                >
                  Notificações push {preferencesDraft.pushEnabled ? 'ativadas' : 'desativadas'}
                </Button>
                <Button
                  variant={preferencesDraft.smsEnabled ? 'default' : 'outline'}
                  iconName="MessageCircle"
                  onClick={() => togglePreferenceChannel('smsEnabled')}
                >
                  SMS {preferencesDraft.smsEnabled ? 'ativado' : 'desativado'}
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Categorias ativas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORY_OPTIONS.filter((option) => option.value !== 'ALL').map((option) => {
                  const isEnabled = preferencesDraft.categories?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => togglePreferenceCategory(option.value)}
                      className={`border rounded-xl px-4 py-3 text-left transition ${
                        isEnabled ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        <Icon name={isEnabled ? 'ToggleRight' : 'ToggleLeft'} className={isEnabled ? 'text-primary' : 'text-muted-foreground'} />
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="pt-2">
                <Button onClick={savePreferences} disabled={updatePreferencesMutation.isLoading}>
                  Salvar preferências
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="text-center py-10 text-muted-foreground">
            Relatórios detalhados de notificações estarão disponíveis em breve.
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationCenter;
