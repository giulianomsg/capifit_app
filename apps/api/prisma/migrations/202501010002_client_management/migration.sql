-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL', 'CUSTOM');
CREATE TYPE "PaymentStatus" AS ENUM ('ON_TIME', 'PENDING', 'LATE');
CREATE TYPE "ActivityLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'INACTIVE');
CREATE TYPE "TrainerClientStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED', 'INVITED');

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP WITH TIME ZONE,
    "gender" TEXT,
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'MONTHLY',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'ON_TIME',
    "lastWorkoutAt" TIMESTAMP WITH TIME ZONE,
    "nextAssessmentAt" TIMESTAMP WITH TIME ZONE,
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "activityLevel" "ActivityLevel" NOT NULL DEFAULT 'MEDIUM',
    "experienceLevel" TEXT,
    "goals" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "medicalConditions" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainerClient" (
    "id" TEXT PRIMARY KEY,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "TrainerClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainerClient_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainerClient_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX "TrainerClient_clientId_idx" ON "TrainerClient" ("clientId");
CREATE UNIQUE INDEX "TrainerClient_trainerId_clientId_key" ON "TrainerClient" ("trainerId", "clientId");

-- Trigger to update updatedAt
CREATE TRIGGER set_client_profile_updated_at
BEFORE UPDATE ON "ClientProfile"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_trainer_client_updated_at
BEFORE UPDATE ON "TrainerClient"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
