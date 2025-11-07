const nodemailer = require('nodemailer')

// Gmail SMTP configuration
const createGmailTransporter = () => {
  return nodemailer?.createTransporter({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env?.GMAIL_USER, // Your Gmail address
      pass: process.env?.GMAIL_APP_PASSWORD // Gmail App Password (not regular password)
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

const gmailService = {
  // Send email using Gmail SMTP
  async sendEmail(emailData) {
    try {
      const transporter = createGmailTransporter()
      
      const mailOptions = {
        from: {
          name: 'CapiFit',
          address: process.env?.GMAIL_USER
        },
        to: emailData?.to,
        subject: emailData?.subject,
        text: emailData?.text,
        html: emailData?.html,
        attachments: emailData?.attachments || []
      }
      
      const result = await transporter?.sendMail(mailOptions)
      
      return {
        success: true,
        messageId: result?.messageId,
        response: result?.response
      };
    } catch (error) {
      console.error('Gmail service error:', error)
      return {
        success: false,
        error: error?.message
      };
    }
  },

  // Send welcome email template
  async sendWelcomeEmail(userEmail, userName) {
    const emailData = {
      to: userEmail,
      subject: 'Bem-vindo ao CapiFit! 🏋️‍♂️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Bem-vindo ao CapiFit!</h1>
          </header>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Olá, ${userName}! 👋</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Estamos muito felizes em tê-lo conosco na plataforma CapiFit! Você agora faz parte de uma comunidade dedicada ao fitness e bem-estar.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-bottom: 15px;">O que você pode fazer no CapiFit:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>📊 Acompanhar seus treinos e progresso</li>
                <li>💪 Receber planos personalizados do seu personal trainer</li>
                <li>📱 Acessar exercícios e instruções detalhadas</li>
                <li>📈 Monitorar suas avaliações físicas</li>
                <li>🍎 Seguir planos nutricionais customizados</li>
                <li>💬 Comunicar-se diretamente com seu trainer</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env?.APP_URL}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Acessar Plataforma
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Se você tiver alguma dúvida, nossa equipe está sempre pronta para ajudar. Responda este email ou entre em contato conosco.
            </p>
            
            <p style="color: #666; margin-top: 30px;">
              Vamos juntos nessa jornada fitness! 💪<br>
              Equipe CapiFit
            </p>
          </div>
          
          <footer style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 CapiFit - Plataforma de Personal Training</p>
            <p>Este email foi enviado para ${userEmail}</p>
          </footer>
        </div>
      `,
      text: `
        Bem-vindo ao CapiFit, ${userName}!
        
        Estamos muito felizes em tê-lo conosco na nossa plataforma de fitness!
        
        No CapiFit você pode:
        - Acompanhar seus treinos e progresso
        - Receber planos personalizados do seu personal trainer
        - Acessar exercícios e instruções detalhadas
        - Monitorar suas avaliações físicas
        - Seguir planos nutricionais customizados
        - Comunicar-se diretamente com seu trainer
        
        Acesse a plataforma: ${process.env?.APP_URL}
        
        Vamos juntos nessa jornada fitness!
        Equipe CapiFit
      `
    }
    
    return await this.sendEmail(emailData)
  },

  // Send workout reminder email
  async sendWorkoutReminder(userEmail, userName, workoutDate, workoutTime, trainerName) {
    const emailData = {
      to: userEmail,
      subject: '⏰ Lembrete: Seu treino está agendado!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🏋️‍♂️ Lembrete de Treino</h1>
          </header>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Olá, ${userName}!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
              <h3 style="color: #667eea; margin-bottom: 15px;">Seu treino está agendado para:</h3>
              <p style="font-size: 18px; font-weight: bold; color: #333; margin: 10px 0;">
                📅 ${workoutDate}
              </p>
              <p style="font-size: 18px; font-weight: bold; color: #333; margin: 10px 0;">
                🕐 ${workoutTime}
              </p>
              ${trainerName ? `<p style="color: #666; margin: 10px 0;">👨‍💼 Personal Trainer: ${trainerName}</p>` : ''}
            </div>
            
            <div style="background: #e8f2ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #333; margin-bottom: 10px;">💡 Dicas para o seu treino:</h4>
              <ul style="color: #666; line-height: 1.6;">
                <li>Chegue 5-10 minutos antes do horário</li>
                <li>Traga uma garrafa de água</li>
                <li>Use roupas confortáveis para exercitar-se</li>
                <li>Não esqueça de fazer um aquecimento</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env?.APP_URL}/workout-sessions" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Ver Detalhes do Treino
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Precisa reagendar? Entre em contato com seu personal trainer através da plataforma.
            </p>
          </div>
          
          <footer style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 CapiFit - Plataforma de Personal Training</p>
          </footer>
        </div>
      `,
      text: `
        LEMBRETE DE TREINO - CapiFit
        
        Olá, ${userName}!
        
        Seu treino está agendado para:
        Data: ${workoutDate}
        Horário: ${workoutTime}
        ${trainerName ? `Personal Trainer: ${trainerName}` : ''}
        
        Dicas:
        - Chegue 5-10 minutos antes
        - Traga água
        - Use roupas confortáveis
        - Faça aquecimento
        
        Acesse: ${process.env?.APP_URL}/workout-sessions
        
        CapiFit - Sua jornada fitness
      `
    }
    
    return await this.sendEmail(emailData)
  },

  // Send payment confirmation email
  async sendPaymentConfirmation(userEmail, userName, amount, planName, nextPaymentDate) {
    const emailData = {
      to: userEmail,
      subject: '✅ Pagamento confirmado - CapiFit',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <header style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">✅ Pagamento Confirmado</h1>
          </header>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Olá, ${userName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Confirmamos o recebimento do seu pagamento. Sua assinatura está ativa e você pode continuar aproveitando todos os benefícios do CapiFit!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
              <h3 style="color: #28a745; margin-bottom: 15px;">Detalhes do Pagamento:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Plano:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold; border-bottom: 1px solid #eee;">${planName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Valor:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold; border-bottom: 1px solid #eee;">R$ ${amount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Próximo pagamento:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">${nextPaymentDate}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env?.APP_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Acessar Dashboard
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Obrigado por escolher o CapiFit para sua jornada fitness!
            </p>
          </div>
          
          <footer style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 CapiFit - Plataforma de Personal Training</p>
          </footer>
        </div>
      `,
      text: `
        PAGAMENTO CONFIRMADO - CapiFit
        
        Olá, ${userName}!
        
        Confirmamos o recebimento do seu pagamento.
        
        Detalhes:
        Plano: ${planName}
        Valor: R$ ${amount}
        Próximo pagamento: ${nextPaymentDate}
        
        Sua assinatura está ativa!
        
        Acesse: ${process.env?.APP_URL}/dashboard
        
        Obrigado por escolher o CapiFit!
      `
    }
    
    return await this.sendEmail(emailData)
  },

  // Verify Gmail configuration
  async verifyConnection() {
    try {
      const transporter = createGmailTransporter()
      await transporter?.verify()
      return { success: true, message: 'Gmail SMTP connection verified' }
    } catch (error) {
      console.error('Gmail verification error:', error)
      return { success: false, error: error?.message };
    }
  }
}

module.exports = gmailService