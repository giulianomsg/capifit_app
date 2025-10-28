import React, { useState } from 'react';

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ContactList from './components/ContactList';
import ConversationView from './components/ConversationView';
import ClientContextSidebar from './components/ClientContextSidebar';
import QuickTemplates from './components/QuickTemplates';
import FileUploadModal from './components/FileUploadModal';

const ChatCommunicationHub = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [showClientContext, setShowClientContext] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineUsers] = useState(['1', '3', '5']);

  const contacts = [
    {
      id: '1',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      avatar: 'https://images.unsplash.com/photo-1734991032476-bceab8383a59',
      alt: 'Professional headshot of Maria Santos, a woman with shoulder-length brown hair',
      lastMessage: 'Obrigada pela dica do exercício!',
      lastMessageTime: '10:30',
      unreadCount: 2,
      isOnline: true,
      clientType: 'premium',
      currentPlan: 'Emagrecimento',
      nextSession: 'Hoje, 16:00',
    },
    {
      id: '2',
      name: 'Carlos Silva',
      email: 'carlos.silva@email.com',
      avatar: 'https://images.unsplash.com/photo-1509472240716-cbcd043e2a2d',
      alt: 'Professional headshot of Carlos Silva, a man with short dark hair wearing a suit',
      lastMessage: 'Qual exercício substitui o agachamento?',
      lastMessageTime: 'Ontem',
      unreadCount: 0,
      isOnline: false,
      clientType: 'regular',
      currentPlan: 'Hipertrofia',
      nextSession: 'Amanhã, 09:00',
    },
    {
      id: '3',
      name: 'Ana Clara',
      email: 'ana.costa@email.com',
      avatar: 'https://images.unsplash.com/photo-1730573520193-6ae0b1070621',
      alt: 'Professional headshot of Ana Costa, a woman with long blonde hair smiling',
      lastMessage: 'Consegui fazer 3 séries hoje! 💪',
      lastMessageTime: 'Segunda',
      unreadCount: 1,
      isOnline: true,
      clientType: 'premium',
      currentPlan: 'Condicionamento',
      nextSession: 'Quinta, 14:30',
    },
    {
      id: '4',
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@email.com',
      avatar: 'https://images.unsplash.com/photo-1610024513279-8724fb30468a',
      alt: 'Professional headshot of Pedro Oliveira, a man with dark hair and beard',
      lastMessage: 'Posso trocar o horário de amanhã?',
      lastMessageTime: 'Domingo',
      unreadCount: 0,
      isOnline: false,
      clientType: 'regular',
      currentPlan: 'Performance',
      nextSession: 'Sexta, 08:00',
    },
  ];

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <ContactList
          contacts={filteredContacts}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
          onlineUsers={onlineUsers}
        />
      </aside>

      <main className="flex-1 flex flex-col">
        <ConversationView
          contact={selectedContact}
          onOpenTemplates={() => setShowTemplates(true)}
          onOpenFileUpload={() => setShowFileUpload(true)}
          showClientContext={showClientContext}
          onToggleClientContext={() => setShowClientContext((prev) => !prev)}
        />
      </main>

      {showClientContext && selectedContact && (
        <ClientContextSidebar contact={selectedContact} onClose={() => setShowClientContext(false)} />
      )}

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
