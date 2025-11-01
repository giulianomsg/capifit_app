import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const ClientSelector = ({ clients, selectedClient, onClientSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients?.filter(client =>
    client?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    client?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Selecionar Cliente
      </h3>
      {/* Search Input */}
      <div className="mb-4">
        <Input
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)}
          leftIcon="Search"
        />
      </div>
      {/* Clients List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredClients?.map((client) => (
          <button
            key={client?.id}
            onClick={() => onClientSelect?.(client)}
            className={`
              w-full p-3 rounded-lg text-left border transition-colors
              ${selectedClient?.id === client?.id
                ? 'border-primary bg-primary/10 text-primary' :'border-border hover:border-primary/50 hover:bg-muted/30'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                {client?.avatar ? (
                  <img 
                    src={client?.avatar} 
                    alt={client?.alt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon name="User" size={20} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {client?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {client?.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Última: {new Date(client?.lastAssessment)?.toLocaleDateString('pt-BR')}
                </p>
              </div>
              {selectedClient?.id === client?.id && (
                <Icon name="Check" size={16} className="text-primary" />
              )}
            </div>
          </button>
        ))}
      </div>
      {filteredClients?.length === 0 && (
        <div className="text-center py-4">
          <Icon name="Users" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhum cliente encontrado
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientSelector;