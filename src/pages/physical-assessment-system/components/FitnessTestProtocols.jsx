import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';


const FitnessTestProtocols = ({ selectedClient }) => {
  const [selectedCategory, setSelectedCategory] = useState('cardio');
  const [testResults, setTestResults] = useState({});

  // Test categories and protocols
  const testCategories = [
    { id: 'cardio', label: 'Cardiovascular', icon: 'Heart' },
    { id: 'strength', label: 'Força', icon: 'Zap' },
    { id: 'flexibility', label: 'Flexibilidade', icon: 'Maximize' },
    { id: 'endurance', label: 'Resistência', icon: 'Clock' }
  ];

  // Test protocols by category
  const testProtocols = {
    cardio: [
      {
        id: 'cooper',
        name: 'Teste de Cooper (12 min)',
        description: 'Corrida/caminhada por 12 minutos - medir distância',
        unit: 'metros',
        scoringRanges: {
          excellent: { min: 2800, label: 'Excelente' },
          good: { min: 2400, max: 2799, label: 'Bom' },
          average: { min: 2000, max: 2399, label: 'Regular' },
          poor: { max: 1999, label: 'Fraco' }
        }
      },
      {
        id: 'step',
        name: 'Step Test (3 min)',
        description: 'Subir e descer step por 3 minutos - medir FC de recuperação',
        unit: 'bpm',
        scoringRanges: {
          excellent: { max: 85, label: 'Excelente' },
          good: { min: 86, max: 95, label: 'Bom' },
          average: { min: 96, max: 110, label: 'Regular' },
          poor: { min: 111, label: 'Fraco' }
        }
      }
    ],
    strength: [
      {
        id: 'pushup',
        name: 'Flexões de Braço',
        description: 'Máximo de flexões realizadas sem parar',
        unit: 'repetições',
        scoringRanges: {
          excellent: { min: 40, label: 'Excelente' },
          good: { min: 30, max: 39, label: 'Bom' },
          average: { min: 20, max: 29, label: 'Regular' },
          poor: { max: 19, label: 'Fraco' }
        }
      },
      {
        id: 'squat',
        name: 'Agachamentos',
        description: 'Máximo de agachamentos em 1 minuto',
        unit: 'repetições',
        scoringRanges: {
          excellent: { min: 50, label: 'Excelente' },
          good: { min: 40, max: 49, label: 'Bom' },
          average: { min: 30, max: 39, label: 'Regular' },
          poor: { max: 29, label: 'Fraco' }
        }
      }
    ],
    flexibility: [
      {
        id: 'sitreach',
        name: 'Sentar e Alcançar',
        description: 'Flexibilidade dos isquiotibiais e lombar',
        unit: 'cm',
        scoringRanges: {
          excellent: { min: 30, label: 'Excelente' },
          good: { min: 25, max: 29, label: 'Bom' },
          average: { min: 20, max: 24, label: 'Regular' },
          poor: { max: 19, label: 'Fraco' }
        }
      },
      {
        id: 'shoulder',
        name: 'Flexibilidade de Ombros',
        description: 'Alcançar com as mãos atrás das costas',
        unit: 'cm',
        scoringRanges: {
          excellent: { min: 0, label: 'Excelente (toca dedos)' },
          good: { min: -5, max: -1, label: 'Bom' },
          average: { min: -10, max: -6, label: 'Regular' },
          poor: { max: -11, label: 'Fraco' }
        }
      }
    ],
    endurance: [
      {
        id: 'plank',
        name: 'Prancha Abdominal',
        description: 'Tempo máximo mantendo a posição de prancha',
        unit: 'segundos',
        scoringRanges: {
          excellent: { min: 120, label: 'Excelente' },
          good: { min: 90, max: 119, label: 'Bom' },
          average: { min: 60, max: 89, label: 'Regular' },
          poor: { max: 59, label: 'Fraco' }
        }
      },
      {
        id: 'wallsit',
        name: 'Wall Sit',
        description: 'Tempo máximo na posição de agachamento na parede',
        unit: 'segundos',
        scoringRanges: {
          excellent: { min: 90, label: 'Excelente' },
          good: { min: 60, max: 89, label: 'Bom' },
          average: { min: 30, max: 59, label: 'Regular' },
          poor: { max: 29, label: 'Fraco' }
        }
      }
    ]
  };

  const currentTests = testProtocols?.[selectedCategory] || [];

  // Historical test results (mock data)
  const historicalResults = {
    cooper: [
      { date: '2024-01-15', value: 2650, score: 'Bom' },
      { date: '2024-02-15', value: 2750, score: 'Bom' },
      { date: '2024-03-15', value: 2820, score: 'Excelente' }
    ],
    pushup: [
      { date: '2024-01-15', value: 25, score: 'Regular' },
      { date: '2024-02-15', value: 32, score: 'Bom' },
      { date: '2024-03-15', value: 38, score: 'Bom' }
    ]
  };

  const calculateScore = (testId, value) => {
    const test = Object.values(testProtocols)?.flat()?.find(t => t?.id === testId);
    if (!test || !value) return null;

    const { scoringRanges } = test;
    const numValue = parseFloat(value);

    if (scoringRanges?.excellent?.min && numValue >= scoringRanges?.excellent?.min) {
      return { level: 'excellent', label: scoringRanges?.excellent?.label };
    }
    if (scoringRanges?.excellent?.max && numValue <= scoringRanges?.excellent?.max) {
      return { level: 'excellent', label: scoringRanges?.excellent?.label };
    }
    if (scoringRanges?.good?.min && scoringRanges?.good?.max && 
        numValue >= scoringRanges?.good?.min && numValue <= scoringRanges?.good?.max) {
      return { level: 'good', label: scoringRanges?.good?.label };
    }
    if (scoringRanges?.average?.min && scoringRanges?.average?.max && 
        numValue >= scoringRanges?.average?.min && numValue <= scoringRanges?.average?.max) {
      return { level: 'average', label: scoringRanges?.average?.label };
    }
    return { level: 'poor', label: scoringRanges?.poor?.label };
  };

  const getScoreColor = (level) => {
    switch (level) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  if (!selectedClient) {
    return (
      <div className="p-8 text-center">
        <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Selecione um cliente para realizar testes físicos</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Testes Físicos - {selectedClient?.name}
          </h3>
          <p className="text-muted-foreground">
            Avalie capacidades físicas com protocolos padronizados
          </p>
        </div>
        
        <Button iconName="FileText" iconPosition="left">
          Gerar Relatório
        </Button>
      </div>
      {/* Category Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {testCategories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => setSelectedCategory(category?.id)}
            className={`
              p-4 rounded-lg border text-center transition-colors
              ${selectedCategory === category?.id
                ? 'border-primary bg-primary/10 text-primary' :'border-border hover:border-primary/50'
              }
            `}
          >
            <Icon name={category?.icon} size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">{category?.label}</span>
          </button>
        ))}
      </div>
      {/* Test Protocols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentTests?.map((test) => {
          const currentValue = testResults?.[test?.id] || '';
          const score = calculateScore(test?.id, currentValue);
          const history = historicalResults?.[test?.id] || [];

          return (
            <div key={test?.id} className="bg-muted/30 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-foreground">{test?.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {test?.description}
                  </p>
                </div>
                <Icon name="Target" size={20} className="text-primary" />
              </div>
              {/* Input for test result */}
              <div className="mb-4">
                <Input
                  label={`Resultado (${test?.unit})`}
                  type="number"
                  value={currentValue}
                  onChange={(e) => setTestResults(prev => ({
                    ...prev,
                    [test?.id]: e?.target?.value
                  }))}
                  placeholder={`Digite o resultado em ${test?.unit}`}
                />
                
                {score && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Classificação:</span>
                    <span className={`text-sm font-semibold ${getScoreColor(score?.level)}`}>
                      {score?.label}
                    </span>
                  </div>
                )}
              </div>
              {/* Scoring ranges */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-foreground mb-2">Classificação:</h5>
                <div className="space-y-1 text-xs">
                  {Object.entries(test?.scoringRanges)?.map(([level, range]) => (
                    <div key={level} className={`flex justify-between ${getScoreColor(level)}`}>
                      <span>{range?.label}</span>
                      <span>
                        {range?.min && range?.max ? `${range?.min}-${range?.max}` :
                         range?.min ? `>${range?.min}` :
                         range?.max ? `<${range?.max}` : ''}
                        {' '}{test?.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Historical results */}
              {history?.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-2">Histórico:</h5>
                  <div className="space-y-2">
                    {history?.slice(-3)?.map((result, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {new Date(result?.date)?.toLocaleDateString('pt-BR')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-foreground">{result?.value} {test?.unit}</span>
                          <span className={`text-xs ${getScoreColor(result?.score?.toLowerCase())}`}>
                            {result?.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => console.log('Saving test results:', testResults)}
          iconName="Save"
          iconPosition="left"
        >
          Salvar Resultados
        </Button>
      </div>
    </div>
  );
};

export default FitnessTestProtocols;