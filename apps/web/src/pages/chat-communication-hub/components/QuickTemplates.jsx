import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const QuickTemplates = ({ onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('motivation');
  const [searchTerm, setSearchTerm] = useState('');

  const templateCategories = [
    { id: 'motivation', label: 'Motivação', icon: 'Zap' },
    { id: 'workout', label: 'Treinos', icon: 'Dumbbell' },
    { id: 'nutrition', label: 'Nutrição', icon: 'Apple' },
    { id: 'schedule', label: 'Agendamento', icon: 'Calendar' },
    { id: 'support', label: 'Suporte', icon: 'HelpCircle' }
  ];

  const templates = {
    motivation: [
      {
        id: 1,
        title: 'Parabéns pelo treino!',
        content: 'Parabéns por completar mais um treino! 💪 Cada repetição te deixa mais forte. Continue assim!',
        category: 'motivation'
      },
      {
        id: 2,
        title: 'Motivação matinal',
        content: 'Bom dia! 🌅 Lembre-se: o único treino ruim é aquele que você não faz. Vamos juntos alcançar seus objetivos hoje!',
        category: 'motivation'
      },
      {
        id: 3,
        title: 'Superação de limites',
        content: 'Você já chegou até aqui, isso mostra sua determinação! 🔥 Não desista agora, seus objetivos estão cada vez mais próximos.',
        category: 'motivation'
      }
    ],
    workout: [
      {
        id: 4,
        title: 'Instruções de aquecimento',
        content: 'Lembre-se de fazer um aquecimento de 10 minutos antes de começar o treino. Isso ajuda a prevenir lesões e melhora seu desempenho! 🏃‍♀️',
        category: 'workout'
      },
      {
        id: 5,
        title: 'Dica de execução',
        content: 'Foque na qualidade do movimento, não na quantidade. É melhor fazer menos repetições com boa forma do que muitas com execução ruim. 🎯',
        category: 'workout'
      },
      {
        id: 6,
        title: 'Descanso entre séries',
        content: 'Respeite o tempo de descanso entre as séries (60-90s). Use esse tempo para se hidratar e se preparar mentalmente para a próxima série. ⏰',
        category: 'workout'
      }
    ],
    nutrition: [
      {
        id: 7,
        title: 'Hidratação',
        content: 'Não se esqueça de beber água! 💧 Mantenha-se bem hidratado ao longo do dia. Meta: pelo menos 2 litros de água.',
        category: 'nutrition'
      },
      {
        id: 8,
        title: 'Pré-treino',
        content: 'Faça uma refeição leve 1-2 horas antes do treino. Uma fruta com aveia ou iogurte são ótimas opções para ter energia! 🍌',
        category: 'nutrition'
      },
      {
        id: 9,
        title: 'Pós-treino',
        content: 'Após o treino, consuma proteína e carboidratos em até 2 horas. Isso ajuda na recuperação muscular! 🥗',
        category: 'nutrition'
      }
    ],
    schedule: [
      {
        id: 10,
        title: 'Confirmação de horário',
        content: 'Olá! Venho confirmar nosso treino de amanhã às [HORÁRIO]. Por favor, confirme sua presença. 📅',
        category: 'schedule'
      },
      {
        id: 11,
        title: 'Reagendamento',
        content: 'Precisamos reagendar nossa sessão. Que tal [DIA] às [HORÁRIO]? Me avise se fica bom para você. 🔄',
        category: 'schedule'
      },
      {
        id: 12,
        title: 'Lembrete de treino',
        content: 'Lembrete: treino hoje às [HORÁRIO]! Não se esqueça de trazer uma garrafinha de água e uma toalha. Te vejo lá! ⏰',
        category: 'schedule'
      }
    ],
    support: [
      {
        id: 13,
        title: 'Dificuldade com exercício',
        content: 'Entendo sua dificuldade com esse exercício. Vamos adaptar o movimento para que fique mais confortável. O importante é manter a consistência! 🤝',
        category: 'support'
      },
      {
        id: 14,
        title: 'Desmotivação',
        content: 'É normal passar por momentos de desmotivação. Lembre-se do porquê você começou e de todo progresso que já fez. Estou aqui para te apoiar! 💪',
        category: 'support'
      },
      {
        id: 15,
        title: 'Dúvida técnica',
        content: 'Ótima pergunta! A técnica correta é fundamental. Vou te enviar um vídeo explicativo para esclarecer suas dúvidas. 📹',
        category: 'support'
      }
    ]
  };

  const currentTemplates = templates?.[selectedCategory] || [];
  
  const filteredTemplates = currentTemplates?.filter(template =>
    template?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    template?.content?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Templates de Mensagens</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Escolha uma mensagem pré-definida para enviar rapidamente
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-48 border-r border-border p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Categorias</h4>
            <div className="space-y-1">
              {templateCategories?.map(category => (
                <button
                  key={category?.id}
                  onClick={() => setSelectedCategory(category?.id)}
                  className={`
                    w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors
                    ${selectedCategory === category?.id
                      ? 'bg-primary/10 text-primary border border-primary/20' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }
                  `}
                >
                  <Icon name={category?.icon} size={16} />
                  <span className="text-sm">{category?.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Templates Content */}
          <div className="flex-1 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-border">
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                leftIcon="Search"
              />
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTemplates?.map(template => (
                  <div
                    key={template?.id}
                    className="border border-border rounded-lg p-4 hover:border-primary/50 cursor-pointer transition-colors"
                    onClick={() => onSelectTemplate?.(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-foreground text-sm">
                        {template?.title}
                      </h5>
                      <Icon name="MessageSquare" size={16} className="text-muted-foreground" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {template?.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                        {templateCategories?.find(c => c?.id === template?.category)?.label}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Send"
                        onClick={(e) => {
                          e?.stopPropagation();
                          onSelectTemplate?.(template);
                        }}
                      >
                        Usar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates?.length === 0 && (
                <div className="text-center py-8">
                  <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum template encontrado
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>💡 Dica: Personalize os templates com o nome do cliente para um toque mais pessoal</p>
            <Button variant="outline" size="sm" iconName="Plus">
              Criar Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickTemplates;