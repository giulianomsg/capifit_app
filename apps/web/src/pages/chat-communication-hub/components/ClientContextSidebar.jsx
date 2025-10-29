import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const tabs = [
  { id: 'info', label: 'Informações', icon: 'User' },
  { id: 'activity', label: 'Atividade', icon: 'Activity' },
];

const ClientContextSidebar = ({ participant }) => {
  const [activeTab, setActiveTab] = useState('info');

  if (!participant) {
    return (
      <aside className="hidden lg:flex lg:w-72 border-l border-border bg-card items-center justify-center text-muted-foreground">
        Nenhum contato selecionado
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex lg:w-72 border-l border-border bg-card flex-col">
      <div className="p-4 border-b border-border text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {participant.user?.avatarUrl ? (
            <img src={participant.user.avatarUrl} alt={participant.user.name} className="w-full h-full object-cover" />
          ) : (
            <Icon name="User" size={28} className="text-muted-foreground" />
          )}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-foreground">{participant.user?.name}</h3>
        <p className="text-sm text-muted-foreground">{participant.user?.email}</p>
      </div>

      <div className="p-4 border-b border-border flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition ${
              activeTab === tab.id ? 'bg-primary text-white' : 'bg-muted text-foreground'
            }`}
          >
            <Icon name={tab.icon} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
        {activeTab === 'info' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="Mail" size={14} className="text-muted-foreground" />
              <span>{participant.user?.email ?? 'E-mail não informado'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Info" size={14} className="text-muted-foreground" />
              <span>ID: {participant.user?.id}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Utilize esta conversa para alinhar treinos, avaliações e planos. As atividades mais recentes aparecerão aqui assim que
              forem registradas.
            </p>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="space-y-3 text-muted-foreground">
            <p className="text-xs">Atividade consolidada será exibida aqui quando disponível.</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ClientContextSidebar;
