-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'COMPLETED', 'MISSED');
CREATE TYPE "AssessmentType" AS ENUM ('INITIAL', 'FOLLOW_UP', 'BODY_COMPOSITION', 'MEASUREMENTS', 'PHOTOS', 'DEXA_SCAN', 'BIOIMPEDANCE', 'COMPLETE', 'OTHER');
CREATE TYPE "NutritionPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- AlterTable ClientProfile
ALTER TABLE "ClientProfile"
  ADD COLUMN "heightCm" DOUBLE PRECISION,
  ADD COLUMN "weightKg" DOUBLE PRECISION;

-- CreateTable AssessmentTemplate
CREATE TABLE "AssessmentTemplate" (
  "id" TEXT PRIMARY KEY,
  "trainerId" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" "AssessmentType" NOT NULL DEFAULT 'COMPLETE',
  "metrics" JSONB NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssessmentTemplate_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "AssessmentTemplate_trainerId_idx" ON "AssessmentTemplate"("trainerId");
CREATE INDEX "AssessmentTemplate_isDefault_idx" ON "AssessmentTemplate"("isDefault");

-- CreateTable Assessment
CREATE TABLE "Assessment" (
  "id" TEXT PRIMARY KEY,
  "trainerId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "templateId" TEXT,
  "status" "AssessmentStatus" NOT NULL DEFAULT 'SCHEDULED',
  "type" "AssessmentType" NOT NULL DEFAULT 'COMPLETE',
  "scheduledFor" TIMESTAMP WITH TIME ZONE,
  "performedAt" TIMESTAMP WITH TIME ZONE,
  "notes" TEXT,
  "metrics" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP WITH TIME ZONE,
  CONSTRAINT "Assessment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Assessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Assessment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "AssessmentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "Assessment_trainerId_idx" ON "Assessment"("trainerId");
CREATE INDEX "Assessment_clientId_idx" ON "Assessment"("clientId");
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");
CREATE INDEX "Assessment_scheduledFor_idx" ON "Assessment"("scheduledFor");
CREATE INDEX "Assessment_performedAt_idx" ON "Assessment"("performedAt");

-- CreateTable MeasurementRecord
CREATE TABLE "MeasurementRecord" (
  "id" TEXT PRIMARY KEY,
  "trainerId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "assessmentId" TEXT,
  "recordedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "weightKg" DOUBLE PRECISION,
  "heightCm" DOUBLE PRECISION,
  "bodyFat" DOUBLE PRECISION,
  "muscleMass" DOUBLE PRECISION,
  "chest" DOUBLE PRECISION,
  "waist" DOUBLE PRECISION,
  "hip" DOUBLE PRECISION,
  "thigh" DOUBLE PRECISION,
  "bicep" DOUBLE PRECISION,
  "forearm" DOUBLE PRECISION,
  "calf" DOUBLE PRECISION,
  "neck" DOUBLE PRECISION,
  "notes" TEXT,
  "data" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeasurementRecord_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MeasurementRecord_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MeasurementRecord_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "MeasurementRecord_clientId_idx" ON "MeasurementRecord"("clientId");
CREATE INDEX "MeasurementRecord_trainerId_idx" ON "MeasurementRecord"("trainerId");
CREATE INDEX "MeasurementRecord_recordedAt_idx" ON "MeasurementRecord"("recordedAt");

-- CreateTable ProgressPhoto
CREATE TABLE "ProgressPhoto" (
  "id" TEXT PRIMARY KEY,
  "trainerId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "assessmentId" TEXT,
  "capturedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "storagePath" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProgressPhoto_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProgressPhoto_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProgressPhoto_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "ProgressPhoto_clientId_idx" ON "ProgressPhoto"("clientId");
CREATE INDEX "ProgressPhoto_assessmentId_idx" ON "ProgressPhoto"("assessmentId");
CREATE INDEX "ProgressPhoto_capturedAt_idx" ON "ProgressPhoto"("capturedAt");

-- CreateTable AssessmentAttachment
CREATE TABLE "AssessmentAttachment" (
  "id" TEXT PRIMARY KEY,
  "trainerId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "assessmentId" TEXT,
  "storagePath" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "uploadedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssessmentAttachment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AssessmentAttachment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AssessmentAttachment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "AssessmentAttachment_clientId_idx" ON "AssessmentAttachment"("clientId");
CREATE INDEX "AssessmentAttachment_trainerId_idx" ON "AssessmentAttachment"("trainerId");
CREATE INDEX "AssessmentAttachment_uploadedAt_idx" ON "AssessmentAttachment"("uploadedAt");

-- CreateTable Food
CREATE TABLE "Food" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "category" TEXT NOT NULL,
  "servingSize" INTEGER NOT NULL DEFAULT 100,
  "calories" INTEGER NOT NULL,
  "protein" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "carbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "fat" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "fiber" DOUBLE PRECISION,
  "sugar" DOUBLE PRECISION,
  "sodium" DOUBLE PRECISION,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "origin" TEXT NOT NULL DEFAULT 'custom',
  "createdById" TEXT,
  CONSTRAINT "Food_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "Food_category_idx" ON "Food"("category");
CREATE INDEX "Food_origin_idx" ON "Food"("origin");

-- CreateTable NutritionPlan
CREATE TABLE "NutritionPlan" (
  "id" TEXT PRIMARY KEY,
  "trainerId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "NutritionPlanStatus" NOT NULL DEFAULT 'DRAFT',
  "caloriesGoal" INTEGER,
  "macros" JSONB,
  "startDate" TIMESTAMP WITH TIME ZONE,
  "endDate" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NutritionPlan_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "NutritionPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "NutritionPlan_trainerId_idx" ON "NutritionPlan"("trainerId");
CREATE INDEX "NutritionPlan_clientId_idx" ON "NutritionPlan"("clientId");
CREATE INDEX "NutritionPlan_status_idx" ON "NutritionPlan"("status");

-- CreateTable Meal
CREATE TABLE "Meal" (
  "id" TEXT PRIMARY KEY,
  "planId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "scheduledAt" TIMESTAMP WITH TIME ZONE,
  "notes" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Meal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "NutritionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Meal_planId_idx" ON "Meal"("planId");
CREATE INDEX "Meal_order_idx" ON "Meal"("order");

-- CreateTable MealItem
CREATE TABLE "MealItem" (
  "id" TEXT PRIMARY KEY,
  "mealId" TEXT NOT NULL,
  "foodId" TEXT,
  "customName" TEXT,
  "quantity" DOUBLE PRECISION DEFAULT 0,
  "unit" TEXT DEFAULT 'g',
  "notes" TEXT,
  "macros" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MealItem_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MealItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "MealItem_mealId_idx" ON "MealItem"("mealId");
CREATE INDEX "MealItem_foodId_idx" ON "MealItem"("foodId");

-- CreateTable NutritionAttachment
CREATE TABLE "NutritionAttachment" (
  "id" TEXT PRIMARY KEY,
  "trainerId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "uploadedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NutritionAttachment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "NutritionAttachment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "NutritionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "NutritionAttachment_planId_idx" ON "NutritionAttachment"("planId");
CREATE INDEX "NutritionAttachment_trainerId_idx" ON "NutritionAttachment"("trainerId");
CREATE INDEX "NutritionAttachment_uploadedAt_idx" ON "NutritionAttachment"("uploadedAt");
