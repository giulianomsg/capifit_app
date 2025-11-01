import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SessionNotes = ({ notes, onNotesChange }) => {
  const [currentNotes, setCurrentNotes] = useState(notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNotesChange = (value) => {
    setCurrentNotes(value);
    // Auto-save debounced
    if (onNotesChange) {
      onNotesChange(value);
    }
  };

  const addQuickNote = (note) => {
    const timestamp = new Date()?.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const newNote = `[${timestamp}] ${note}`;
    const updatedNotes = currentNotes ? `${currentNotes}\n${newNote}` : newNote;
    handleNotesChange(updatedNotes);
  };

  const quickNotes = [
    { text: 'Execução perfeita', icon: 'CheckCircle' },
    { text: 'Dificuldade na técnica', icon: 'AlertTriangle' },
    { text: 'Peso adequado', icon: 'Target' },
    { text: 'Aumentar carga próxima vez', icon: 'TrendingUp' },
    { text: 'Reduzir peso', icon: 'TrendingDown' },
    { text: 'Cliente motivado', icon: 'Smile' },
    { text: 'Fadiga muscular', icon: 'Zap' },
    { text: 'Boa forma física hoje', icon: 'Heart' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground flex items-center">
          <Icon name="FileText" size={18} className="mr-2" />
          Observações da Sessão
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
        />
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Quick Notes */}
          <div>
            <h5 className="text-sm font-medium text-foreground mb-3">Anotações Rápidas</h5>
            <div className="grid grid-cols-2 gap-2">
              {quickNotes?.map((note, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => addQuickNote(note?.text)}
                  className="justify-start text-xs"
                  iconName={note?.icon}
                  iconPosition="left"
                >
                  {note?.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Notes Textarea */}
          <div>
            <h5 className="text-sm font-medium text-foreground mb-2">Notas Personalizadas</h5>
            <textarea
              value={currentNotes}
              onChange={(e) => handleNotesChange(e?.target?.value)}
              placeholder="Digite suas observações sobre a sessão, técnica do cliente, progressos notados, ajustes necessários..."
              className="w-full h-24 px-3 py-2 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
              disabled={isSaving}
            />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{currentNotes?.length || 0} caracteres</span>
              {isSaving && (
                <span className="flex items-center">
                  <Icon name="Loader" size={12} className="mr-1 animate-spin" />
                  Salvando...
                </span>
              )}
            </div>
          </div>

          {/* Voice Note Option (Future Feature) */}
          <div className="pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              iconName="Mic"
              iconPosition="left"
              disabled
            >
              Gravação de Voz (Em breve)
            </Button>
          </div>
        </div>
      )}

      {/* Collapsed View */}
      {!isExpanded && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuickNote('Execução perfeita')}
              iconName="CheckCircle"
              iconPosition="left"
            >
              Boa execução
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuickNote('Dificuldade na técnica')}
              iconName="AlertTriangle"
              iconPosition="left"
            >
              Dificuldade
            </Button>
          </div>
          
          {currentNotes && (
            <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground max-h-16 overflow-y-auto">
              {currentNotes?.length > 100 ? 
                `${currentNotes?.substring(0, 100)}...` : 
                currentNotes
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionNotes;