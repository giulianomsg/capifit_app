import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ContactList from './components/ContactList';
import ConversationView from './components/ConversationView';
import ClientContextSidebar from './components/ClientContextSidebar';
import QuickTemplates from './components/QuickTemplates';
import FileUploadModal from './components/FileUploadModal';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import {
  fetchThread,
  listThreads,
  markThreadAsRead,
  sendThreadMessage,
} from '../../services/messagingService';

const ChatCommunicationHub = () => {
  const { user } = useAuth();
  const { socket } = useRealtime();
  const queryClient = useQueryClient();

  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientContext, setShowClientContext] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const threadsQuery = useQuery({
    queryKey: ['threads', searchTerm],
    queryFn: () => listThreads({ search: searchTerm.trim() || undefined }),
  });

  const threadQuery = useQuery({
    queryKey: ['thread', selectedThreadId],
    queryFn: () => fetchThread(selectedThreadId),
    enabled: Boolean(selectedThreadId),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content) => sendThreadMessage(selectedThreadId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', selectedThreadId] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });

  const markThreadMutation = useMutation({
    mutationFn: ({ threadId, payload }) => markThreadAsRead(threadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });

  useEffect(() => {
    if (!socket) return undefined;
    const handleIncomingMessage = (message) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      if (message.threadId === selectedThreadId) {
        queryClient.invalidateQueries({ queryKey: ['thread', selectedThreadId] });
      }
    };
    socket.on('message:new', handleIncomingMessage);
    return () => {
      socket.off('message:new', handleIncomingMessage);
    };
  }, [queryClient, selectedThreadId, socket]);

  useEffect(() => {
    if (!selectedThreadId || !threadQuery.data || !user?.id) {
      return;
    }
    if (markThreadMutation.isLoading) {
      return;
    }
    const participant = threadQuery.data.participants.find((item) => item.userId === user.id);
    const lastMessage = threadQuery.data.messages?.[threadQuery.data.messages.length - 1];
    if (!participant || !lastMessage) {
      return;
    }
    const hasUnread = !participant.lastReadAt || new Date(participant.lastReadAt) < new Date(lastMessage.createdAt);
    if (hasUnread) {
      markThreadMutation.mutate({ threadId: selectedThreadId, payload: { lastMessageId: lastMessage.id } });
    }
  }, [markThreadMutation, selectedThreadId, threadQuery.data, user?.id]);

  const threads = threadsQuery.data?.data ?? [];
  const contacts = useMemo(() => threads, [threads]);
  useEffect(() => {
    if (!contacts.length && selectedThreadId) {
      setSelectedThreadId(null);
      return;
    }
    if (!selectedThreadId && contacts.length > 0) {
      setSelectedThreadId(contacts[0].id);
    }
  }, [contacts, selectedThreadId]);
  const selectedThread = threadQuery.data;
  const selectedParticipant = selectedThread?.participants?.find((participant) => participant.userId !== user?.id);

  const handleSendMessage = (content) => {
    sendMessageMutation.mutate(content);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-4rem)]">
      <aside className="lg:w-80 border-r border-border bg-card">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
            <Button variant="outline" size="icon" onClick={() => setShowTemplates(true)}>
              <Icon name="Sparkles" size={18} />
            </Button>
          </div>

          <Input
            placeholder="Buscar cliente ou assunto"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <ContactList
          threads={contacts}
          currentUserId={user?.id}
          selectedThreadId={selectedThreadId}
          onSelectThread={setSelectedThreadId}
        />
      </aside>

      <main className="flex-1 flex flex-col">
        {selectedThread ? (
          <ConversationView
            thread={selectedThread}
            messages={selectedThread.messages}
            currentUserId={user?.id}
            onSendMessage={handleSendMessage}
            onOpenTemplates={() => setShowTemplates(true)}
            onOpenFileUpload={() => setShowFileUpload(true)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Selecione uma conversa para começar
          </div>
        )}
      </main>

      {showClientContext && (
        <ClientContextSidebar participant={selectedParticipant} />
      )}

      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button variant="outline" iconName={showClientContext ? 'EyeOff' : 'Eye'} onClick={() => setShowClientContext((prev) => !prev)}>
          {showClientContext ? 'Ocultar contexto' : 'Mostrar contexto'}
        </Button>
      </div>

      {showTemplates && (
        <QuickTemplates onClose={() => setShowTemplates(false)} onSelectTemplate={() => setShowTemplates(false)} />
      )}

      {showFileUpload && (
        <FileUploadModal onClose={() => setShowFileUpload(false)} onUpload={() => setShowFileUpload(false)} />
      )}
    </div>
  );
};

export default ChatCommunicationHub;
