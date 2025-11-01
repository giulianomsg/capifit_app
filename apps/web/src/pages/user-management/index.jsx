import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  uploadUserAvatar,
} from '../../services/userService';
import UserFormModal from './components/UserFormModal';

const statusFilterOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Ativos', value: 'ACTIVE' },
  { label: 'Inativos', value: 'INACTIVE' },
  { label: 'Convidados', value: 'INVITED' },
];

const roleFilterOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Administradores', value: 'admin' },
  { label: 'Treinadores', value: 'trainer' },
  { label: 'Clientes', value: 'client' },
];

const UserManagement = () => {
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const isAdmin = useMemo(() => user?.roles?.includes('admin'), [user]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, roleFilter]);

  const usersQuery = useQuery({
    queryKey: ['users', page, searchTerm, statusFilter, roleFilter],
    queryFn: () =>
      listUsers({
        page,
        perPage: 20,
        search: searchTerm || undefined,
        statuses: statusFilter !== 'all' ? [statusFilter] : undefined,
        roles: roleFilter !== 'all' ? [roleFilter] : undefined,
      }),
    enabled: isAdmin,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFeedback({ type: 'success', message: 'Usuário criado com sucesso.' });
      setShowModal(false);
    },
    onError: (error) => {
      const message = error?.response?.data?.message ?? 'Não foi possível criar o usuário.';
      setFeedback({ type: 'error', message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFeedback({ type: 'success', message: 'Usuário atualizado.' });
      setShowModal(false);
      if (user?.id === updated?.id) {
        refreshProfile().catch(() => undefined);
      }
    },
    onError: (error) => {
      const message = error?.response?.data?.message ?? 'Não foi possível atualizar o usuário.';
      setFeedback({ type: 'error', message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFeedback({ type: 'success', message: 'Usuário removido.' });
    },
    onError: (error) => {
      const message = error?.response?.data?.message ?? 'Não foi possível remover o usuário.';
      setFeedback({ type: 'error', message });
    },
  });

  const avatarMutation = useMutation({
    mutationFn: ({ id, file }) => uploadUserAvatar(id, file),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFeedback({ type: 'success', message: 'Avatar atualizado com sucesso.' });
      if (user?.id === updated?.id) {
        refreshProfile().catch(() => undefined);
      }
    },
    onError: (error) => {
      const message = error?.response?.data?.message ?? 'Não foi possível atualizar o avatar.';
      setFeedback({ type: 'error', message });
    },
  });

  const isLoading = usersQuery.isLoading || usersQuery.isFetching;
  const isError = usersQuery.isError;
  const users = usersQuery.data?.data ?? [];
  const pagination = usersQuery.data?.pagination;

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit);
    setShowModal(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      deleteMutation.mutate(userId);
    }
  };

  const handleSubmit = async (payload) => {
    if (editingUser) {
      await updateMutation.mutateAsync({ id: editingUser.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleAvatarChange = (userId, file) => {
    if (!file) return;
    avatarMutation.mutate({ id: userId, file });
  };

  if (!isAdmin) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-8">
        <div className="max-w-lg text-center space-y-4">
          <Icon name="ShieldAlert" size={48} className="mx-auto text-warning" />
          <h1 className="text-2xl font-semibold text-foreground">Acesso restrito</h1>
          <p className="text-muted-foreground">
            Apenas administradores podem gerenciar usuários e perfis de acesso. Entre em contato com o suporte para solicitar
            permissões adicionais.
          </p>
          <Button href="/dashboard-principal" as="a" iconName="ArrowLeft" iconPosition="left">
            Voltar ao dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
            <p className="text-muted-foreground">Controle os acessos de administradores, treinadores e clientes</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" iconName="RefreshCw" iconPosition="left" onClick={() => usersQuery.refetch()}>
              Atualizar
            </Button>
            <Button iconName="UserPlus" iconPosition="left" onClick={handleCreate}>
              Novo usuário
            </Button>
          </div>
        </div>

        {feedback && (
          <div
            className={`rounded-lg border p-4 ${
              feedback.type === 'error'
                ? 'border-destructive/40 bg-destructive/10 text-destructive'
                : 'border-success/40 bg-success/10 text-success'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Buscar"
            placeholder="Procure por nome, email ou telefone"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <Select
            label="Status"
            options={statusFilterOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />

          <Select
            label="Perfil"
            options={roleFilterOptions}
            value={roleFilter}
            onChange={setRoleFilter}
          />
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Funções
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Telefone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Criado em
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Icon name="Loader2" size={20} className="animate-spin" /> Carregando usuários...
                      </div>
                    </td>
                  </tr>
                )}

                {isError && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-destructive">
                      Não foi possível carregar os usuários.
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      Nenhum usuário encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}

                {!isLoading && !isError &&
                  users.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                            {item.avatarUrl ? (
                              <img src={item.avatarUrl} alt={`Avatar de ${item.name}`} className="w-full h-full object-cover" />
                            ) : (
                              <Icon name="User" size={18} className="text-secondary-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {item.roles.map((role) => (
                            <span key={role} className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {role.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === 'ACTIVE'
                              ? 'bg-success/10 text-success'
                              : item.status === 'INVITED'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.status === 'ACTIVE'
                            ? 'Ativo'
                            : item.status === 'INVITED'
                            ? 'Convite pendente'
                            : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{item.phone ?? '—'}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="Edit"
                            iconPosition="left"
                            onClick={() => handleEdit(item)}
                          >
                            Editar
                          </Button>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                handleAvatarChange(item.id, file);
                                event.target.value = '';
                              }}
                            />
                            <span className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1 text-xs text-foreground hover:bg-muted">
                              <Icon name="ImageUp" size={14} /> Avatar
                            </span>
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="Trash2"
                            iconPosition="left"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Remover
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 text-sm">
              <span>
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="ChevronLeft"
                  iconPosition="left"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1 || isLoading}
                >
                  Anterior
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="ChevronRight"
                  iconPosition="right"
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={pagination.page >= pagination.totalPages || isLoading}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <UserFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        initialData={editingUser}
        mode={editingUser ? 'edit' : 'create'}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default UserManagement;
