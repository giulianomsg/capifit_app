import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import WorkoutTemplates from '../WorkoutTemplates.jsx';

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
};

const realtimeState = { socket: mockSocket };
const invalidateQueriesMock = vi.fn();
const useQueryMock = vi.fn();
const useMutationMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args) => useQueryMock(...args),
  useMutation: (...args) => useMutationMock(...args),
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

vi.mock('../../../../contexts/RealtimeContext', () => ({
  useRealtime: () => realtimeState,
}));

vi.mock('../../../../services/workoutService', () => ({
  listWorkouts: vi.fn(),
  getWorkout: vi.fn(),
}));

describe('WorkoutTemplates realtime synchronisation', () => {
  beforeEach(() => {
    mockSocket.on.mockReset();
    mockSocket.off.mockReset();
    invalidateQueriesMock.mockReset();
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    realtimeState.socket = mockSocket;

    useQueryMock.mockReturnValue({ data: { data: [] }, isLoading: false });
    useMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it('registra listeners para eventos de treino e invalida o cache para cada atualização', async () => {
    render(<WorkoutTemplates onApplyTemplate={vi.fn()} />);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledTimes(3);
    });

    const handlers = mockSocket.on.mock.calls.reduce((acc, [eventName, handler]) => {
      acc[eventName] = handler;
      return acc;
    }, {});

    expect(Object.keys(handlers)).toEqual(
      expect.arrayContaining(['workout:created', 'workout:updated', 'workout:deleted']),
    );

    handlers['workout:created']?.();
    handlers['workout:updated']?.();
    handlers['workout:deleted']?.();

    expect(invalidateQueriesMock).toHaveBeenCalledTimes(3);
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['workouts', 'templates'] });
  });

  it('limpa os listeners registrados ao desmontar', async () => {
    const { unmount } = render(<WorkoutTemplates onApplyTemplate={vi.fn()} />);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalled();
    });

    const listeners = mockSocket.on.mock.calls.map(([eventName, handler]) => ({ eventName, handler }));
    unmount();

    listeners.forEach(({ eventName, handler }) => {
      expect(mockSocket.off).toHaveBeenCalledWith(eventName, handler);
    });
  });

  it('não registra listeners quando o socket não está disponível', () => {
    realtimeState.socket = null;

    render(<WorkoutTemplates onApplyTemplate={vi.fn()} />);

    expect(mockSocket.on).not.toHaveBeenCalled();
  });
});
