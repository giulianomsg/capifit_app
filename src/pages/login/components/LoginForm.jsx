import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock credentials for different user types - Updated for CapiFit
  const mockCredentials = {
    trainer: { email: 'joao.silva@capifit.com', password: 'trainer123' },
    client: { email: 'maria.santos@gmail.com', password: 'client123' },
    admin: { email: 'admin@capifit.com', password: 'admin123' }
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Check mock credentials
      const isValidTrainer = formData?.email === mockCredentials?.trainer?.email && 
                           formData?.password === mockCredentials?.trainer?.password;
      const isValidClient = formData?.email === mockCredentials?.client?.email && 
                          formData?.password === mockCredentials?.client?.password;
      const isValidAdmin = formData?.email === mockCredentials?.admin?.email && 
                         formData?.password === mockCredentials?.admin?.password;
      
      if (isValidTrainer || isValidClient || isValidAdmin) {
        // Store user info in localStorage with consistent keys
        const userRole = isValidTrainer ? 'trainer' : isValidClient ? 'client' : 'admin';
        localStorage.setItem('capifit_userRole', userRole);
        localStorage.setItem('capifit_isAuthenticated', 'true');
        localStorage.setItem('capifit_user_logged_in', 'true'); // Keep for backward compatibility
        localStorage.setItem('capifit_loginTime', new Date()?.toISOString());
        
        // Navigate to dashboard
        navigate('/dashboard-principal');
      } else {
        setErrors({
          general: 'Email ou senha incorretos. Use as credenciais de demonstração do CapiFit.'
        });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page (not implemented in this demo)
    console.log('Forgot password clicked');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* General Error */}
      {errors?.general && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-destructive" />
            <p className="text-sm text-destructive font-medium">
              {errors?.general}
            </p>
          </div>
        </div>
      )}
      {/* Email Field */}
      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="seu.email@exemplo.com"
        value={formData?.email}
        onChange={handleInputChange}
        error={errors?.email}
        required
        disabled={isLoading}
      />
      {/* Password Field */}
      <Input
        label="Senha"
        type="password"
        name="password"
        placeholder="Digite sua senha"
        value={formData?.password}
        onChange={handleInputChange}
        error={errors?.password}
        required
        disabled={isLoading}
      />
      {/* Forgot Password Link */}
      <div className="text-right">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Esqueci minha senha
        </button>
      </div>
      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
      >
        Entrar
      </Button>
      
      {/* Demo Credentials Section */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-3">
          🎯 Credenciais de Demonstração
        </h3>
        <div className="space-y-2 text-xs text-blue-700">
          <div className="flex justify-between items-center p-2 bg-white rounded border">
            <div>
              <div className="font-semibold">👑 Admin</div>
              <div>admin@capifit.com</div>
            </div>
            <div className="text-right">
              <div className="font-mono bg-blue-100 px-2 py-1 rounded">admin123</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-white rounded border">
            <div>
              <div className="font-semibold">💪 Personal Trainer</div>
              <div>trainer@capifit.com</div>
            </div>
            <div className="text-right">
              <div className="font-mono bg-blue-100 px-2 py-1 rounded">trainer123</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-white rounded border">
            <div>
              <div className="font-semibold">🏃‍♀️ Cliente</div>
              <div>client@capifit.com</div>
            </div>
            <div className="text-right">
              <div className="font-mono bg-blue-100 px-2 py-1 rounded">client123</div>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-blue-600 mt-3 text-center">
          Clique em qualquer credencial para copiar
        </p>
      </div>
    </div>
  );
};

export default LoginForm;