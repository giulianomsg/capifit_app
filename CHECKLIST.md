# CHECKLIST DE MÓDULOS — CAPIFIT_APP

| Módulo | Status | Observações |
| --- | --- | --- |
| Autenticação & Sessão | ⚠️ Parcial | Backend expõe login JWT integrado ao MySQL (`backend/routes/auth.js`), porém faltam fluxos de recuperação de senha e expiração/refresh no frontend. |
| Usuários (CRUD) | ⚠️ Parcial | API com consultas reais (`backend/routes/users.js`) pronta; UI ainda não consome dados dinâmicos e mantém componentes mockados. |
| Perfis e Permissões (RBAC) | ❌ Falta | Apenas campo `role` nos usuários; não há telas ou políticas de permissão aplicadas. |
| Menus Dinâmicos | ⚠️ Parcial | Endpoint `/api/menus` criado e Sidebar busca dados (`src/components/ui/Sidebar.jsx`), porém faltam cadastros administrativos para edição e caching. |
| Dashboard | ❌ Falta | Telas usam dados artificiais; não há agregações reais de métricas no backend. |
| Alunos | ⚠️ Parcial | Rotas REST para `clients` implementadas (`backend/routes/clients.js`), mas página `gerenciar-alunos` permanece mockada. |
| Treinos | ⚠️ Parcial | API de treinos usa MySQL (`backend/routes/workouts.js`); interface continua utilizando dados estáticos. |
| Dietas / Planos Alimentares | ❌ Falta | Não há rotas ou telas conectadas; apenas componentes visuais com mocks. |
| Avaliações / Feedback | ❌ Falta | Nenhuma integração real com `physical_assessments`; UI segue com dados fictícios. |
| Exames / Uploads | ❌ Falta | Não existem endpoints ou armazenamento configurado para arquivos. |
| Chat (Socket.IO) | ⚠️ Parcial | Backend publica eventos e persiste mensagens (`backend/routes/messages.js`), porém UI mantém contatos e conversas mockadas sem se conectar ao socket. |
| Notificações (OneSignal) | ⚠️ Parcial | CRUD básico em `/api/notifications`; integrações push externas e consumo na UI ainda ausentes. |
| Assinaturas / Planos | ❌ Falta | Sem rotas ou telas ativas; apenas referências visuais. |
| Relatórios | ❌ Falta | Nenhum endpoint ou componente funcional. |
| Configurações | ⚠️ Parcial | Somente formulários estáticos; falta persistência via API. |
| Logs / Auditoria | ❌ Falta | Não há logging estruturado nem histórico de ações de usuário. |
| Deploy / Scripts / Health | ✅ Funciona | Script `scripts/deploy/install_or_update.sh`, healthcheck `/api/health` e template Nginx atualizados para produção. |

## Observações Gerais
- **Banco de dados**: conexão centralizada em `backend/lib/db.js` com suporte a MySQL/PostgreSQL, porém variáveis `.env` precisam estar configuradas e não há migrations automatizadas.
- **Mocks remanescentes**: a maioria das páginas React em `src/pages/**` continua com dados estáticos; é necessário substituir por chamadas à API.
- **Testes**: não há suíte automatizada; recomenda-se incluir testes de integração para rotas críticas.
- **Próximos passos**: implementar camada de serviços frontend, mover lógicas de dashboard para consultas SQL, conectar chat em tempo real à UI e concluir RBAC.
