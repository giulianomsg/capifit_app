import React from 'react';

import Button from '../../../components/ui/Button';

const OAuthButtons = ({ disabled = false }) => {
  const handleUnavailable = () => {
    alert('Login social estará disponível em breve. Utilize o acesso com e-mail e senha.');
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground">ou continue com</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="lg"
        fullWidth
        onClick={handleUnavailable}
        disabled={disabled}
        className="justify-center"
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg">🔒</span>
          <span>Continuar com Google</span>
        </div>
      </Button>

      <Button
        variant="outline"
        size="lg"
        fullWidth
        onClick={handleUnavailable}
        disabled={disabled}
        className="justify-center"
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg">🔒</span>
          <span>Continuar com Apple</span>
        </div>
      </Button>
    </div>
  );
};

export default OAuthButtons;
