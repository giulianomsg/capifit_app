import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import AssessmentStatsCards from './components/AssessmentStatsCards';
import ClientAssessmentList from './components/ClientAssessmentList';
import BodyMeasurementsPanel from './components/BodyMeasurementsPanel';
import ProgressPhotosGallery from './components/ProgressPhotosGallery';
import EvolutionCharts from './components/EvolutionCharts';
import ExamUploadPanel from './components/ExamUploadPanel';
import AssessmentScheduler from './components/AssessmentScheduler';
import AssessmentHistoryModal from './components/AssessmentHistoryModal';
import {
  createAssessment,
  createMeasurement,
  getAssessmentOverview,
  listAssessmentAttachments,
  listAssessmentClients,
  listAssessmentHistory,
  listMeasurements,
  listProgressPhotos,
  uploadAssessmentAttachment,
  uploadProgressPhoto,
} from '../../services/assessmentService';

const statusFilterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'scheduled', label: 'Agendados' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'delayed', label: 'Atrasados' },
];

const PhysicalAssessmentSystem = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const overviewQuery = useQuery({ queryKey: ['assessments', 'overview'], queryFn: () => getAssessmentOverview() });

  const clientsQuery = useQuery({
    queryKey: ['assessments', 'clients', searchTerm, statusFilter],
    queryFn: () =>
      listAssessmentClients({
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
  });

  const measurementsQuery = useQuery({
    queryKey: ['assessments', 'measurements', selectedClient?.clientId],
    queryFn: () => listMeasurements(selectedClient?.clientId),
    enabled: Boolean(selectedClient?.clientId),
  });

  const photosQuery = useQuery({
    queryKey: ['assessments', 'photos', selectedClient?.clientId],
    queryFn: () => listProgressPhotos(selectedClient?.clientId),
    enabled: Boolean(selectedClient?.clientId),
  });

  const attachmentsQuery = useQuery({
    queryKey: ['assessments', 'attachments', selectedClient?.clientId],
    queryFn: () => listAssessmentAttachments(selectedClient?.clientId),
    enabled: Boolean(selectedClient?.clientId),
  });

  const historyQuery = useQuery({
    queryKey: ['assessments', 'history'],
    queryFn: () => listAssessmentHistory(),
    enabled: showHistoryModal,
  });

  const createAssessmentMutation = useMutation({
    mutationFn: (payload) => createAssessment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['assessments', 'overview'] });
    },
  });

  const createMeasurementMutation = useMutation({
    mutationFn: (payload) => createMeasurement(selectedClient?.clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', 'measurements', selectedClient?.clientId] });
      queryClient.invalidateQueries({ queryKey: ['assessments', 'clients'] });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (file) => uploadProgressPhoto(selectedClient?.clientId, { file }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', 'photos', selectedClient?.clientId] });
    },
  });

  const uploadExamMutation = useMutation({
    mutationFn: ({ file, examType }) =>
      uploadAssessmentAttachment(selectedClient?.clientId, { file, examType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', 'attachments', selectedClient?.clientId] });
    },
  });

  const statsCards = useMemo(() => {
    const overview = overviewQuery.data ?? {};
    return [
      {
        title: 'Avaliações pendentes',
        value: overview.pendingAssessments ?? 0,
        subtitle: 'Aguardando execução',
        icon: 'Clock',
        color: 'bg-amber-500',
      },
      {
        title: 'Agendadas para hoje',
        value: overview.pendingToday ?? 0,
        subtitle: 'Inclui avaliações atrasadas',
        icon: 'Calendar',
        color: 'bg-blue-500',
      },
      {
        title: 'Concluídas no mês',
        value: overview.completedThisMonth ?? 0,
        subtitle: 'Resultados atualizados',
        icon: 'CheckCircle',
        color: 'bg-green-500',
      },
      {
        title: 'Clientes avaliados',
        value: overview.assessedClients ?? 0,
        subtitle: `${overview.totalClients ?? 0} ativos`,
        icon: 'Users',
        color: 'bg-purple-500',
      },
    ];
  }, [overviewQuery.data]);

  const handleOpenScheduler = () => {
    setShowScheduler(true);
  };

  const handleScheduleAssessment = async ({ clientId, type, scheduledFor, notes }) => {
    await createAssessmentMutation.mutateAsync({
      clientId,
      type,
      scheduledFor,
      notes,
      templateId: templatesQuery.data?.[0]?.id,
    });
  };

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Avaliações físicas</h1>
          <p className="text-muted-foreground">
            Gerencie avaliações, medições corporais e anexos clínicos com dados atualizados do seus clientes.
          </p>
        </div>
        <div className="flex gap-3">
          <Button iconName="Clock" variant="outline" onClick={() => setShowHistoryModal(true)}>
            Ver histórico
          </Button>
          <Button iconName="Plus" onClick={() => handleOpenScheduler()}>
            Agendar avaliação
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <AssessmentStatsCards key={card.title} {...card} />
        ))}
      </section>

      <section className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <Button variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>
              Todos
            </Button>
            <Button variant={statusFilter === 'scheduled' ? 'default' : 'outline'} onClick={() => setStatusFilter('scheduled')}>
              Agendados
            </Button>
            <Button variant={statusFilter === 'completed' ? 'default' : 'outline'} onClick={() => setStatusFilter('completed')}>
              Concluídos
            </Button>
            <Button variant={statusFilter === 'delayed' ? 'default' : 'outline'} onClick={() => setStatusFilter('delayed')}>
              Atrasados
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Buscar por nome ou e-mail"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Select value={statusFilter} onChange={setStatusFilter} options={statusFilterOptions} className="sm:w-52" />
          </div>
        </div>

        <ClientAssessmentList
          clients={clientsQuery.data ?? []}
          onClientSelect={(client) => {
            setSelectedClient(client);
          }}
          onSchedule={() => handleOpenScheduler()}
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BodyMeasurementsPanel
          clients={clientsQuery.data ?? []}
          selectedClient={selectedClient}
          measurements={measurementsQuery.data ?? []}
          onClientSelect={(client) => setSelectedClient(client)}
          onSaveMeasurement={(payload) => createMeasurementMutation.mutateAsync(payload)}
          saving={createMeasurementMutation.isPending}
        />
        <EvolutionCharts
          selectedClient={selectedClient}
          measurements={measurementsQuery.data ?? []}
          onClientSelect={(client) => setSelectedClient(client)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ProgressPhotosGallery
          selectedClient={selectedClient}
          photos={photosQuery.data ?? []}
          onUpload={(file) => uploadPhotoMutation.mutateAsync(file)}
          uploading={uploadPhotoMutation.isPending}
        />
        <ExamUploadPanel
          selectedClient={selectedClient}
          attachments={attachmentsQuery.data ?? []}
          onUpload={(payload) => uploadExamMutation.mutateAsync(payload)}
          uploading={uploadExamMutation.isPending}
        />
      </div>

      {showScheduler && (
        <AssessmentScheduler
          isOpen={showScheduler}
          onClose={() => setShowScheduler(false)}
          clients={clientsQuery.data ?? []}
          onSchedule={handleScheduleAssessment}
          loading={createAssessmentMutation.isPending}
        />
      )}

      {showHistoryModal && (
        <AssessmentHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          history={historyQuery.data ?? []}
          clients={clientsQuery.data ?? []}
        />
      )}
    </div>
  );
};

export default PhysicalAssessmentSystem;
