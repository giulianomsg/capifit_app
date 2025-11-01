import React from 'react';

import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const difficultyBadge = {
  BEGINNER: 'bg-emerald-100 text-emerald-700',
  INTERMEDIATE: 'bg-amber-100 text-amber-700',
  ADVANCED: 'bg-rose-100 text-rose-700',
};

const ExerciseDetailsModal = ({ exercise, open, onClose }) => {
  if (!exercise || !open) {
    return null;
  }

  const imageSource = exercise.imageUrl || '/assets/images/no_image.png';
  const difficultyLabel =
    exercise.difficulty === 'BEGINNER'
      ? 'Iniciante'
      : exercise.difficulty === 'INTERMEDIATE'
      ? 'Intermediário'
      : 'Avançado';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg max-w-3xl w-full mx-4 shadow-xl">
        <header className="flex items-start justify-between gap-4 p-6 border-b border-border">
          <div className="flex gap-4">
            <Image
              src={imageSource}
              alt={exercise.name}
              className="w-20 h-20 rounded-lg object-cover border border-border"
            />
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{exercise.name}</h2>
              <p className="text-sm text-muted-foreground">
                {exercise.category} • {exercise.primaryMuscle}
              </p>
              <span
                className={`mt-2 inline-block text-xs font-medium px-2 py-1 rounded-full ${difficultyBadge[exercise.difficulty]}`}
              >
                {difficultyLabel}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar detalhes do exercício">
            <Icon name="X" size={18} />
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {exercise.videoUrl ? (
                <video controls className="w-full h-full object-cover" poster={imageSource}>
                  <source src={exercise.videoUrl} type="video/mp4" />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <Icon name="Play" size={32} className="mx-auto mb-2" />
                  Vídeo não disponível
                </div>
              )}
            </div>
            <div className="bg-muted/40 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="Flame" size={16} className="text-primary" />
                <span>
                  Calorias por série: {exercise.caloriesPerSet ? `${exercise.caloriesPerSet} kcal` : 'n/d'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Tool" size={16} className="text-primary" />
                <span>Equipamento: {exercise.equipment || 'Peso corporal'}</span>
              </div>
              {exercise.secondaryMuscle && (
                <div className="flex items-center gap-2">
                  <Icon name="Users" size={16} className="text-primary" />
                  <span>Suporte: {exercise.secondaryMuscle}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed">
            {exercise.description && (
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">Descrição</h3>
                <p className="text-muted-foreground">{exercise.description}</p>
              </section>
            )}
            {exercise.instructions && (
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">Instruções</h3>
                <p className="text-muted-foreground whitespace-pre-line">{exercise.instructions}</p>
              </section>
            )}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">Informações adicionais</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={16} className="text-primary mt-1" />
                  <span>Categoria: {exercise.category}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Dumbbell" size={16} className="text-primary mt-1" />
                  <span>Grupo principal: {exercise.primaryMuscle}</span>
                </li>
                {exercise.createdBy && (
                  <li className="flex items-start gap-2">
                    <Icon name="User" size={16} className="text-primary mt-1" />
                    <span>Criado por {exercise.createdBy.name}</span>
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>

        <footer className="p-4 border-t border-border flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ExerciseDetailsModal;
