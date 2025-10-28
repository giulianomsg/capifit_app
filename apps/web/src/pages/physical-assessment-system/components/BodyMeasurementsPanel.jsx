import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const measurementFields = [
  { key: 'weightKg', label: 'Peso', unit: 'kg', icon: 'Scale' },
  { key: 'heightCm', label: 'Altura', unit: 'cm', icon: 'Ruler' },
  { key: 'bodyFat', label: '% Gordura', unit: '%', icon: 'Activity' },
  { key: 'muscleMass', label: 'Massa Magra', unit: 'kg', icon: 'Zap' },
  { key: 'chest', label: 'Peito', unit: 'cm', icon: 'Maximize2' },
  { key: 'waist', label: 'Cintura', unit: 'cm', icon: 'Minimize2' },
  { key: 'hip', label: 'Quadril', unit: 'cm', icon: 'Circle' },
  { key: 'thigh', label: 'Coxa', unit: 'cm', icon: 'Circle' },
  { key: 'bicep', label: 'Bíceps', unit: 'cm', icon: 'Circle' },
  { key: 'forearm', label: 'Antebraço', unit: 'cm', icon: 'Circle' },
  { key: 'calf', label: 'Panturrilha', unit: 'cm', icon: 'Circle' },
  { key: 'neck', label: 'Pescoço', unit: 'cm', icon: 'Circle' },
];

const defaultMeasurementState = measurementFields.reduce(
  (state, field) => ({ ...state, [field.key]: '' }),
  { recordedAt: new Date().toISOString().split('T')[0], notes: '' },
);

const BodyMeasurementsPanel = ({
  clients,
  selectedClient,
  measurements = [],
  onClientSelect,
  onSaveMeasurement,
  saving = false,
}) => {
  const [form, setForm] = useState(defaultMeasurementState);
  const latestMeasurement = measurements[0] ?? null;

  const bmiInfo = useMemo(() => {
    if (!latestMeasurement?.weightKg || !latestMeasurement?.heightCm) {
      return null;
    }
    const heightInMeters = latestMeasurement.heightCm / 100;
    const bmi = latestMeasurement.weightKg / (heightInMeters * heightInMeters);
    let category = 'Peso normal';
    let color = 'text-green-600';

    if (bmi < 18.5) {
      category = 'Abaixo do peso';
      color = 'text-blue-600';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Sobrepeso';
      color = 'text-amber-600';
    } else if (bmi >= 30) {
      category = 'Obesidade';
      color = 'text-red-600';
    }

    return { bmi: bmi.toFixed(1), category, color };
  }, [latestMeasurement]);

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!selectedClient) {
      return;
    }

    const payload = Object.entries(form).reduce((acc, [key, value]) => {
      if (value === '') {
        return acc;
      }
      if (key === 'recordedAt') {
        acc[key] = value;
      } else if (key === 'notes') {
        acc[key] = value;
      } else {
        acc[key] = Number(value);
      }
      return acc;
    }, {});

    await onSaveMeasurement?.(payload);
    setForm(defaultMeasurementState);
  };

  if (!selectedClient) {
    return (
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Selecione um cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <button
                key={client.clientId}
                type="button"
                onClick={() => onClientSelect?.(client)}
                className="p-4 border border-border rounded-lg text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {client.avatarUrl ? (
                      <img
                        src={client.avatarUrl}
                        alt={`Foto de ${client.name}`}
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Icon name="User" size={20} className="text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {selectedClient.avatarUrl ? (
                <img
                  src={selectedClient.avatarUrl}
                  alt={`Foto de ${selectedClient.name}`}
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Icon name="User" size={28} className="text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{selectedClient.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => onClientSelect?.(null)}>
            Trocar cliente
          </Button>
        </div>

        {latestMeasurement ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {measurementFields.slice(0, 4).map((field) => (
              <div key={field.key} className="bg-muted/40 rounded-lg p-4">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-lg font-semibold text-foreground">
                  {latestMeasurement[field.key] ?? '—'} {field.unit}
                </p>
              </div>
            ))}
            {bmiInfo && (
              <div className="bg-muted/40 rounded-lg p-4">
                <p className="text-xs text-muted-foreground">IMC</p>
                <p className={`text-lg font-semibold ${bmiInfo.color}`}>{bmiInfo.bmi}</p>
                <p className="text-xs text-muted-foreground">{bmiInfo.category}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhuma medição registrada ainda. Utilize o formulário abaixo para adicionar a primeira medição.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-base font-semibold text-foreground">Registrar nova medição</h4>
          <Input
            type="date"
            label="Data da medição"
            value={form.recordedAt}
            onChange={(event) => handleChange('recordedAt', event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {measurementFields.map((field) => (
            <Input
              key={field.key}
              type="number"
              step="0.1"
              label={`${field.label} (${field.unit})`}
              value={form[field.key]}
              onChange={(event) => handleChange(field.key, event.target.value)}
            />
          ))}
        </div>

        <Input
          label="Notas"
          placeholder="Observações relevantes sobre esta medição"
          value={form.notes}
          onChange={(event) => handleChange('notes', event.target.value)}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar medição'}
          </Button>
        </div>
      </form>

      {measurements.length > 1 && (
        <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
          <h4 className="text-base font-semibold text-foreground mb-4">Histórico recente</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Peso</th>
                <th className="py-2 pr-4">% Gordura</th>
                <th className="py-2 pr-4">Massa magra</th>
                <th className="py-2 pr-4">Notas</th>
              </tr>
            </thead>
            <tbody>
              {measurements.slice(0, 5).map((record) => (
                <tr key={record.id} className="border-b border-border/70">
                  <td className="py-2 pr-4">
                    {new Date(record.recordedAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-2 pr-4">{record.weightKg ?? '—'} kg</td>
                  <td className="py-2 pr-4">{record.bodyFat ?? '—'} %</td>
                  <td className="py-2 pr-4">{record.muscleMass ?? '—'} kg</td>
                  <td className="py-2 pr-4 text-muted-foreground">{record.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BodyMeasurementsPanel;
