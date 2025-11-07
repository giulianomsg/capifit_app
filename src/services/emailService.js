import { supabase } from '../lib/supabase';

export const emailService = {
  // Send welcome email to new users
  async sendWelcomeEmail(userEmail, userName) {
    try {
      const { data, error } = await supabase?.rpc('send_email_notification', {
        recipient_email: userEmail,
        template_name: 'welcome',
        template_variables: {
          name: userName
        }
      })
      
      return { success: data, error }
    } catch (error) {
      return { 
        success: false, 
        error: { 
          message: 'Failed to send welcome email.' 
        } 
      }
    }
  },

  // Send workout reminder email
  async sendWorkoutReminder(userEmail, userName, workoutDate, workoutTime) {
    try {
      const { data, error } = await supabase?.rpc('send_email_notification', {
        recipient_email: userEmail,
        template_name: 'workout_reminder',
        template_variables: {
          name: userName,
          date: workoutDate,
          time: workoutTime
        }
      })
      
      return { success: data, error }
    } catch (error) {
      return { 
        success: false, 
        error: { 
          message: 'Failed to send workout reminder.' 
        } 
      }
    }
  },

  // Get email templates (admin only)
  async getEmailTemplates() {
    try {
      const { data, error } = await supabase
        ?.from('email_templates')
        ?.select('*')
        ?.eq('is_active', true)
        ?.order('name')
      
      return { data, error }
    } catch (error) {
      return { 
        data: [], 
        error: { 
          message: 'Unable to load email templates.' 
        } 
      }
    }
  },

  // Create email template (admin only)
  async createEmailTemplate(template) {
    try {
      const { data, error } = await supabase
        ?.from('email_templates')
        ?.insert([{
          name: template?.name,
          subject: template?.subject,
          html_content: template?.htmlContent,
          text_content: template?.textContent,
          variables: template?.variables || []
        }])
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to create email template.' 
        } 
      }
    }
  },

  // Update email template (admin only)
  async updateEmailTemplate(templateId, updates) {
    try {
      const { data, error } = await supabase
        ?.from('email_templates')
        ?.update({
          subject: updates?.subject,
          html_content: updates?.htmlContent,
          text_content: updates?.textContent,
          variables: updates?.variables,
          is_active: updates?.isActive
        })
        ?.eq('id', templateId)
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to update email template.' 
        } 
      }
    }
  },

  // Get email logs (admin only)
  async getEmailLogs(limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        ?.from('email_logs')
        ?.select(`
          *,
          email_templates (
            name,
            subject
          )
        `)
        ?.order('sent_at', { ascending: false })
        ?.range(offset, offset + limit - 1)
      
      return { data, error }
    } catch (error) {
      return { 
        data: [], 
        error: { 
          message: 'Unable to load email logs.' 
        } 
      }
    }
  },

  // Direct email sending (for backend integration)
  async sendDirectEmail(emailData) {
    try {
      // This would integrate with your Node.js backend using Gmail SMTP
      const response = await fetch(`${import.meta.env?.VITE_API_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase?.auth?.getSession())?.data?.session?.access_token}`
        },
        body: JSON.stringify({
          to: emailData?.to,
          subject: emailData?.subject,
          html: emailData?.html,
          text: emailData?.text
        })
      })
      
      const result = await response?.json()
      
      if (!response?.ok) {
        return { 
          success: false, 
          error: { 
            message: result?.message || 'Failed to send email.' 
          } 
        }
      }
      
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: { 
          message: 'Network error. Unable to send email.' 
        } 
      }
    }
  }
}