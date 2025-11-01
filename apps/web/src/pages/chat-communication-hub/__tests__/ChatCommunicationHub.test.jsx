import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider, setLogger } from '@tanstack/react-query';
import { describe, beforeEach, vi, it, expect } from 'vitest';

import ChatCommunicationHub from '../index.jsx';

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
};

const listThreadsMock = vi.fn();
const fetchThreadMock = vi.fn();
const markThreadAsReadMock = vi.fn();
const sendThreadMessageMock = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'trainer-1', name: 'Treinador' } }),
}));

vi.mock('../../contexts/RealtimeContext', () => ({
  useRealtime: () => ({ socket: mockSocket }),
}));

vi.mock('../components/QuickTemplates', () => ({
  default: ({ onClose }) => (
    <div data-testid="quick-templates" onClick={onClose}>
      Templates
    </div>
  ),
}));

vi.mock('../components/FileUploadModal', () => ({
  default: ({ onClose }) => (
    <div data-testid="file-upload" onClick={onClose}>
      Upload
    </div>
  ),
}));

vi.mock('../../services/messagingService', () => ({
  listThreads: (...args) => listThreadsMock(...args),
  fetchThread: (...args) => fetchThreadMock(...args),
  markThreadAsRead: (...args) => markThreadAsReadMock(...args),
  sendThreadMessage: (...args) => sendThreadMessageMock(...args),
}));

describe('ChatCommunicationHub', () => {
  setLogger({ log: () => {}, warn: () => {}, error: () => {} });

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

  beforeEach(() => {
    mockSocket.on.mockReset();
    mockSocket.off.mockReset();
    listThreadsMock.mockReset();
    fetchThreadMock.mockReset();
    markThreadAsReadMock.mockReset();
    sendThreadMessageMock.mockReset();

    const thread = {
      id: 'thread-1',
      title: 'Cliente destaque',
      participants: [
        { userId: 'trainer-1', lastReadAt: null },
        {
          userId: 'client-1',
          user: { id: 'client-1', name: 'Cliente 1', email: 'cliente1@example.com' },
        },
      ],
      unreadCount: 1,
      lastMessage: { id: 'message-1', content: 'Olá, treinador!' },
      lastMessageAt: '2024-05-05T10:00:00.000Z',
    };

    listThreadsMock.mockResolvedValue({ data: [thread] });

    fetchThreadMock.mockResolvedValue({
      ...thread,
      messages: [
        {
          id: 'message-1',
          threadId: 'thread-1',
          content: 'Olá, treinador! Pode enviar o treino?',
          createdAt: '2024-05-05T10:00:00.000Z',
          senderId: 'client-1',
          sender: { id: 'client-1', name: 'Cliente 1' },
        },
      ],
    });

    markThreadAsReadMock.mockResolvedValue({ success: true });
    sendThreadMessageMock.mockResolvedValue({ success: true });
  });

  it('seleciona automaticamente a primeira conversa e exibe as mensagens', async () => {
    const wrapper = createWrapper();
    render(<ChatCommunicationHub />, { wrapper });

    expect(await screen.findByText('Conversas')).toBeInTheDocument();
    expect(await screen.findByText('Cliente 1')).toBeInTheDocument();
    expect(await screen.findByText('Olá, treinador! Pode enviar o treino?')).toBeInTheDocument();

    await waitFor(() => expect(mockSocket.on).toHaveBeenCalledWith('message:new', expect.any(Function)));
    await waitFor(() => expect(markThreadAsReadMock).toHaveBeenCalledWith('thread-1', { lastMessageId: 'message-1' }));
  });

  it('envia novas mensagens usando o serviço de chat', async () => {
    const wrapper = createWrapper();
    render(<ChatCommunicationHub />, { wrapper });

    const messageInput = await screen.findByPlaceholderText('Escreva uma mensagem...');
    await userEvent.type(messageInput, 'Mensagem de teste');

    const sendButton = screen.getByRole('button', { name: /enviar/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(sendThreadMessageMock).toHaveBeenCalledTimes(1);
      expect(sendThreadMessageMock).toHaveBeenCalledWith('thread-1', { content: 'Mensagem de teste' });
    });
  });
});
