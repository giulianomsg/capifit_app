const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const baseMenus = {
  trainer: [
    { label: 'Dashboard', path: '/dashboard-principal', icon: 'LayoutDashboard' },
    { label: 'Perfil', path: '/perfil-do-personal', icon: 'User' },
    { label: 'Alunos', path: '/gerenciar-alunos', icon: 'Users' },
    { label: 'Treinos', path: '/criar-treinos', icon: 'Dumbbell' },
    { label: 'Exercícios', path: '/exercise-library', icon: 'Book' },
    { label: 'Nutrição', path: '/nutrition-management', icon: 'Apple' },
    { label: 'Avaliações', path: '/physical-assessment-system', icon: 'FileText' },
    { label: 'Mensagens', path: '/chat-communication-hub', icon: 'MessageSquare' },
    { label: 'Relatórios', path: '/relatorios', icon: 'BarChart3' },
    { label: 'Configurações', path: '/configuracoes', icon: 'Settings' },
  ],
  client: [
    { label: 'Dashboard', path: '/dashboard-principal', icon: 'LayoutDashboard' },
    { label: 'Meu Perfil', path: '/client-profile', icon: 'User' },
    { label: 'Treinos', path: '/criar-treinos', icon: 'Dumbbell' },
    { label: 'Nutrição', path: '/nutrition-management', icon: 'Apple' },
    { label: 'Avaliações', path: '/physical-assessment-system', icon: 'FileText' },
    { label: 'Mensagens', path: '/chat-communication-hub', icon: 'MessageSquare' },
    { label: 'Notificações', path: '/notification-center', icon: 'Bell' },
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard-principal', icon: 'LayoutDashboard' },
    { label: 'Usuários', path: '/gerenciar-usuarios', icon: 'Users' },
    { label: 'Planos', path: '/assinaturas-planos', icon: 'CreditCard' },
    { label: 'Logs', path: '/logs-auditoria', icon: 'Shield' },
    { label: 'Configurações', path: '/configuracoes', icon: 'Settings' },
  ],
};

router.use(authMiddleware);

router.get('/', (req, res) => {
  const role = req.user?.role || 'trainer';
  const menus = baseMenus[role] || baseMenus.trainer;

  res.json({ menus });
});

module.exports = router;
