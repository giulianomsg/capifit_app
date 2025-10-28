import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TrainerClientProfilesPage from '../pages/gerenciar-alunos';
import * as api from '../lib/api';

vi.mock('../lib/api');

describe('TrainerClientProfilesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.fetchTrainerClientProfiles.mockResolvedValue({
      data: [
        { id: 1, trainerId: 1, clientId: 10, goals: 'Perder peso', status: 'ACTIVE' }
      ],
      total: 1,
      page: 1,
      pageSize: 10
    });
    api.createTrainerClientProfile.mockResolvedValue({ id: 2 });
    api.updateTrainerClientProfile.mockResolvedValue({ id: 1 });
    api.deleteTrainerClientProfile.mockResolvedValue(1);
  });

  it('renders list of profiles', async () => {
    render(<TrainerClientProfilesPage />);

    expect(await screen.findByText(/Gerenciar Alunos/i)).toBeInTheDocument();
    expect(await screen.findByText(/Cliente #10/i)).toBeInTheDocument();
  });

  it('filters profiles by search', async () => {
    render(<TrainerClientProfilesPage />);

    const search = await screen.findByPlaceholderText(/Buscar aluno/i);
    fireEvent.change(search, { target: { value: 'João' } });

    await waitFor(() => {
      expect(api.fetchTrainerClientProfiles).toHaveBeenLastCalledWith({ page: 1, pageSize: 10, search: 'João' });
    });
  });
});
