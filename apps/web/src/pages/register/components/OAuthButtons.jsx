import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const OAuthButtons = ({ onOAuthLogin, className = "" }) => {
  const oauthProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'Chrome',
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-white'
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: 'Apple',
      color: 'bg-gray-900 hover:bg-black',
      textColor: 'text-white'
    }
  ];

  const handleOAuthClick = (provider) => {
    if (onOAuthLogin) {
      onOAuthLogin(provider);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          Cadastre-se rapidamente com
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {oauthProviders?.map((provider) => (
          <Button
            key={provider?.id}
            variant="outline"
            onClick={() => handleOAuthClick(provider?.id)}
            className={`
              w-full justify-center py-3 border-2 transition-all duration-200
              hover:shadow-md ${provider?.color} ${provider?.textColor}
              border-transparent hover:border-transparent
            `}
          >
            <Icon name={provider?.icon} size={18} className="mr-2" />
            Continuar com {provider?.name}
          </Button>
        ))}
      </div>
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground">
            ou cadastre-se com email
          </span>
        </div>
      </div>
    </div>
  );
};

export default OAuthButtons;