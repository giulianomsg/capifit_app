import React from 'react';
import Icon from '../../../components/AppIcon';

const ContactList = ({ contacts, selectedContact, onContactSelect, onlineUsers }) => {
  const getClientTypeColor = (type) => {
    switch (type) {
      case 'premium': return 'text-yellow-600';
      case 'regular': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  const getClientTypeIcon = (type) => {
    switch (type) {
      case 'premium': return 'Crown';
      case 'regular': return 'User';
      default: return 'User';
    }
  };

  const formatTime = (time) => {
    // Simple time formatting - in a real app you'd use proper date formatting
    return time;
  };

  return (
    <div className="space-y-1 p-2">
      {contacts?.map((contact) => {
        const isSelected = selectedContact?.id === contact?.id;
        const isOnline = onlineUsers?.includes(contact?.id);
        
        return (
          <button
            key={contact?.id}
            onClick={() => onContactSelect?.(contact)}
            className={`
              w-full p-3 rounded-lg text-left transition-colors hover:bg-muted/50
              ${isSelected 
                ? 'bg-primary/10 border border-primary/20' :'hover:bg-muted/30'
              }
            `}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                  {contact?.avatar ? (
                    <img 
                      src={contact?.avatar} 
                      alt={contact?.alt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="User" size={24} className="text-muted-foreground" />
                  )}
                </div>
                
                {/* Online status */}
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-medium truncate ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}>
                      {contact?.name}
                    </h4>
                    
                    {/* Client type indicator */}
                    <Icon 
                      name={getClientTypeIcon(contact?.clientType)} 
                      size={14} 
                      className={getClientTypeColor(contact?.clientType)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(contact?.lastMessageTime)}
                    </span>
                    
                    {/* Unread count */}
                    {contact?.unreadCount > 0 && (
                      <div className="min-w-[20px] h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center px-1">
                        {contact?.unreadCount}
                      </div>
                    )}
                  </div>
                </div>

                {/* Last message */}
                <p className="text-sm text-muted-foreground truncate mb-2">
                  {contact?.lastMessage}
                </p>

                {/* Client info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {contact?.currentPlan}
                  </span>
                  
                  {contact?.nextSession && (
                    <span className="text-muted-foreground">
                      📅 {contact?.nextSession}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}

      {contacts?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Users" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhuma conversa encontrada
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactList;