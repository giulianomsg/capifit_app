-- ================================================
-- CAPIFIT - POSTGRESQL DATABASE SCHEMA
-- ================================================
-- Database Creation and Configuration
-- ================================================

-- Create database (run this as superuser)
-- CREATE DATABASE capifit_db WITH ENCODING 'UTF8' LC_COLLATE='pt_BR.UTF-8' LC_CTYPE='pt_BR.UTF-8';

-- Connect to the database
\c capifit_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('trainer', 'client', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'suspended', 'cancelled');
CREATE TYPE workout_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'workout', 'meal_plan');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');
CREATE TYPE upload_purpose AS ENUM ('avatar', 'exercise_image', 'exercise_video', 'assessment_photo', 'document');