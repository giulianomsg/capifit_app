import React from 'react';

import Icon from '../../../components/AppIcon';

const ExerciseStats = ({ stats, total }) => {
  const safeStats = stats ?? {
    byDifficulty: { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 },
    byCategory: {},
  };

  const totalExercises = Number.isFinite(total) ? total : 0;
  const difficultyDisplay = `${safeStats.byDifficulty.BEGINNER ?? 0} / ${safeStats.byDifficulty.INTERMEDIATE ?? 0} / ${
    safeStats.byDifficulty.ADVANCED ?? 0
  }`;

  const cards = [
    {
      title: 'Total de exercícios',
      value: totalExercises,
      icon: 'Dumbbell',
    },
    {
      title: 'Por dificuldade',
      value: difficultyDisplay,
      icon: 'Activity',
      description: 'Ini / Inter / Avanç.',
    },
    {
      title: 'Categorias cadastradas',
      value: Object.keys(safeStats.byCategory ?? {}).length,
      icon: 'Layers',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div key={card.title} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon name={card.icon} size={18} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{card.title}</p>
            <p className="text-lg font-semibold text-foreground">{card.value}</p>
            {card.description && <p className="text-xs text-muted-foreground">{card.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExerciseStats;
