import React, { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useRealtime } from '../../../contexts/RealtimeContext';
import { getWorkout, listWorkouts } from '../../../services/workoutService';

const WorkoutTemplates = ({ onApplyTemplate }) => {
  const queryClient = useQueryClient();
  const { socket } = useRealtime();
  const { data, isLoading } = useQuery({
    queryKey: ['workouts', 'templates'],
    queryFn: () => listWorkouts({ template: true, perPage: 20 }),
  });

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleSync = () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', 'templates'] });
    };

    const events = ['workout:created', 'workout:updated', 'workout:deleted'];
    events.forEach((event) => socket.on(event, handleSync));

    return () => {
      events.forEach((event) => socket.off(event, handleSync));
    };
  }, [socket, queryClient]);

  const applyTemplateMutation = useMutation({
    mutationFn: (workoutId) => getWorkout(workoutId),
    onSuccess: (workout) => {
      onApplyTemplate(workout);
    },
  });

  const templates = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 flex items-center justify-center text-muted-foreground">
        <span className="flex items-center gap-2 text-sm">
          <Icon name="Loader2" className="animate-spin" /> Carregando templates...
        </span>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center space-y-3">
        <Icon name="Bookmark" size={32} className="mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nenhum template disponível. Salve um treino como template para reutilizá-lo depois.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Templates salvos</h2>
        <p className="text-sm text-muted-foreground">
          Aplique modelos prontos e personalize antes de enviar ao aluno.
        </p>
      </div>

      <div className="divide-y divide-border">
        {templates.map((template) => (
          <div key={template.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">{template.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description || 'Template sem descrição.'}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Icon name="Dumbbell" size={14} /> {template.blocks.reduce((acc, block) => acc + block.exercises.length, 0)} exercícios
                </span>
                {template.estimatedDuration && (
                  <span className="flex items-center gap-1">
                    <Icon name="Clock" size={14} /> {template.estimatedDuration} min
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyTemplateMutation.mutate(template.id)}
                disabled={applyTemplateMutation.isPending}
              >
                {applyTemplateMutation.isPending ? 'Carregando...' : 'Usar template'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutTemplates;
