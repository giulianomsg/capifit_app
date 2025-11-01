import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

const LoginForm = () => {
  const { login } = useAuth();
  const [generalError, setGeneralError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setGeneralError('');
    try {
      await login(values);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Não foi possível autenticar. Verifique suas credenciais.';
      setGeneralError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {generalError && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-destructive" />
            <p className="text-sm text-destructive font-medium">{generalError}</p>
          </div>
        </div>
      )}
      <Input
        label="Email"
        type="email"
        placeholder="seu.email@exemplo.com"
        error={errors.email?.message}
        disabled={isSubmitting}
        {...register('email')}
      />
      <Input
        label="Senha"
        type="password"
        placeholder="Digite sua senha"
        error={errors.password?.message}
        disabled={isSubmitting}
        {...register('password')}
      />
      <div className="text-right">
        <button type="button" className="text-sm text-primary hover:text-primary/80 transition-colors">
          Esqueci minha senha
        </button>
      </div>
      <Button type="submit" variant="default" size="lg" fullWidth loading={isSubmitting} disabled={isSubmitting}>
        Entrar
      </Button>
    </form>
  );
};

export default LoginForm;
