import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const defaultValues = {
  trainerId: '',
  clientId: '',
  goals: '',
  injuries: '',
  preferences: '',
  status: 'ACTIVE'
};

const statuses = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'ARCHIVED', label: 'Arquivado' }
];

export function TrainerClientProfileForm({ initialValues, onSubmit, isSubmitting }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues });

  useEffect(() => {
    if (initialValues) {
      reset({ ...defaultValues, ...initialValues });
    } else {
      reset(defaultValues);
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">ID do Trainer</span>
          <input
            type="number"
            className="mt-1 rounded border p-2"
            {...register('trainerId', { required: true, valueAsNumber: true })}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">ID do Cliente</span>
          <input
            type="number"
            className="mt-1 rounded border p-2"
            {...register('clientId', { required: true, valueAsNumber: true })}
          />
        </label>
      </div>
      <label className="flex flex-col">
        <span className="text-sm font-medium text-gray-700">Objetivos</span>
        <textarea className="mt-1 rounded border p-2" rows={3} {...register('goals')} />
      </label>
      <label className="flex flex-col">
        <span className="text-sm font-medium text-gray-700">Lesões</span>
        <textarea className="mt-1 rounded border p-2" rows={2} {...register('injuries')} />
      </label>
      <label className="flex flex-col">
        <span className="text-sm font-medium text-gray-700">Preferências</span>
        <textarea className="mt-1 rounded border p-2" rows={2} {...register('preferences')} />
      </label>
      <label className="flex flex-col">
        <span className="text-sm font-medium text-gray-700">Status</span>
        <select className="mt-1 rounded border p-2" {...register('status')}>
          {statuses.map((status) => (
            <option value={status.value} key={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="rounded bg-primary px-4 py-2 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </div>
    </form>
  );
}
