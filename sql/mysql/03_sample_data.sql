-- ================================================
-- CAPIFIT - MYSQL SAMPLE DATA
-- ================================================

USE capifit_db;

-- Insert sample users (password: 'password123' hashed with bcrypt)
INSERT INTO users (id, email, password_hash, role, full_name, phone) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@capifit.com', '$2b$10$9E8QQq5YyJ4nJ2p2J8qvKuKjJ9J4qvKuKjJ9J4qvKuKjJ9J4qvKu', 'admin', 'Admin Sistema', '+5511999999999'),
('550e8400-e29b-41d4-a716-446655440001', 'trainer1@capifit.com', '$2b$10$9E8QQq5YyJ4nJ2p2J8qvKuKjJ9J4qvKuKjJ9J4qvKuKjJ9J4qvKu', 'trainer', 'Carlos Silva', '+5511888888888'),
('550e8400-e29b-41d4-a716-446655440002', 'trainer2@capifit.com', '$2b$10$9E8QQq5YyJ4nJ2p2J8qvKuKjJ9J4qvKuKjJ9J4qvKuKjJ9J4qvKu', 'trainer', 'Ana Santos', '+5511777777777'),
('550e8400-e29b-41d4-a716-446655440003', 'client1@capifit.com', '$2b$10$9E8QQq5YyJ4nJ2p2J8qvKuKjJ9J4qvKuKjJ9J4qvKuKjJ9J4qvKu', 'client', 'João Pedro', '+5511666666666'),
('550e8400-e29b-41d4-a716-446655440004', 'client2@capifit.com', '$2b$10$9E8QQq5YyJ4nJ2p2J8qvKuKjJ9J4qvKuKjJ9J4qvKuKjJ9J4qvKu', 'client', 'Maria Oliveira', '+5511555555555');

-- Insert sample menu items
INSERT INTO menu_items (id, label, path, icon, visibility, order_index) VALUES
('a10e8400-e29b-41d4-a716-446655440001', 'Dashboard', '/dashboard-principal', 'LayoutDashboard', '["trainer", "client", "admin"]', 1),
('a10e8400-e29b-41d4-a716-446655440002', 'Alunos', '/gerenciar-alunos', 'Users', '["trainer"]', 2),
('a10e8400-e29b-41d4-a716-446655440003', 'Mensagens', '/chat-communication-hub', 'MessageSquare', '["trainer", "client"]', 3),
('a10e8400-e29b-41d4-a716-446655440004', 'Configurações', '/configuracoes', 'Settings', '["trainer", "client", "admin"]', 99);

-- Insert sample clients
INSERT INTO clients (id, trainer_id, name, email, birth_date, goals) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'João Pedro', 'client1@capifit.com', '1990-05-15', 'Perder peso e ganhar condicionamento'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Maria Oliveira', 'client2@capifit.com', '1985-08-22', 'Ganhar massa muscular'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Pedro Costa', 'pedro@email.com', '1992-12-10', 'Melhorar flexibilidade');

-- Insert sample exercises
INSERT INTO exercises (id, name, category, muscle_groups, equipment, difficulty_level, instructions) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Agachamento', 'Pernas', '["quadriceps", "glúteos", "isquiotibiais"]', 'Peso corporal', 2, 'Fique em pé, desça como se fosse sentar, mantenha o peso nos calcanhares'),
('770e8400-e29b-41d4-a716-446655440002', 'Flexão de braço', 'Peito', '["peitoral", "tríceps", "ombros"]', 'Peso corporal', 2, 'Posição de prancha, desça o corpo mantendo alinhamento'),
('770e8400-e29b-41d4-a716-446655440003', 'Supino reto', 'Peito', '["peitoral", "tríceps", "ombros"]', 'Barra e pesos', 3, 'Deitado no banco, abaixe a barra até o peito e empurre para cima');

-- Insert sample workouts
INSERT INTO workouts (id, trainer_id, client_id, name, description, exercises, status) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Treino A - Pernas', 'Treino focado em membros inferiores', '[{"exercise_id": "770e8400-e29b-41d4-a716-446655440001", "sets": 3, "reps": 12, "rest": 60}]', 'scheduled'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'Treino B - Peito', 'Treino focado em peitoral', '[{"exercise_id": "770e8400-e29b-41d4-a716-446655440002", "sets": 3, "reps": 10, "rest": 90}]', 'scheduled');

-- Insert sample meal plans
INSERT INTO meal_plans (id, trainer_id, client_id, name, description, meals, total_calories, start_date, end_date) VALUES
('aa0e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Plano Hipocalórico', 'Plano alimentar para redução de peso', '[{"day": "segunda", "meals": [{"time": "08:00", "description": "Ovos mexidos"}]}]', 1800, '2024-02-01', '2024-03-01');

-- Insert sample foods
INSERT INTO foods (id, name, category, calories_per_100g, proteins_per_100g, carbs_per_100g, fats_per_100g) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Peito de Frango', 'Proteína', 165, 31.0, 0.0, 3.6),
('990e8400-e29b-41d4-a716-446655440002', 'Arroz Integral', 'Carboidrato', 111, 2.6, 23.0, 0.9),
('990e8400-e29b-41d4-a716-446655440003', 'Brócolis', 'Vegetais', 34, 2.8, 7.0, 0.4);

-- Insert sample physical assessments
INSERT INTO physical_assessments (id, client_id, trainer_id, assessment_date, weight, height, body_fat_percentage, muscle_mass, measurements) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 75.5, 175.0, 18.5, 32.0, '{"chest": 95, "waist": 82, "hips": 98}'),
('bb0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '2024-01-20', 65.2, 162.0, 22.3, 28.5, '{"chest": 88, "waist": 70, "hips": 92}');

-- Insert sample messages
INSERT INTO messages (id, sender_id, receiver_id, content, message_type, is_read) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Bem-vindo à plataforma! Vamos começar o seu plano de treinos hoje.', 'text', 1),
('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Obrigado! Estou animado.', 'text', 0);

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, category, priority, metadata) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Treino Agendado', 'Você tem um treino agendado para hoje às 14h', 'workout', 'medium', '{"workout_id": "880e8400-e29b-41d4-a716-446655440001"}'),
('dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Avaliação Física', 'Está na hora de fazer sua avaliação física mensal', 'assessment', 'high', '{"assessment_due": "2024-02-01"}');

-- Insert sample subscriptions
INSERT INTO subscriptions (id, client_id, trainer_id, plan_name, amount, billing_cycle, status, started_at, expires_at) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Plano Premium', 299.90, 'monthly', 'active', '2024-01-01 00:00:00', '2024-02-01 00:00:00');

-- Insert sample workout sessions
INSERT INTO workout_sessions (id, workout_id, client_id, started_at, completed_at, duration_minutes, exercises_completed, rating) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-01-25 14:00:00', '2024-01-25 14:45:00', 45, '[{"exercise_id": "770e8400-e29b-41d4-a716-446655440001", "completed_sets": 3}]', 5);

-- Insert sample file uploads
INSERT INTO file_uploads (id, user_id, file_name, file_path, file_type, file_size, upload_purpose) VALUES
('110e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'avatar-trainer1.png', '/uploads/avatars/trainer1.png', 'image/png', 58231, 'avatar'),
('110e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'assessment-joao.pdf', '/uploads/assessments/joao-2024-01.pdf', 'application/pdf', 102400, 'document');

