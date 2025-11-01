import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const certifications = [
    {
      id: 1,
      name: 'CREF',
      description: 'Conselho Regional de Educação Física',
      icon: 'Shield',
      verified: true
    },
    {
      id: 2,
      name: 'CONFEF',
      description: 'Conselho Federal de Educação Física',
      icon: 'Award',
      verified: true
    },
    {
      id: 3,
      name: 'SSL',
      description: 'Conexão Segura',
      icon: 'Lock',
      verified: true
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Carlos Mendes',
      role: 'Personal Trainer - São Paulo',
      text: 'Plataforma completa que revolucionou meu atendimento aos clientes.',
      rating: 5
    },
    {
      id: 2,
      name: 'Ana Beatriz',
      role: 'Personal Trainer - Rio de Janeiro',
      text: 'Interface intuitiva e recursos profissionais. Recomendo!',
      rating: 5
    }
  ];

  return (
    <div className="space-y-6">
      {/* Certifications */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
          <Icon name="ShieldCheck" size={16} className="mr-2 text-success" />
          Certificações e Segurança
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {certifications?.map((cert) => (
            <div
              key={cert?.id}
              className="flex items-center space-x-3 p-2 bg-success/5 border border-success/20 rounded-lg"
            >
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name={cert?.icon} size={14} className="text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {cert?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {cert?.description}
                </p>
              </div>
              {cert?.verified && (
                <Icon name="CheckCircle" size={16} className="text-success" />
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Testimonials */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
          <Icon name="MessageSquare" size={16} className="mr-2 text-primary" />
          Depoimentos de Profissionais
        </h3>
        <div className="space-y-3">
          {testimonials?.map((testimonial) => (
            <div
              key={testimonial?.id}
              className="p-3 bg-muted/30 border border-border rounded-lg"
            >
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(testimonial?.rating)]?.map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={12}
                    className="text-accent fill-current"
                  />
                ))}
              </div>
              <p className="text-xs text-foreground mb-2 italic">
                "{testimonial?.text}"
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={10} color="white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {testimonial?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial?.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Security Notice */}
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={14} className="text-primary mt-0.5" />
          <div>
            <p className="text-xs font-medium text-primary mb-1">
              Seus dados estão protegidos
            </p>
            <p className="text-xs text-muted-foreground">
              Utilizamos criptografia de ponta e seguimos as normas da LGPD para garantir a segurança das suas informações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;