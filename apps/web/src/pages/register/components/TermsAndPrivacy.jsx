import React from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const TermsAndPrivacy = ({ 
  acceptedTerms, 
  acceptedPrivacy, 
  acceptedMarketing,
  onTermsChange, 
  onPrivacyChange, 
  onMarketingChange,
  errors = {},
  className = "" 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Icon name="FileText" size={20} className="text-primary mr-2" />
          <h4 className="font-semibold text-foreground">Termos e Condições</h4>
        </div>

        <div className="space-y-4">
          {/* Terms of Service */}
          <div className={`${errors?.terms ? 'border border-destructive rounded-lg p-3' : ''}`}>
            <Checkbox
              label={
                <span className="text-sm">
                  Eu li e aceito os{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => window.open('/termos-de-uso', '_blank')}
                  >
                    Termos de Uso
                  </button>
                  {' '}da plataforma
                </span>
              }
              checked={acceptedTerms}
              onChange={(e) => onTermsChange(e?.target?.checked)}
              error={errors?.terms}
              required
            />
            {errors?.terms && (
              <p className="text-xs text-destructive mt-1">{errors?.terms}</p>
            )}
          </div>

          {/* Privacy Policy */}
          <div className={`${errors?.privacy ? 'border border-destructive rounded-lg p-3' : ''}`}>
            <Checkbox
              label={
                <span className="text-sm">
                  Eu li e aceito a{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => window.open('/politica-de-privacidade', '_blank')}
                  >
                    Política de Privacidade
                  </button>
                  {' '}e autorizo o tratamento dos meus dados pessoais conforme a LGPD
                </span>
              }
              checked={acceptedPrivacy}
              onChange={(e) => onPrivacyChange(e?.target?.checked)}
              error={errors?.privacy}
              required
            />
            {errors?.privacy && (
              <p className="text-xs text-destructive mt-1">{errors?.privacy}</p>
            )}
          </div>

          {/* Marketing Communications */}
          <div>
            <Checkbox
              label={
                <span className="text-sm">
                  Aceito receber comunicações de marketing, promoções e novidades por email e WhatsApp
                </span>
              }
              description="Você pode cancelar a qualquer momento"
              checked={acceptedMarketing}
              onChange={(e) => onMarketingChange(e?.target?.checked)}
            />
          </div>
        </div>
      </div>
      {/* Data Protection Notice */}
      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <div className="flex items-start">
          <Icon name="Shield" size={20} className="text-success mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="font-semibold text-foreground mb-2">
              Proteção de Dados
            </h5>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seus dados pessoais são protegidos de acordo com a Lei Geral de Proteção de Dados (LGPD). 
              Utilizamos criptografia de ponta e medidas de segurança rigorosas para garantir a 
              privacidade e segurança das suas informações.
            </p>
          </div>
        </div>
      </div>
      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="Lock" size={16} className="text-success mr-2" />
          <span>Criptografia SSL</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="Shield" size={16} className="text-success mr-2" />
          <span>Conformidade LGPD</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="Eye" size={16} className="text-success mr-2" />
          <span>Dados Não Compartilhados</span>
        </div>
      </div>
      {/* Contact Information */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          Dúvidas sobre privacidade? Entre em contato:{' '}
          <a href="mailto:privacidade@fittrainerpro.com" className="text-primary hover:underline">
            privacidade@fittrainerpro.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;