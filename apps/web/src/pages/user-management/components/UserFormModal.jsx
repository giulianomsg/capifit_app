import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox, CheckboxGroup } from '../../../components/ui/Checkbox';

const baseSchema = z.object({
  name: z.string().min(2, 'Informe o nome completo'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .min(8, 'Telefone inválido')
    .max(20, 'Telefone muito longo')
    .optional()
    .or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'INVITED']).default('ACTIVE'),
  roles: z.array(z.enum(['admin', 'trainer', 'client'])).nonempty('Selecione ao menos um perfil'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres').optional(),
});

const createSchema = baseSchema.extend({
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
});

const roleOptions = [
  { label: 'Administrador', value: 'admin', description: 'Acesso completo à plataforma' },
  { label: 'Treinador', value: 'trainer', description: 'Gerencia treinos e clientes' },
  { label: 'Cliente', value: 'client', description: 'Acompanha planos e progresso' },
];

const statusOptions = [
  { label: 'Ativo', value: 'ACTIVE' },
  { label: 'Inativo', value: 'INACTIVE' },
  { label: 'Convidado', value: 'INVITED' },
];

const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'create',
  isSubmitting = false,
}) => {
  const schema = mode === 'create' ? createSchema : baseSchema;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      status: 'ACTIVE',
      roles: ['trainer'],
      password: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name ?? '',
        email: initialData?.email ?? '',
        phone: initialData?.phone ?? '',
        status: initialData?.status ?? 'ACTIVE',
        roles: initialData?.roles ?? ['trainer'],
        password: '',
      });
    }
  }, [initialData, isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  const handleModalClose = () => {
    if (!isSubmitting) {
      onClose?.();
    }
  };

  const submitForm = (data) => {
    const payload = {
      ...data,
      phone: data.phone || undefined,
      password: data.password || undefined,
    };
    onSubmit?.(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleModalClose} />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name={mode === 'create' ? 'UserPlus' : 'UserCog'} size={20} color="white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {mode === 'create' ? 'Adicionar Usuário' : 'Editar Usuário'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Defina os acessos e dados principais do usuário
              </p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleModalClose} disabled={isSubmitting}>
            <Icon name="X" size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit(submitForm)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome completo" placeholder="Ex: Ana Treinadora" {...register('name')} error={errors.name?.message} />
            <Input label="Email" type="email" placeholder="nome@empresa.com" {...register('email')} error={errors.email?.message} />
            <Input label="Telefone" placeholder="(11) 99999-9999" {...register('phone')} error={errors.phone?.message} />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status da conta"
                  options={statusOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.status?.message}
                />
              )}
            />
          </div>

          <Controller
            name="roles"
            control={control}
            render={({ field }) => (
              <CheckboxGroup label="Perfis de acesso" required error={errors.roles?.message}>
                {roleOptions.map((role) => (
                  <Checkbox
                    key={role.value}
                    label={role.label}
                    description={role.description}
                    checked={field.value?.includes(role.value)}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      if (checked) {
                        field.onChange([...(field.value ?? []), role.value]);
                      } else {
                        field.onChange(field.value?.filter((value) => value !== role.value));
                      }
                    }}
                  />
                ))}
              </CheckboxGroup>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={mode === 'create' ? 'Senha inicial' : 'Atualizar senha'}
              type="password"
              placeholder={mode === 'create' ? 'Defina uma senha temporária' : 'Preencha para alterar a senha'}
              {...register('password')}
              error={errors.password?.message}
            />
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Boas práticas de senha:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Mínimo de 8 caracteres</li>
                <li>Combine letras maiúsculas, números e símbolos</li>
                <li>Evite dados pessoais previsíveis</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={handleModalClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} iconName="Save" iconPosition="left">
              {mode === 'create' ? 'Criar conta' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
