import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import WorkoutTemplates from '../WorkoutTemplates.jsx';

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
};

const invalidateQueriesMock = vi.fn();
const useQueryMock = vi.fn();
const useMutationMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args) => useQueryMock(...args),
  useMutation: (...args) => useMutationMock(...args),
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

vi.mock('../../../../contexts/RealtimeContext', () => ({
  useRealtime: () => ({ socket: mockSocket }),
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

    useQueryMock.mockReturnValue({ data: { data: [] }, isLoading: false });
    useMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it('registers socket listeners and invalidates template cache on realtime updates', async () => {
    render(<WorkoutTemplates onApplyTemplate={vi.fn()} />);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledTimes(3);
    });

    const handler = mockSocket.on.mock.calls[0][1];
    handler();

    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['workouts', 'templates'] });
  });

  it('cleans up socket listeners on unmount', async () => {
    const { unmount } = render(<WorkoutTemplates onApplyTemplate={vi.fn()} />);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalled();
    });

    unmount();

    expect(mockSocket.off).toHaveBeenCalled();
  });
});
