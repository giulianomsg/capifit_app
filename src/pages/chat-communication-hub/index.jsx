import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ContactList from './components/ContactList';
import ConversationView from './components/ConversationView';
import ClientContextSidebar from './components/ClientContextSidebar';
import QuickTemplates from './components/QuickTemplates';
import FileUploadModal from './components/FileUploadModal';

const ChatCommunicationHub = () => {
  const navigate = useNavigate();
  const [selectedContact, setSelectedContact] = useState(null);
  const [showClientContext, setShowClientContext] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(['1', '3', '5']);

  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('capifit_user_logged_in');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Mock contacts data
  const contacts = [
  {
    id: '1',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    avatar: "https://images.unsplash.com/photo-1734991032476-bceab8383a59",
    alt: 'Professional headshot of Maria Santos, a woman with shoulder-length brown hair',
    lastMessage: 'Obrigada pela dica do exercício!',
    lastMessageTime: '10:30',
    unreadCount: 2,
    isOnline: true,
    clientType: 'premium',
    currentPlan: 'Emagrecimento',
    nextSession: 'Hoje, 16:00'
  },
  {
    id: '2',
    name: 'Carlos Silva',
    email: 'carlos.silva@email.com',
    avatar: "https://images.unsplash.com/photo-1509472240716-cbcd043e2a2d",
    alt: 'Professional headshot of Carlos Silva, a man with short dark hair wearing a suit',
    lastMessage: 'Qual exercício substitui o agachamento?',
    lastMessageTime: 'Ontem',
    unreadCount: 0,
    isOnline: false,
    clientType: 'regular',
    currentPlan: 'Hipertrofia',
    nextSession: 'Amanhã, 09:00'
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    avatar: "https://images.unsplash.com/photo-1730573520193-6ae0b1070621",
    alt: 'Professional headshot of Ana Costa, a woman with long blonde hair smiling',
    lastMessage: 'Consegui fazer 3 séries hoje! 💪',
    lastMessageTime: 'Segunda',
    unreadCount: 1,
    isOnline: true,
    clientType: 'premium',
    currentPlan: 'Condicionamento',
    nextSession: 'Quinta, 14:30'
  },
  {
    id: '4',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    avatar: "https://images.unsplash.com/photo-1610024513279-8724fb30468a",
    alt: 'Professional headshot of Pedro Oliveira, a man with dark hair and beard',
    lastMessage: 'Posso trocar o horário de amanhã?',
    lastMessageTime: 'Terça',
    unreadCount: 0,
    isOnline: false,
    clientType: 'regular',
    currentPlan: 'Perda de Peso',
    nextSession: 'Sexta, 11:00'
  },
  {
    id: '5',
    name: 'Juliana Ferreira',
    email: 'juliana.ferreira@email.com',
    avatar: "https://images.unsplash.com/photo-1629251319039-72c2f65ae67c",
    alt: 'Professional headshot of Juliana Ferreira, a woman with curly hair',
    lastMessage: 'Foto do prato de hoje 📸',
    lastMessageTime: '08:45',
    unreadCount: 3,
    isOnline: true,
    clientType: 'premium',
    currentPlan: 'Definição',
    nextSession: 'Hoje, 19:00'
  }];


  // Filter contacts based on search
  const filteredContacts = contacts?.filter((contact) =>
  contact?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
  contact?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  // Get unread message count
  const totalUnreadCount = contacts?.reduce((total, contact) => total + contact?.unreadCount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard-principal')}
                iconName="ArrowLeft"
                iconPosition="left">

                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center">
                  <Icon name="MessageSquare" size={24} className="mr-3 text-primary" />
                  Central de Comunicação
                </h1>
                <p className="text-sm text-muted-foreground">
                  Converse com seus clientes em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Online indicator */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{onlineUsers?.length} online</span>
              </div>

              {/* Unread messages indicator */}
              {totalUnreadCount > 0 &&
              <div className="flex items-center space-x-2 text-sm">
                  <Icon name="MessageCircle" size={16} className="text-primary" />
                  <span className="text-primary font-medium">{totalUnreadCount} não lidas</span>
                </div>
              }

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(true)}
                iconName="MessageTemplate"
                iconPosition="left">

                Templates
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Sidebar - Contact List */}
        <div className="w-80 bg-card border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              leftIcon="Search" />

          </div>
          
          <div className="flex-1 overflow-y-auto">
            <ContactList
              contacts={filteredContacts}
              selectedContact={selectedContact}
              onContactSelect={setSelectedContact}
              onlineUsers={onlineUsers} />

          </div>
        </div>

        {/* Center - Conversation View */}
        <div className="flex-1 flex flex-col">
          {selectedContact ?
          <ConversationView
            contact={selectedContact}
            onShowFileUpload={() => setShowFileUpload(true)}
            onShowTemplates={() => setShowTemplates(true)} /> :


          <div className="flex-1 flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <Icon name="MessageSquare" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Selecione uma Conversa
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Escolha um cliente na lista para começar a conversar ou envie mensagens 
                  sobre treinos, dúvidas e motivação.
                </p>
              </div>
            </div>
          }
        </div>

        {/* Right Sidebar - Client Context */}
        {selectedContact && showClientContext &&
        <div className="w-80 bg-card border-l border-border">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Informações do Cliente</h3>
              <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClientContext(false)}
              iconName="X" />

            </div>
            <ClientContextSidebar contact={selectedContact} />
          </div>
        }
      </div>
      {/* Modals */}
      {showTemplates &&
      <QuickTemplates
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={(template) => {
          // Handle template selection
          setShowTemplates(false);
        }} />

      }
      {showFileUpload &&
      <FileUploadModal
        onClose={() => setShowFileUpload(false)}
        onUpload={(files) => {
          // Handle file upload
          setShowFileUpload(false);
        }} />

      }
      {/* Toggle Client Context Button */}
      {selectedContact && !showClientContext &&
      <button
        onClick={() => setShowClientContext(true)}
        className="fixed right-4 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors z-50">

          <Icon name="Info" size={20} />
        </button>
      }
    </div>);

};

export default ChatCommunicationHub;