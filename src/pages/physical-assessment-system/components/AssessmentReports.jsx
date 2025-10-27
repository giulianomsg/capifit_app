import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const AssessmentReports = ({ selectedClient }) => {
  const [selectedReport, setSelectedReport] = useState('complete');
  const [dateRange, setDateRange] = useState('last3months');

  const reportTypes = [
    { value: 'complete', label: 'Relatório Completo' },
    { value: 'progress', label: 'Relatório de Progresso' },
    { value: 'measurements', label: 'Apenas Medidas' },
    { value: 'fitness', label: 'Apenas Testes Físicos' }
  ];

  const dateRanges = [
    { value: 'last3months', label: 'Últimos 3 meses' },
    { value: 'last6months', label: 'Últimos 6 meses' },
    { value: 'lastyear', label: 'Último ano' },
    { value: 'all', label: 'Todos os registros' }
  ];

  // Mock report data
  const reportData = {
    client: {
      name: selectedClient?.name,
      email: selectedClient?.email,
      phone: selectedClient?.phone,
      startDate: '2023-11-15',
      age: 28,
      gender: 'Feminino',
      goal: 'Emagrecimento e tonificação muscular'
    },
    summary: {
      totalAssessments: 6,
      weightLoss: -4.3,
      bodyFatReduction: -4.3,
      muscleMassGain: 3.1,
      lastAssessment: '2024-03-15'
    },
    measurements: {
      initial: { weight: 78.5, bodyFat: 22.5, muscleMass: 45.2, waist: 85, hip: 98 },
      current: { weight: 74.2, bodyFat: 18.2, muscleMass: 48.3, waist: 78, hip: 95 },
      changes: { weight: -4.3, bodyFat: -4.3, muscleMass: 3.1, waist: -7, hip: -3 }
    },
    fitnessTests: [
      { name: 'Cooper Test', initial: 2400, current: 2820, unit: 'metros', improvement: '+17.5%' },
      { name: 'Flexões', initial: 25, current: 38, unit: 'repetições', improvement: '+52%' },
      { name: 'Prancha', initial: 45, current: 125, unit: 'segundos', improvement: '+178%' }
    ]
  };

  if (!selectedClient) {
    return (
      <div className="p-8 text-center">
        <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Selecione um cliente para gerar relatórios</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Relatórios - {selectedClient?.name}
          </h3>
          <p className="text-muted-foreground">
            Gere relatórios detalhados das avaliações
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" iconName="Mail" iconPosition="left">
            Enviar por Email
          </Button>
          <Button iconName="Download" iconPosition="left">
            Baixar PDF
          </Button>
        </div>
      </div>
      {/* Report Configuration */}
      <div className="bg-muted/30 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">
          Configurações do Relatório
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo de Relatório"
            value={selectedReport}
            onValueChange={setSelectedReport}
            options={reportTypes}
          />
          <Select
            label="Período"
            value={dateRange}
            onValueChange={setDateRange}
            options={dateRanges}
          />
        </div>
      </div>
      {/* Report Preview */}
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center border-b border-border pb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🦫</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">CapiFit</h1>
                <p className="text-muted-foreground">Relatório de Avaliação Física</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Gerado em: {new Date()?.toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Client Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Icon name="User" size={20} className="mr-2 text-primary" />
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div><strong>Nome:</strong> {reportData?.client?.name}</div>
                <div><strong>Email:</strong> {reportData?.client?.email}</div>
                <div><strong>Telefone:</strong> {reportData?.client?.phone}</div>
              </div>
              <div className="space-y-2">
                <div><strong>Idade:</strong> {reportData?.client?.age} anos</div>
                <div><strong>Gênero:</strong> {reportData?.client?.gender}</div>
                <div><strong>Início:</strong> {new Date(reportData?.client?.startDate)?.toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="md:col-span-2">
                <div><strong>Objetivo:</strong> {reportData?.client?.goal}</div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Icon name="BarChart3" size={20} className="mr-2 text-primary" />
              Resumo Geral
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{reportData?.summary?.totalAssessments}</div>
                <div className="text-sm text-muted-foreground">Avaliações</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{reportData?.summary?.weightLoss} kg</div>
                <div className="text-sm text-muted-foreground">Peso Perdido</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{reportData?.summary?.bodyFatReduction}%</div>
                <div className="text-sm text-muted-foreground">Gordura Reduzida</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">+{reportData?.summary?.muscleMassGain} kg</div>
                <div className="text-sm text-muted-foreground">Massa Muscular</div>
              </div>
            </div>
          </div>

          {/* Measurements Comparison */}
          {(selectedReport === 'complete' || selectedReport === 'measurements') && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Ruler" size={20} className="mr-2 text-primary" />
                Comparativo de Medidas
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-foreground">Medida</th>
                      <th className="text-center p-2 text-foreground">Inicial</th>
                      <th className="text-center p-2 text-foreground">Atual</th>
                      <th className="text-center p-2 text-foreground">Mudança</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData?.measurements?.initial)?.map(([key, value]) => (
                      <tr key={key} className="border-b border-border/50">
                        <td className="p-2 font-medium text-foreground capitalize">
                          {key === 'weight' ? 'Peso (kg)' :
                           key === 'bodyFat' ? 'Gordura Corporal (%)' :
                           key === 'muscleMass' ? 'Massa Muscular (kg)' :
                           key === 'waist' ? 'Cintura (cm)' :
                           key === 'hip' ? 'Quadril (cm)' : key}
                        </td>
                        <td className="p-2 text-center text-muted-foreground">{value}</td>
                        <td className="p-2 text-center text-foreground">{reportData?.measurements?.current?.[key]}</td>
                        <td className={`p-2 text-center font-semibold ${
                          reportData?.measurements?.changes?.[key] > 0 ? 'text-green-600' : 
                          reportData?.measurements?.changes?.[key] < 0 ? 'text-red-600': 'text-muted-foreground'
                        }`}>
                          {reportData?.measurements?.changes?.[key] > 0 ? '+' : ''}{reportData?.measurements?.changes?.[key]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fitness Tests */}
          {(selectedReport === 'complete' || selectedReport === 'fitness') && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Activity" size={20} className="mr-2 text-primary" />
                Evolução dos Testes Físicos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportData?.fitnessTests?.map((test, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">{test?.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inicial:</span>
                        <span className="text-foreground">{test?.initial} {test?.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Atual:</span>
                        <span className="text-foreground">{test?.current} {test?.unit}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-muted-foreground">Melhoria:</span>
                        <span className="text-green-600">{test?.improvement}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observations and Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Icon name="FileText" size={20} className="mr-2 text-primary" />
              Observações e Recomendações
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
              <div>
                <strong className="text-foreground">Progresso Geral:</strong>
                <p className="text-muted-foreground mt-1">
                  Excelente evolução em todos os parâmetros avaliados. A cliente demonstrou 
                  comprometimento e consistência nos treinos, resultando em significativa 
                  melhoria da composição corporal e capacidade física.
                </p>
              </div>
              <div>
                <strong className="text-foreground">Próximos Objetivos:</strong>
                <p className="text-muted-foreground mt-1">
                  Continuar o foco no ganho de massa muscular e melhoria da resistência 
                  cardiovascular. Ajustar o plano nutricional para a nova composição corporal.
                </p>
              </div>
              <div>
                <strong className="text-foreground">Próxima Avaliação:</strong>
                <p className="text-muted-foreground mt-1">
                  Recomenda-se nova avaliação em 30 dias para acompanhar o progresso 
                  e fazer os ajustes necessários no programa de treinamento.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-border text-sm text-muted-foreground">
            <p>Este relatório foi gerado automaticamente pelo sistema CapiFit</p>
            <p>Personal Trainer: João Silva | CREF: 123456-G/SP</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentReports;