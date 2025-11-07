import { supabase } from '../lib/supabase';

export const workoutService = {
  // Get workout plans for trainer or client
  async getWorkoutPlans(userId, userRole) {
    try {
      let query = supabase
        ?.from('workout_plans')
        ?.select(`
          *,
          trainer:trainer_id (
            full_name,
            email
          ),
          client:client_id (
            full_name,
            email
          )
        `)
      
      if (userRole === 'trainer') {
        query = query?.eq('trainer_id', userId)
      } else {
        query = query?.eq('client_id', userId)
      }
      
      const { data, error } = await query?.order('created_at', { ascending: false })
      
      return { data, error }
    } catch (error) {
      return { 
        data: [], 
        error: { 
          message: 'Unable to load workout plans.' 
        } 
      }
    }
  },

  // Create new workout plan
  async createWorkoutPlan(planData) {
    try {
      const { data, error } = await supabase
        ?.from('workout_plans')
        ?.insert([{
          trainer_id: planData?.trainerId,
          client_id: planData?.clientId,
          name: planData?.name,
          description: planData?.description,
          duration_weeks: planData?.durationWeeks,
          difficulty: planData?.difficulty,
          goals: planData?.goals,
          start_date: planData?.startDate,
          end_date: planData?.endDate,
          notes: planData?.notes
        }])
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to create workout plan.' 
        } 
      }
    }
  },

  // Update workout plan
  async updateWorkoutPlan(planId, updates) {
    try {
      const { data, error } = await supabase
        ?.from('workout_plans')
        ?.update(updates)
        ?.eq('id', planId)
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to update workout plan.' 
        } 
      }
    }
  },

  // Get exercises in workout plan
  async getWorkoutExercises(planId) {
    try {
      const { data, error } = await supabase
        ?.from('workout_exercises')
        ?.select(`
          *,
          exercise:exercise_id (
            name,
            description,
            category,
            muscle_groups,
            equipment_needed,
            instructions,
            video_url,
            image_urls
          )
        `)
        ?.eq('workout_plan_id', planId)
        ?.order('day_number')
        ?.order('order_index')
      
      return { data, error }
    } catch (error) {
      return { 
        data: [], 
        error: { 
          message: 'Unable to load workout exercises.' 
        } 
      }
    }
  },

  // Add exercise to workout plan
  async addExerciseToWorkout(workoutData) {
    try {
      const { data, error } = await supabase
        ?.from('workout_exercises')
        ?.insert([{
          workout_plan_id: workoutData?.workoutPlanId,
          exercise_id: workoutData?.exerciseId,
          day_number: workoutData?.dayNumber,
          order_index: workoutData?.orderIndex,
          sets: workoutData?.sets,
          reps: workoutData?.reps,
          duration_seconds: workoutData?.durationSeconds,
          rest_seconds: workoutData?.restSeconds,
          weight_kg: workoutData?.weightKg,
          distance_meters: workoutData?.distanceMeters,
          notes: workoutData?.notes
        }])
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to add exercise to workout.' 
        } 
      }
    }
  },

  // Get workout sessions
  async getWorkoutSessions(userId, userRole, filters = {}) {
    try {
      let query = supabase
        ?.from('workout_sessions')
        ?.select(`
          *,
          workout_plan:workout_plan_id (
            name,
            trainer_id,
            client_id
          ),
          client:client_id (
            full_name,
            email
          )
        `)
      
      if (userRole === 'client') {
        query = query?.eq('client_id', userId)
      } else if (userRole === 'trainer') {
        query = query?.in('workout_plan_id', 
          supabase?.from('workout_plans')?.select('id')?.eq('trainer_id', userId)
        )
      }
      
      if (filters?.startDate) {
        query = query?.gte('scheduled_date', filters?.startDate)
      }
      
      if (filters?.endDate) {
        query = query?.lte('scheduled_date', filters?.endDate)
      }
      
      const { data, error } = await query?.order('scheduled_date', { ascending: false })
      
      return { data, error }
    } catch (error) {
      return { 
        data: [], 
        error: { 
          message: 'Unable to load workout sessions.' 
        } 
      }
    }
  },

  // Create workout session
  async createWorkoutSession(sessionData) {
    try {
      const { data, error } = await supabase
        ?.from('workout_sessions')
        ?.insert([{
          workout_plan_id: sessionData?.workoutPlanId,
          client_id: sessionData?.clientId,
          scheduled_date: sessionData?.scheduledDate,
          status: sessionData?.status || 'scheduled'
        }])
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to create workout session.' 
        } 
      }
    }
  },

  // Update workout session (complete, add notes, etc.)
  async updateWorkoutSession(sessionId, updates) {
    try {
      const { data, error } = await supabase
        ?.from('workout_sessions')
        ?.update({
          started_at: updates?.startedAt,
          completed_at: updates?.completedAt,
          duration_minutes: updates?.durationMinutes,
          calories_burned: updates?.caloriesBurned,
          difficulty_rating: updates?.difficultyRating,
          session_notes: updates?.sessionNotes,
          trainer_feedback: updates?.trainerFeedback,
          status: updates?.status
        })
        ?.eq('id', sessionId)
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to update workout session.' 
        } 
      }
    }
  },

  // Get available exercises
  async getExercises(filters = {}) {
    try {
      let query = supabase
        ?.from('exercises')
        ?.select('*')
      
      if (filters?.category) {
        query = query?.eq('category', filters?.category)
      }
      
      if (filters?.difficulty) {
        query = query?.eq('difficulty', filters?.difficulty)
      }
      
      if (filters?.muscleGroup) {
        query = query?.contains('muscle_groups', [filters?.muscleGroup])
      }
      
      if (filters?.search) {
        query = query?.or(`name.ilike.%${filters?.search}%,description.ilike.%${filters?.search}%`)
      }
      
      const { data, error } = await query?.order('name')
      
      return { data, error }
    } catch (error) {
      return { 
        data: [], 
        error: { 
          message: 'Unable to load exercises.' 
        } 
      }
    }
  },

  // Create custom exercise
  async createExercise(exerciseData) {
    try {
      const { data, error } = await supabase
        ?.from('exercises')
        ?.insert([{
          name: exerciseData?.name,
          description: exerciseData?.description,
          category: exerciseData?.category,
          difficulty: exerciseData?.difficulty,
          muscle_groups: exerciseData?.muscleGroups,
          equipment_needed: exerciseData?.equipmentNeeded,
          instructions: exerciseData?.instructions,
          video_url: exerciseData?.videoUrl,
          image_urls: exerciseData?.imageUrls,
          duration_minutes: exerciseData?.durationMinutes,
          calories_per_minute: exerciseData?.caloriesPerMinute,
          safety_tips: exerciseData?.safetyTips,
          variations: exerciseData?.variations,
          created_by: exerciseData?.createdBy,
          is_public: exerciseData?.isPublic || false
        }])
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to create exercise.' 
        } 
      }
    }
  }
}