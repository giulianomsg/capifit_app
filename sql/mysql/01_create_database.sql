-- ================================================
-- CAPIFIT - MYSQL/MARIADB DATABASE SCHEMA
-- ================================================
-- Database Creation and Configuration
-- ================================================

CREATE DATABASE IF NOT EXISTS capifit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE capifit_db;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Set SQL mode for strict validation
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';