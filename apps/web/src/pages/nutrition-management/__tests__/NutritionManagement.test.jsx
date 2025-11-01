import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NutritionManagement from '../index.jsx';

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
};

const realtimeState = { socket: mockSocket };
const invalidateQueriesMock = vi.fn();
const useQueryMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args) => useQueryMock(...args),
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

vi.mock('../../components/ui/Header', () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock('../../components/ui/Sidebar', () => ({
  default: () => <div data-testid="sidebar" />,
}));

vi.mock('../../components/ui/Button', () => ({
  default: ({ children, ...props }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('../../contexts/RealtimeContext', () => ({
  useRealtime: () => realtimeState,
}));

vi.mock('../components/NotificationAlert.jsx', () => ({
  default: ({ onClose }) => (
    <div data-testid="notification-alert" onClick={onClose}>
      notification alert
    </div>
  ),
}));

vi.mock('../components/QuickActionCards.jsx', () => ({
  default: () => <div data-testid="quick-actions">quick actions</div>,
}));

vi.mock('../components/NutritionStatsCards.jsx', () => ({
  default: () => <div data-testid="stats-cards">stats cards</div>,
}));

vi.mock('../components/NutritionAnalytics.jsx', () => ({
  default: () => <div data-testid="analytics">analytics</div>,
}));

vi.mock('../components/ActivePlansTable.jsx', () => ({
  default: () => <div data-testid="plans-table">plans table</div>,
}));

vi.mock('../components/FoodSearchPanel.jsx', () => ({
  default: () => <div data-testid="food-search">food search</div>,
}));

describe('NutritionManagement realtime synchronisation', () => {
  beforeEach(() => {
    mockSocket.on.mockReset();
    mockSocket.off.mockReset();
    invalidateQueriesMock.mockReset();
    useQueryMock.mockReset();
    realtimeState.socket = mockSocket;

    useQueryMock.mockImplementation(({ queryKey }) => {
      const [, scope] = queryKey;
      if (scope === 'overview') {
        return { data: { stats: {} }, isLoading: false, isError: false };
      }

      if (scope === 'plans') {
        return { data: [{ id: 'plan-1', title: 'Plano A' }], isLoading: false, isError: false };
      }

      if (scope === 'analytics') {
        return { data: { charts: [] }, isLoading: false, isError: false };
      }

      return { data: null, isLoading: false, isError: false };
    });
  });

  it('registers nutrition realtime listeners and invalidates caches on updates', async () => {
    render(<NutritionManagement />);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith('nutrition:plan-created', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('nutrition:plan-updated', expect.any(Function));
    });

    const createdHandler = mockSocket.on.mock.calls.find(([eventName]) => eventName === 'nutrition:plan-created')[1];
    createdHandler();

    expect(invalidateQueriesMock).toHaveBeenNthCalledWith(1, { queryKey: ['nutrition', 'overview'] });
    expect(invalidateQueriesMock).toHaveBeenNthCalledWith(2, { queryKey: ['nutrition', 'plans'] });
    expect(invalidateQueriesMock).toHaveBeenNthCalledWith(3, { queryKey: ['nutrition', 'analytics'] });
  });

  it('cleans up listeners when component unmounts', async () => {
    const { unmount } = render(<NutritionManagement />);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith('nutrition:plan-created', expect.any(Function));
    });

    const registeredHandlers = mockSocket.on.mock.calls.map(([eventName, handler]) => ({ eventName, handler }));

    unmount();

    registeredHandlers.forEach(({ eventName, handler }) => {
      expect(mockSocket.off).toHaveBeenCalledWith(eventName, handler);
    });
  });

  it('skips subscription when socket is unavailable', () => {
    realtimeState.socket = null;

    render(<NutritionManagement />);

    expect(mockSocket.on).not.toHaveBeenCalled();
  });
});
