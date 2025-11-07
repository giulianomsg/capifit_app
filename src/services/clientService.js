import { supabase } from '../lib/supabase';

export const clientService = {
  // Get trainer's clients
  async getTrainerClients(trainerId) {
    try {
      const { data, error } = await supabase
        ?.from('subscriptions')
        ?.select(`
          *,
          client:client_id (
            id,
            full_name,
            email,
            phone,
            avatar_url,
            created_at,
            client_profiles (
              fitness_level,
              fitness_goals,
              health_conditions
            )
          )
        `)
        ?.eq('trainer_id', trainerId)
        ?.eq('status', 'active')
        ?.order('created_at', { ascending: false })
      
      return { data, error }
    } catch (error) {
      return { 
        data: [], 
        error: { 
          message: 'Unable to load clients.' 
        } 
      }
    }
  },

  // Get client profile with details
  async getClientProfile(clientId) {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select(`
          *,
          client_profiles (*),
          subscriptions (
            *,
            trainer:trainer_id (
              full_name,
              email
            )
          )
        `)
        ?.eq('id', clientId)
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: 'Unable to load client profile.' 
        } 
      }
    }
  },

  // Update client profile
  async updateClientProfile(clientId, profileData) {
    try {
      const { data, error } = await supabase
        ?.from('client_profiles')
        ?.update({
          height_cm: profileData?.heightCm,
          weight_kg: profileData?.weightKg,
          fitness_level: profileData?.fitnessLevel,
          health_conditions: profileData?.healthConditions,
          fitness_goals: profileData?.fitnessGoals,
          preferred_workout_days: profileData?.preferredWorkoutDays,
          emergency_contact_name: profileData?.emergencyContactName,
          emergency_contact_phone: profileData?.emergencyContactPhone,
          medical_clearance: profileData?.medicalClearance
        })
        ?.eq('user_id', clientId)
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to update client profile.' 
        } 
      }
    }
  },

  // Create client profile (if doesn't exist)
  async createClientProfile(clientId, profileData) {
    try {
      const { data, error } = await supabase
        ?.from('client_profiles')
        ?.insert([{
          user_id: clientId,
          height_cm: profileData?.heightCm,
          weight_kg: profileData?.weightKg,
          fitness_level: profileData?.fitnessLevel,
          health_conditions: profileData?.healthConditions,
          fitness_goals: profileData?.fitnessGoals,
          preferred_workout_days: profileData?.preferredWorkoutDays,
          emergency_contact_name: profileData?.emergencyContactName,
          emergency_contact_phone: profileData?.emergencyContactPhone,
          medical_clearance: profileData?.medicalClearance
        }])
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to create client profile.' 
        } 
      }
    }
  },

  // Get client's physical assessments
  async getClientAssessments(clientId) {
    try {
      const { data, error } = await supabase
        ?.from('physical_assessments')
        ?.select(`
          *,
          trainer:trainer_id (
            full_name,
            email
          )
        `)
        ?.eq('client_id', clientId)
        ?.order('assessment_date', { ascending: false })
      
      return { data, error }
    } catch (error) {
      return { 
        data: [], 
        error: { 
          message: 'Unable to load assessments.' 
        } 
      }
    }
  },

  // Create physical assessment
  async createAssessment(assessmentData) {
    try {
      const { data, error } = await supabase
        ?.from('physical_assessments')
        ?.insert([{
          client_id: assessmentData?.clientId,
          trainer_id: assessmentData?.trainerId,
          assessment_type: assessmentData?.assessmentType,
          assessment_date: assessmentData?.assessmentDate,
          weight_kg: assessmentData?.weightKg,
          body_fat_percentage: assessmentData?.bodyFatPercentage,
          muscle_mass_kg: assessmentData?.muscleMassKg,
          measurements: assessmentData?.measurements,
          fitness_tests: assessmentData?.fitnessTests,
          photos: assessmentData?.photos,
          notes: assessmentData?.notes,
          recommendations: assessmentData?.recommendations,
          next_assessment_date: assessmentData?.nextAssessmentDate
        }])
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to create assessment.' 
        } 
      }
    }
  },

  // Get client's nutrition plans
  async getClientNutritionPlans(clientId) {
    try {
      const { data, error } = await supabase
        ?.from('nutrition_plans')
        ?.select(`
          *,
          trainer:trainer_id (
            full_name,
            email
          )
        `)
        ?.eq('client_id', clientId)
        ?.order('created_at', { ascending: false })
      
      return { data, error }
    } catch (error) {
      return { 
        data: [], 
        error: { 
          message: 'Unable to load nutrition plans.' 
        } 
      }
    }
  },

  // Create nutrition plan
  async createNutritionPlan(planData) {
    try {
      const { data, error } = await supabase
        ?.from('nutrition_plans')
        ?.insert([{
          client_id: planData?.clientId,
          trainer_id: planData?.trainerId,
          name: planData?.name,
          description: planData?.description,
          daily_calories: planData?.dailyCalories,
          macros: planData?.macros,
          meal_plan: planData?.mealPlan,
          restrictions: planData?.restrictions,
          supplements: planData?.supplements,
          notes: planData?.notes,
          is_active: planData?.isActive
        }])
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to create nutrition plan.' 
        } 
      }
    }
  },

  // Get client subscription details
  async getClientSubscription(clientId) {
    try {
      const { data, error } = await supabase
        ?.from('subscriptions')
        ?.select(`
          *,
          trainer:trainer_id (
            full_name,
            email,
            trainer_profiles (
              hourly_rate,
              specializations
            )
          ),
          payment_transactions (
            id,
            amount,
            payment_status,
            processed_at
          )
        `)
        ?.eq('client_id', clientId)
        ?.order('created_at', { ascending: false })
        ?.limit(1)
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: 'Unable to load subscription details.' 
        } 
      }
    }
  },

  // Create subscription
  async createSubscription(subscriptionData) {
    try {
      const { data, error } = await supabase
        ?.from('subscriptions')
        ?.insert([{
          client_id: subscriptionData?.clientId,
          trainer_id: subscriptionData?.trainerId,
          plan_name: subscriptionData?.planName,
          monthly_price: subscriptionData?.monthlyPrice,
          billing_cycle: subscriptionData?.billingCycle,
          start_date: subscriptionData?.startDate,
          end_date: subscriptionData?.endDate,
          payment_method: subscriptionData?.paymentMethod,
          auto_renew: subscriptionData?.autoRenew
        }])
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to create subscription.' 
        } 
      }
    }
  },

  // Update subscription status
  async updateSubscriptionStatus(subscriptionId, status) {
    try {
      const { data, error } = await supabase
        ?.from('subscriptions')
        ?.update({ 
          status,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', subscriptionId)
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to update subscription status.' 
        } 
      }
    }
  }
}