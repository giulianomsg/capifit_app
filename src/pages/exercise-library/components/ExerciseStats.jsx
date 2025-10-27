import React from 'react';
import Icon from '../../../components/AppIcon';

const ExerciseStats = ({ totalExercises, filteredCount, favoriteCount }) => {
  const stats = [
    {
      title: 'Total de Exercícios',
      value: totalExercises,
      icon: 'Dumbbell',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Exercícios Filtrados',
      value: filteredCount,
      icon: 'Filter',
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Favoritos',
      value: favoriteCount,
      icon: 'Heart',
      color: 'text-red-600 bg-red-100'
    },
    {
      title: 'Categorias',
      value: 4,
      icon: 'Grid3X3',
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats?.map((stat, index) => (
        <div key={index} className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat?.title}</p>
              <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat?.color}`}>
              <Icon name={stat?.icon} size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExerciseStats;