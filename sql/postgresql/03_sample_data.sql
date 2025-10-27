-- ================================================
-- CAPIFIT - POSTGRESQL SAMPLE DATA
-- ================================================

-- Insert sample users (password: 'password123' hashed with bcrypt)
INSERT INTO users (id, email, password_hash, role, full_name, phone) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@capifit.com', '$2b$10$9E8QQq5YyJ4nJ2p2J8qvKuKjJ9J4qvKuKjJ9J4qvKuKjJ9J4qvKu', 'admin', 'Admin Sistema', '+5511999999999'),
('550e8400-e29b-41d4-a716-446655440001', 'trainer1@capifit.com', '$2b$10$9E8QQq5YyJ4nJ2p2J8qvKuKjJ9J4qvKuKjJ9J4qvKuKjJ9J4qvKu', 'trainer', 'Carlos Silva', '+5511888888888'),
('550e8400-e29b-41d4-a716-446655440002', 'trainer2@capifit.com', '$2b$10$9E8QQq5YyJ4nJ2p2J8qvKuKjJ9J4qvKuKjJ9J4qvKuKjJ9J4qvKu', 'trainer', 'Ana Santos', '+5511777777777'),
('550e8400-e29b-41d4-a716-446655440003', 'client1@capifit.com', '$2b$10$9E8QQq5YyJ4nJ2p2J8qvKuKjJ9J4qvKuKjJ9J4qvKuKjJ9J4qvKu', 'client', 'João Pedro', '+5511666666666'),
('550e8400-e29b-41d4-a716-446655440004', 'client2@capifit.com', '$2b$10$9E8QQq5YyJ4nJ2p2J8qvKuKjJ9J4qvKuKjJ9J4qvKuKjJ9J4qvKu', 'client', 'Maria Oliveira', '+5511555555555');

-- Insert sample clients
INSERT INTO clients (id, trainer_id, name, email, birth_date, goals) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'João Pedro', 'client1@capifit.com', '1990-05-15', 'Perder peso e ganhar condicionamento'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Maria Oliveira', 'client2@capifit.com', '1985-08-22', 'Ganhar massa muscular'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Pedro Costa', 'pedro@email.com', '1992-12-10', 'Melhorar flexibilidade');

-- Insert sample exercises
INSERT INTO exercises (id, name, category, muscle_groups, equipment, difficulty_level, instructions) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Agachamento', 'Pernas', ARRAY['quadriceps', 'glúteos', 'isquiotibiais'], 'Peso corporal', 2, 'Fique em pé, desça como se fosse sentar, mantenha o peso nos calcanhares'),
('770e8400-e29b-41d4-a716-446655440002', 'Flexão de braço', 'Peito', ARRAY['peitoral', 'tríceps', 'ombros'], 'Peso corporal', 2, 'Posição de prancha, desça o corpo mantendo alinhamento'),
('770e8400-e29b-41d4-a716-446655440003', 'Supino reto', 'Peito', ARRAY['peitoral', 'tríceps', 'ombros'], 'Barra e pesos', 3, 'Deitado no banco, abaixe a barra até o peito e empurre para cima');

-- Insert sample workouts
INSERT INTO workouts (id, trainer_id, client_id, name, description, exercises, status) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Treino A - Pernas', 'Treino focado em membros inferiores', '[{"exercise_id": "770e8400-e29b-41d4-a716-446655440001", "sets": 3, "reps": 12, "rest": 60}]'::jsonb, 'scheduled'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'Treino B - Peito', 'Treino focado em peitoral', '[{"exercise_id": "770e8400-e29b-41d4-a716-446655440002", "sets": 3, "reps": 10, "rest": 90}]'::jsonb, 'scheduled');

-- Insert sample foods
INSERT INTO foods (id, name, category, calories_per_100g, proteins_per_100g, carbs_per_100g, fats_per_100g) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Peito de Frango', 'Proteína', 165, 31.0, 0.0, 3.6),
('990e8400-e29b-41d4-a716-446655440002', 'Arroz Integral', 'Carboidrato', 111, 2.6, 23.0, 0.9),
('990e8400-e29b-41d4-a716-446655440003', 'Brócolis', 'Vegetais', 34, 2.8, 7.0, 0.4);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, category, priority) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'Treino Agendado', 'Você tem um treino agendado para hoje às 14h', 'workout', 'medium'),
('550e8400-e29b-41d4-a716-446655440004', 'Avaliação Física', 'Está na hora de fazer sua avaliação física mensal', 'assessment', 'high');

-- Insert sample physical assessments
INSERT INTO physical_assessments (id, client_id, trainer_id, assessment_date, weight, height, body_fat_percentage, muscle_mass, measurements) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 75.5, 175.0, 18.5, 32.0, '{"chest": 95, "waist": 82, "hips": 98}'::jsonb),
('aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '2024-01-20', 65.2, 162.0, 22.3, 28.5, '{"chest": 88, "waist": 70, "hips": 92}'::jsonb);