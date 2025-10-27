import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import AuthGuard from "components/AuthGuard";
import NotFound from "pages/NotFound";
import LandingPage from './pages/landing';
import PerfilDoPersonal from './pages/perfil-do-personal';
import DashboardPrincipal from './pages/dashboard-principal';
import LoginPage from './pages/login';
import GerenciarAlunos from './pages/gerenciar-alunos';
import CriarTreinos from './pages/criar-treinos';
import Register from './pages/register';
import FoodDatabase from './pages/food-database';
import NutritionManagement from './pages/nutrition-management';
import CreateMealPlan from './pages/create-meal-plan';
import PhysicalAssessmentSystem from './pages/physical-assessment-system';
import ChatCommunicationHub from './pages/chat-communication-hub';
import WorkoutSessionTracking from './pages/workout-session-tracking';
import ExerciseLibrary from './pages/exercise-library';
import ClientProfileManagement from './pages/client-profile-management';
import NotificationCenter from './pages/notification-center';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes - All dashboard pages require authentication */}
        <Route path="/dashboard-principal" element={<AuthGuard><DashboardPrincipal /></AuthGuard>} />
        <Route path="/perfil-do-personal" element={<AuthGuard><PerfilDoPersonal /></AuthGuard>} />
        <Route path="/gerenciar-alunos" element={<AuthGuard><GerenciarAlunos /></AuthGuard>} />
        <Route path="/criar-treinos" element={<AuthGuard><CriarTreinos /></AuthGuard>} />
        <Route path="/workout-session-tracking/:workoutId?" element={<AuthGuard><WorkoutSessionTracking /></AuthGuard>} />
        <Route path="/food-database" element={<AuthGuard><FoodDatabase /></AuthGuard>} />
        <Route path="/nutrition-management" element={<AuthGuard><NutritionManagement /></AuthGuard>} />
        <Route path="/create-meal-plan" element={<AuthGuard><CreateMealPlan /></AuthGuard>} />
        <Route path="/physical-assessment-system" element={<AuthGuard><PhysicalAssessmentSystem /></AuthGuard>} />
        <Route path="/chat-communication-hub" element={<AuthGuard><ChatCommunicationHub /></AuthGuard>} />
        <Route path="/exercise-library" element={<AuthGuard><ExerciseLibrary /></AuthGuard>} />
        <Route path="/client-profile-management/:clientId?" element={<AuthGuard><ClientProfileManagement /></AuthGuard>} />
        <Route path="/notification-center" element={<AuthGuard><NotificationCenter /></AuthGuard>} />
        
        {/* Route aliases for broken navigation links */}
        <Route path="/planos-alimentares" element={<AuthGuard><NutritionManagement /></AuthGuard>} />
        <Route path="/avaliacoes" element={<AuthGuard><PhysicalAssessmentSystem /></AuthGuard>} />
        <Route path="/mensagens" element={<AuthGuard><ChatCommunicationHub /></AuthGuard>} />
        <Route path="/relatorios" element={<AuthGuard><DashboardPrincipal /></AuthGuard>} />
        <Route path="/configuracoes" element={<AuthGuard><PerfilDoPersonal /></AuthGuard>} />
        <Route path="/notificacoes" element={<AuthGuard><NotificationCenter /></AuthGuard>} />
        
        {/* Client-specific routes (missing pages that need to be created) */}
        <Route path="/meu-treino" element={<AuthGuard><WorkoutSessionTracking /></AuthGuard>} />
        <Route path="/progresso" element={<AuthGuard><PhysicalAssessmentSystem /></AuthGuard>} />
        
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;