import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ConversationView = ({ thread, messages, currentUserId, onSendMessage, onOpenTemplates, onOpenFileUpload }) => {
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setDraft('');
  }, [thread?.id]);

  const handleSend = () => {
    if (!draft.trim()) return;
    onSendMessage?.(draft.trim());
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const otherParticipant = thread?.participants?.find((participant) => participant.userId !== currentUserId)?.user;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
            {otherParticipant?.avatarUrl ? (
              <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-full h-full object-cover" />
            ) : (
              <Icon name="User" size={20} className="text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{otherParticipant?.name ?? thread?.title ?? 'Conversa'}</h3>
            <p className="text-sm text-muted-foreground">{otherParticipant?.email ?? ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" iconName="Sparkles" onClick={onOpenTemplates}>
            Templates
          </Button>
          <Button variant="ghost" size="sm" iconName="Paperclip" onClick={onOpenFileUpload}>
            Arquivos
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
        {messages?.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;
          const senderName = isCurrentUser ? 'Você' : message.sender?.name ?? 'Contato';
          return (
            <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xl px-4 py-2 rounded-lg shadow-sm ${
                  isCurrentUser ? 'bg-primary text-white' : 'bg-card border border-border text-foreground'
                }`}
              >
                <p className="text-xs mb-1 opacity-75">{senderName}</p>
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                <p className={`mt-1 text-[11px] ${isCurrentUser ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <span ref={messagesEndRef} />
      </div>

      <div className="border-t border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Escreva uma mensagem..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button iconName="Send" onClick={handleSend} disabled={!draft.trim()}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;
