const express = require('express')
const router = express?.Router()
const gmailService = require('../email/gmailService')
const jwt = require('jsonwebtoken')

// Middleware to verify Supabase JWT token
const verifySupabaseToken = async (req, res, next) => {
  try {
    const authHeader = req?.headers?.authorization
    if (!authHeader) {
      return res?.status(401)?.json({ error: 'No authorization header' });
    }

    const token = authHeader?.replace('Bearer ', '')
    
    // For development, you might want to skip verification
    // In production, verify the JWT with your Supabase JWT secret
    if (process.env?.NODE_ENV === 'production') {
      const decoded = jwt?.verify(token, process.env?.SUPABASE_JWT_SECRET)
      req.user = decoded
    }
    
    next()
  } catch (error) {
    return res?.status(401)?.json({ error: 'Invalid token' });
  }
}

// Send general email
router?.post('/send-email', verifySupabaseToken, async (req, res) => {
  try {
    const { to, subject, html, text, attachments } = req?.body

    if (!to || !subject || (!html && !text)) {
      return res?.status(400)?.json({
        success: false,
        error: 'Missing required fields: to, subject, and content (html or text)'
      });
    }

    const result = await gmailService?.sendEmail({
      to,
      subject,
      html,
      text,
      attachments
    })

    if (result?.success) {
      res?.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result?.messageId
      })
    } else {
      res?.status(500)?.json({
        success: false,
        error: result?.error
      })
    }
  } catch (error) {
    console.error('Send email error:', error)
    res?.status(500)?.json({
      success: false,
      error: 'Failed to send email'
    })
  }
})

// Send welcome email
router?.post('/send-welcome', verifySupabaseToken, async (req, res) => {
  try {
    const { email, name } = req?.body

    if (!email || !name) {
      return res?.status(400)?.json({
        success: false,
        error: 'Email and name are required'
      });
    }

    const result = await gmailService?.sendWelcomeEmail(email, name)

    if (result?.success) {
      res?.json({
        success: true,
        message: 'Welcome email sent successfully',
        messageId: result?.messageId
      })
    } else {
      res?.status(500)?.json({
        success: false,
        error: result?.error
      })
    }
  } catch (error) {
    console.error('Send welcome email error:', error)
    res?.status(500)?.json({
      success: false,
      error: 'Failed to send welcome email'
    })
  }
})

// Send workout reminder
router?.post('/send-workout-reminder', verifySupabaseToken, async (req, res) => {
  try {
    const { email, name, workoutDate, workoutTime, trainerName } = req?.body

    if (!email || !name || !workoutDate || !workoutTime) {
      return res?.status(400)?.json({
        success: false,
        error: 'Email, name, workout date, and time are required'
      });
    }

    const result = await gmailService?.sendWorkoutReminder(
      email, 
      name, 
      workoutDate, 
      workoutTime, 
      trainerName
    )

    if (result?.success) {
      res?.json({
        success: true,
        message: 'Workout reminder sent successfully',
        messageId: result?.messageId
      })
    } else {
      res?.status(500)?.json({
        success: false,
        error: result?.error
      })
    }
  } catch (error) {
    console.error('Send workout reminder error:', error)
    res?.status(500)?.json({
      success: false,
      error: 'Failed to send workout reminder'
    })
  }
})

// Send payment confirmation
router?.post('/send-payment-confirmation', verifySupabaseToken, async (req, res) => {
  try {
    const { email, name, amount, planName, nextPaymentDate } = req?.body

    if (!email || !name || !amount || !planName) {
      return res?.status(400)?.json({
        success: false,
        error: 'Email, name, amount, and plan name are required'
      });
    }

    const result = await gmailService?.sendPaymentConfirmation(
      email,
      name,
      amount,
      planName,
      nextPaymentDate
    )

    if (result?.success) {
      res?.json({
        success: true,
        message: 'Payment confirmation sent successfully',
        messageId: result?.messageId
      })
    } else {
      res?.status(500)?.json({
        success: false,
        error: result?.error
      })
    }
  } catch (error) {
    console.error('Send payment confirmation error:', error)
    res?.status(500)?.json({
      success: false,
      error: 'Failed to send payment confirmation'
    })
  }
})

// Test email configuration
router?.get('/test-connection', async (req, res) => {
  try {
    const result = await gmailService?.verifyConnection()
    
    if (result?.success) {
      res?.json({
        success: true,
        message: 'Gmail SMTP connection is working correctly'
      })
    } else {
      res?.status(500)?.json({
        success: false,
        error: result?.error
      })
    }
  } catch (error) {
    console.error('Test connection error:', error)
    res?.status(500)?.json({
      success: false,
      error: 'Failed to test connection'
    })
  }
})

// Send test email
router?.post('/send-test', async (req, res) => {
  try {
    const { email } = req?.body

    if (!email) {
      return res?.status(400)?.json({
        success: false,
        error: 'Email is required'
      });
    }

    const result = await gmailService?.sendEmail({
      to: email,
      subject: 'Teste de Email - CapiFit',
      html: `
        <h2>🎉 Teste de Email Bem-sucedido!</h2>
        <p>Este email confirma que a configuração do Gmail SMTP está funcionando corretamente no CapiFit.</p>
        <p><strong>Data/Hora:</strong> ${new Date()?.toLocaleString('pt-BR')}</p>
        <p><strong>Status:</strong> ✅ Configuração OK</p>
      `,
      text: `
        TESTE DE EMAIL - CapiFit
        
        Este email confirma que a configuração do Gmail SMTP está funcionando corretamente.
        
        Data/Hora: ${new Date()?.toLocaleString('pt-BR')}
        Status: Configuração OK
      `
    })

    if (result?.success) {
      res?.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result?.messageId
      })
    } else {
      res?.status(500)?.json({
        success: false,
        error: result?.error
      })
    }
  } catch (error) {
    console.error('Send test email error:', error)
    res?.status(500)?.json({
      success: false,
      error: 'Failed to send test email'
    })
  }
})

module.exports = router