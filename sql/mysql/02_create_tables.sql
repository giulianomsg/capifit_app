-- ================================================
-- CAPIFIT - MYSQL/MARIADB TABLE DEFINITIONS
-- ================================================

USE capifit_db;

-- Users/Profiles table (replaces auth.users + profiles from Supabase)
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('trainer', 'client', 'admin') NOT NULL DEFAULT 'client',
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- Clients table
CREATE TABLE clients (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    trainer_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    birth_date DATE,
    emergency_contact VARCHAR(255),
    medical_conditions TEXT,
    goals TEXT,
    subscription_status ENUM('active', 'inactive', 'suspended', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_clients_trainer (trainer_id),
    INDEX idx_clients_email (email)
);

-- Exercises table
CREATE TABLE exercises (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    muscle_groups JSON,
    equipment VARCHAR(255),
    difficulty_level TINYINT CHECK (difficulty_level BETWEEN 1 AND 5),
    instructions TEXT,
    video_url VARCHAR(500),
    image_url VARCHAR(500),
    created_by CHAR(36),
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_exercises_category (category),
    INDEX idx_exercises_difficulty (difficulty_level),
    INDEX idx_exercises_created_by (created_by)
);

-- Workouts table
CREATE TABLE workouts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    trainer_id CHAR(36) NOT NULL,
    client_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    exercises JSON,
    scheduled_date DATETIME,
    completed_at DATETIME,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_workouts_trainer (trainer_id),
    INDEX idx_workouts_client (client_id),
    INDEX idx_workouts_scheduled (scheduled_date),
    INDEX idx_workouts_status (status)
);

-- Physical Assessments table
CREATE TABLE physical_assessments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id CHAR(36) NOT NULL,
    trainer_id CHAR(36) NOT NULL,
    assessment_date DATE NOT NULL,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    muscle_mass DECIMAL(5,2),
    measurements JSON,
    photos JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_assessments_client (client_id),
    INDEX idx_assessments_trainer (trainer_id),
    INDEX idx_assessments_date (assessment_date)
);

-- Foods table
CREATE TABLE foods (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(100),
    calories_per_100g INT,
    proteins_per_100g DECIMAL(5,2),
    carbs_per_100g DECIMAL(5,2),
    fats_per_100g DECIMAL(5,2),
    fiber_per_100g DECIMAL(5,2),
    created_by CHAR(36),
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_foods_name (name),
    INDEX idx_foods_category (category),
    INDEX idx_foods_created_by (created_by)
);

-- Meal Plans table
CREATE TABLE meal_plans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    trainer_id CHAR(36) NOT NULL,
    client_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    meals JSON,
    total_calories INT,
    start_date DATE,
    end_date DATE,
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_meal_plans_trainer (trainer_id),
    INDEX idx_meal_plans_client (client_id),
    INDEX idx_meal_plans_dates (start_date, end_date)
);

-- Messages table
CREATE TABLE messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sender_id CHAR(36) NOT NULL,
    receiver_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'workout', 'meal_plan') DEFAULT 'text',
    file_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_receiver (receiver_id),
    INDEX idx_messages_created (created_at)
);

-- Notifications table
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50),
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id CHAR(36) NOT NULL,
    trainer_id CHAR(36) NOT NULL,
    plan_name VARCHAR(255),
    amount DECIMAL(10,2),
    currency CHAR(3) DEFAULT 'BRL',
    billing_cycle ENUM('monthly', 'quarterly', 'yearly') DEFAULT 'monthly',
    status ENUM('active', 'inactive', 'cancelled', 'suspended') DEFAULT 'active',
    started_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subscriptions_client (client_id),
    INDEX idx_subscriptions_trainer (trainer_id),
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_expires (expires_at)
);

-- Workout Sessions table (for tracking individual workout sessions)
CREATE TABLE workout_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    workout_id CHAR(36) NOT NULL,
    client_id CHAR(36) NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_minutes INT,
    exercises_completed JSON,
    notes TEXT,
    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_workout_sessions_workout (workout_id),
    INDEX idx_workout_sessions_client (client_id),
    INDEX idx_workout_sessions_date (started_at)
);

-- File Uploads table (to track uploaded files)
CREATE TABLE file_uploads (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    upload_purpose ENUM('avatar', 'exercise_image', 'exercise_video', 'assessment_photo', 'document') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_file_uploads_user (user_id),
    INDEX idx_file_uploads_purpose (upload_purpose)
);