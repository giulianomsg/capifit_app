import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider, setLogger } from '@tanstack/react-query';
import { describe, beforeEach, vi, it, expect } from 'vitest';

import NotificationCenter from '../index.jsx';

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
};

const realtimeState = { socket: mockSocket };
const fetchNotificationsMock = vi.fn();
const fetchNotificationPreferencesMock = vi.fn();
const markNotificationsAsReadMock = vi.fn();
const deleteNotificationsMock = vi.fn();
const updateNotificationPreferencesMock = vi.fn();

vi.mock('../../services/notificationService', () => ({
  fetchNotifications: (...args) => fetchNotificationsMock(...args),
  fetchNotificationPreferences: (...args) => fetchNotificationPreferencesMock(...args),
  markNotificationsAsRead: (...args) => markNotificationsAsReadMock(...args),
  deleteNotifications: (...args) => deleteNotificationsMock(...args),
  updateNotificationPreferences: (...args) => updateNotificationPreferencesMock(...args),
}));

vi.mock('../../../contexts/RealtimeContext', () => ({
  useRealtime: () => realtimeState,
}));

describe('NotificationCenter', () => {
  setLogger({ log: () => {}, warn: () => {}, error: () => {} });

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

    return { wrapper, queryClient };
  };

  beforeEach(() => {
    mockSocket.on.mockReset();
    mockSocket.off.mockReset();
    fetchNotificationsMock.mockReset();
    fetchNotificationPreferencesMock.mockReset();
    markNotificationsAsReadMock.mockReset();
    deleteNotificationsMock.mockReset();
    updateNotificationPreferencesMock.mockReset();
    realtimeState.socket = mockSocket;

    fetchNotificationsMock.mockResolvedValue({
      data: [
        {
          id: 'notification-1',
          title: 'Mensagem importante',
          message: 'Você tem um novo aluno aguardando aprovação.',
          createdAt: '2024-05-05T10:00:00.000Z',
          readAt: null,
          category: 'WORKOUT',
          priority: 'HIGH',
        },
      ],
      meta: { page: 1, totalPages: 1, total: 1 },
    });

    fetchNotificationPreferencesMock.mockResolvedValue({
      emailEnabled: true,
      pushEnabled: false,
      smsEnabled: false,
      categories: ['WORKOUT'],
      quietHoursStart: null,
      quietHoursEnd: null,
    });

    markNotificationsAsReadMock.mockResolvedValue({ success: true });
    deleteNotificationsMock.mockResolvedValue({ success: true });
    updateNotificationPreferencesMock.mockResolvedValue({
      emailEnabled: true,
      pushEnabled: false,
      smsEnabled: false,
      categories: ['WORKOUT'],
      quietHoursStart: null,
      quietHoursEnd: null,
    });
  });

  it('exibe notificações carregadas do servidor', async () => {
    const { wrapper } = createWrapper();
    render(<NotificationCenter />, { wrapper });

    expect(await screen.findByText('Central de Notificações')).toBeInTheDocument();
    expect(await screen.findByText('Mensagem importante')).toBeInTheDocument();
    expect(screen.getByText('Você tem um novo aluno aguardando aprovação.')).toBeInTheDocument();
    await waitFor(() => expect(mockSocket.on).toHaveBeenCalledWith('notification:new', expect.any(Function)));
  });

  it('marca todas as notificações não lidas como lidas ao acionar o atalho', async () => {
    const { wrapper } = createWrapper();
    render(<NotificationCenter />, { wrapper });

    const markAllButton = await screen.findByRole('button', { name: /marcar todas como lidas/i });
    await userEvent.click(markAllButton);

    await waitFor(() => {
      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledWith(['notification-1']);
    });
  });

  it('permite alternar preferências de categoria', async () => {
    const { wrapper } = createWrapper();
    render(<NotificationCenter />, { wrapper });

    const preferencesTab = await screen.findByRole('button', { name: /preferências/i });
    await userEvent.click(preferencesTab);

    const workoutCategoryButton = await screen.findByRole('button', { name: /Treinos/i });
    await userEvent.click(workoutCategoryButton);

    await waitFor(() => expect(updateNotificationPreferencesMock).not.toHaveBeenCalled());
    expect(workoutCategoryButton).toHaveClass('border-border');
  });

  it('invalidates notifications when realtime updates arrive', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    render(<NotificationCenter />, { wrapper });

    await waitFor(() => expect(mockSocket.on).toHaveBeenCalledWith('notification:new', expect.any(Function)));
    const handler = mockSocket.on.mock.calls.find(([eventName]) => eventName === 'notification:new')[1];

    handler({
      notification: { id: 'notification-2' },
      delivery: { email: { requested: false, status: 'not-requested' } },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications'] });
  });

  it('desregistra listeners quando o componente desmonta', async () => {
    const { wrapper } = createWrapper();
    const { unmount } = render(<NotificationCenter />, { wrapper });

    await waitFor(() => expect(mockSocket.on).toHaveBeenCalledWith('notification:new', expect.any(Function)));
    const handler = mockSocket.on.mock.calls.find(([eventName]) => eventName === 'notification:new')[1];

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('notification:new', handler);
  });

  it('não registra listeners quando não há socket disponível', () => {
    realtimeState.socket = null;
    const { wrapper } = createWrapper();

    render(<NotificationCenter />, { wrapper });

    expect(mockSocket.on).not.toHaveBeenCalled();
  });
});
