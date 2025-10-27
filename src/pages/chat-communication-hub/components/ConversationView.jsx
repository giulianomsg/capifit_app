import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ConversationView = ({ contact, onShowFileUpload, onShowTemplates }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Mock conversation data
  const [messages, setMessages] = useState([
  {
    id: 1,
    text: 'Olá! Como está seu treino de hoje?',
    sender: 'trainer',
    timestamp: '2024-10-27 09:00',
    type: 'text',
    status: 'read'
  },
  {
    id: 2,
    text: 'Oi! Acabei de terminar. Foi puxado, mas consegui completar tudo! 💪',
    sender: 'client',
    timestamp: '2024-10-27 09:15',
    type: 'text',
    status: 'read'
  },
  {
    id: 3,
    text: 'Que ótimo! Como se sentiu durante os agachamentos?',
    sender: 'trainer',
    timestamp: '2024-10-27 09:16',
    type: 'text',
    status: 'read'
  },
  {
    id: 4,
    text: 'No começo foi difícil, mas depois peguei o ritmo. Obrigada pela dica da postura!',
    sender: 'client',
    timestamp: '2024-10-27 09:18',
    type: 'text',
    status: 'read'
  },
  {
    id: 5,
    text: 'Perfeito! Vou enviar um vídeo mostrando uma variação do exercício para amanhã.',
    sender: 'trainer',
    timestamp: '2024-10-27 09:20',
    type: 'text',
    status: 'read'
  },
  {
    id: 6,
    text: '',
    sender: 'trainer',
    timestamp: '2024-10-27 09:21',
    type: 'video',
    fileName: 'agachamento_variacao.mp4',
    fileSize: '2.3 MB',
    thumbnail: "https://images.unsplash.com/photo-1581705198495-2e4ca0a9fdf6",
    alt: 'Video thumbnail showing proper squat form demonstration',
    status: 'delivered'
  },
  {
    id: 7,
    text: 'Adorei! Vou praticar essa variação. Posso enviar um vídeo meu fazendo para você avaliar?',
    sender: 'client',
    timestamp: '2024-10-27 10:30',
    type: 'text',
    status: 'read'
  }]
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (contact?.id === '1') {// Maria is typing
      const timer = setTimeout(() => setIsTyping(true), 2000);
      const stopTimer = setTimeout(() => setIsTyping(false), 5000);
      return () => {
        clearTimeout(timer);
        clearTimeout(stopTimer);
      };
    }
  }, [contact?.id]);

  const handleSendMessage = () => {
    if (!message?.trim()) return;

    const newMessage = {
      id: messages?.length + 1,
      text: message,
      sender: 'trainer',
      timestamp: new Date()?.toISOString(),
      type: 'text',
      status: 'sent'
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    // Simulate message delivery status update
    setTimeout(() => {
      setMessages((prev) =>
      prev?.map((msg) =>
      msg?.id === newMessage?.id ?
      { ...msg, status: 'delivered' } :
      msg
      )
      );
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':return 'Check';
      case 'delivered':return 'CheckCheck';
      case 'read':return 'CheckCheck';
      default:return 'Clock';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'read':return 'text-blue-500';
      case 'delivered':return 'text-muted-foreground';
      case 'sent':return 'text-muted-foreground';
      default:return 'text-muted-foreground';
    }
  };

  return (
    <>
      {/* Conversation Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                {contact?.avatar ?
                <img
                  src={contact?.avatar}
                  alt={contact?.alt}
                  className="w-full h-full object-cover" /> :


                <Icon name="User" size={20} className="text-muted-foreground" />
                }
              </div>
              {contact?.isOnline &&
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
              }
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground">{contact?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {contact?.isOnline ? 'Online agora' : `Visto por último em ${contact?.lastMessageTime}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" iconName="Phone" />
            <Button variant="ghost" size="sm" iconName="Video" />
            <Button variant="ghost" size="sm" iconName="MoreVertical" />
          </div>
        </div>
      </div>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
        {messages?.map((msg) =>
        <div
          key={msg?.id}
          className={`flex ${msg?.sender === 'trainer' ? 'justify-end' : 'justify-start'}`}>

            <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            msg?.sender === 'trainer' ? 'bg-primary text-white' : 'bg-card border border-border text-foreground'}`
            }>

              {msg?.type === 'text' ?
            <p className="text-sm">{msg?.text}</p> :
            msg?.type === 'video' ?
            <div className="space-y-2">
                  <div className="relative">
                    <img
                  src={msg?.thumbnail}
                  alt={msg?.alt}
                  className="w-full h-32 object-cover rounded" />

                    <div className="absolute inset-0 bg-black/30 rounded flex items-center justify-center">
                      <Icon name="Play" size={32} className="text-white" />
                    </div>
                  </div>
                  <div className="text-xs">
                    <p className="font-medium">{msg?.fileName}</p>
                    <p className="text-muted-foreground">{msg?.fileSize}</p>
                  </div>
                </div> :
            null}
              
              <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
            msg?.sender === 'trainer' ? 'text-white/70' : 'text-muted-foreground'}`
            }>
                <span>{formatTimestamp(msg?.timestamp)}</span>
                {msg?.sender === 'trainer' &&
              <Icon
                name={getStatusIcon(msg?.status)}
                size={12}
                className={getStatusColor(msg?.status)} />

              }
              </div>
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping &&
        <div className="flex justify-start">
            <div className="bg-card border border-border text-foreground max-w-xs px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {contact?.name} está digitando...
              </p>
            </div>
          </div>
        }
        
        <div ref={messagesEndRef} />
      </div>
      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowFileUpload}
            iconName="Paperclip" />

          
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowTemplates}
            iconName="MessageTemplate" />

          
          <div className="flex-1">
            <Input
              placeholder={`Mensagem para ${contact?.name}...`}
              value={message}
              onChange={(e) => setMessage(e?.target?.value)}
              onKeyPress={handleKeyPress}
              multiline
              rows={1} />

          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message?.trim()}
            iconName="Send"
            size="sm">

            Enviar
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 mt-2">
          <Button variant="ghost" size="sm" iconName="Smile">
            😀
          </Button>
          <Button variant="ghost" size="sm" iconName="Camera">
            📷
          </Button>
          <Button variant="ghost" size="sm" iconName="Mic">
            🎤
          </Button>
        </div>
      </div>
    </>);

};

export default ConversationView;