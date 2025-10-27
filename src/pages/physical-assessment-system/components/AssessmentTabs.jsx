import React from 'react';
import Icon from '../../../components/AppIcon';

const AssessmentTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => onTabChange?.(tab?.id)}
            className={`
              flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${activeTab === tab?.id
                ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }
            `}
          >
            <Icon name={tab?.icon} size={18} />
            <span>{tab?.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AssessmentTabs;