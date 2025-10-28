import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTrainerClientProfiles,
  useCreateTrainerClientProfile,
  useUpdateTrainerClientProfile,
  useDeleteTrainerClientProfile
} from '../../hooks/useTrainerClientProfiles';
import { TrainerClientProfileForm } from '../../components/TrainerClientProfileForm';

const queryClient = new QueryClient();

function TrainerClientProfilesPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);

  const queryParams = useMemo(() => ({ page, pageSize, search }), [page, pageSize, search]);

  const { data, isLoading, isFetching } = useTrainerClientProfiles(queryParams);
  const createMutation = useCreateTrainerClientProfile();
  const updateMutation = useUpdateTrainerClientProfile();
  const deleteMutation = useDeleteTrainerClientProfile();

  const handleSubmit = async (values) => {
    if (selectedProfile) {
      await updateMutation.mutateAsync({ id: selectedProfile.id, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setSelectedProfile(null);
  };

  const handleEdit = (profile) => {
    setSelectedProfile({
      ...profile,
      trainerId: profile.trainerId,
      clientId: profile.clientId
    });
  };

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Alunos</h1>
          <p className="text-sm text-gray-600">Sincronize informações de clientes com o backend.</p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="w-full rounded border p-2 md:w-64"
          placeholder="Buscar aluno"
        />
      </header>

      <section className="rounded border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedProfile ? 'Editar Perfil' : 'Novo Perfil'}
        </h2>
        <TrainerClientProfileForm
          initialValues={selectedProfile}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </section>

      <section className="rounded border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Perfis Cadastrados</h2>
          {isFetching && <span className="text-sm text-gray-500">Atualizando...</span>}
        </div>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Carregando perfis...</div>
        ) : data?.data?.length ? (
          <div className="space-y-3">
            {data.data.map((profile) => (
              <article key={profile.id} className="rounded border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Cliente #{profile.clientId} • Trainer #{profile.trainerId}
                    </h3>
                    <p className="text-sm text-gray-600">Objetivo: {profile.goals || '—'}</p>
                    <p className="text-sm text-gray-600">Status: {profile.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded border px-3 py-1 text-sm" onClick={() => handleEdit(profile)}>
                      Editar
                    </button>
                    <button
                      className="rounded border border-red-500 px-3 py-1 text-sm text-red-600"
                      onClick={() => handleDelete(profile.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">Nenhum perfil encontrado.</div>
        )}
        <footer className="mt-4 flex items-center justify-between">
          <button
            className="rounded border px-3 py-1 text-sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages || 1}
          </span>
          <button
            className="rounded border px-3 py-1 text-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </button>
        </footer>
      </section>
    </div>
  );
}

export default function TrainerClientProfilesPageWithProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <TrainerClientProfilesPage />
    </QueryClientProvider>
  );
}
