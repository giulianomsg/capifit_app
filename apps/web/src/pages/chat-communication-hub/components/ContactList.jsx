import React from 'react';
import Icon from '../../../components/AppIcon';

const ContactList = ({ threads, currentUserId, selectedThreadId, onSelectThread }) => {
  if (!threads?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Icon name="Users" size={32} className="mb-2" />
        Nenhuma conversa encontrada
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {threads.map((thread) => {
        const participant = thread.participants.find((item) => item.userId !== currentUserId);
        const participantUser = participant?.user;
        const lastMessagePreview = thread.lastMessage?.content ?? 'Inicie a conversa';
        const isSelected = selectedThreadId === thread.id;
        const unread = thread.unreadCount > 0;

        return (
          <button
            key={thread.id}
            onClick={() => onSelectThread?.(thread.id)}
            className={`w-full p-3 rounded-lg text-left transition-colors hover:bg-muted/50 ${
              isSelected ? 'bg-primary/10 border border-primary/20' : 'border border-transparent'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                  {participantUser?.avatarUrl ? (
                    <img
                      src={participantUser.avatarUrl}
                      alt={participantUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="User" size={22} className="text-muted-foreground" />
                  )}
                </div>
                {unread && <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {participantUser?.name ?? thread.title ?? 'Conversa' }
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{lastMessagePreview}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ContactList;
