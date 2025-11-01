import React from 'react';
import Icon from '../../../components/AppIcon';

const ProfileTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Perfil do Cliente</h3>
      </div>
      
      <nav className="p-2">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => onTabChange(tab?.id)}
            className={`
              w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg
              transition-all duration-200 mb-1
              ${activeTab === tab?.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground hover:bg-muted hover:text-foreground'
              }
            `}
          >
            <Icon 
              name={tab?.icon} 
              size={18} 
              className="flex-shrink-0"
            />
            <span className="flex-1 text-left">{tab?.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;