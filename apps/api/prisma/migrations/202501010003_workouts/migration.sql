-- CreateEnum
CREATE TYPE "WorkoutStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "WorkoutDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "ExerciseCategory" AS ENUM ('STRENGTH', 'CARDIO', 'FLEXIBILITY', 'MOBILITY', 'BALANCE');
CREATE TYPE "MuscleGroup" AS ENUM ('CHEST', 'BACK', 'SHOULDERS', 'LEGS', 'ARMS', 'CORE', 'FULL_BODY', 'GLUTES', 'OTHER');

-- CreateTable Exercise
CREATE TABLE "Exercise" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "instructions" TEXT,
    "category" "ExerciseCategory" NOT NULL,
    "primaryMuscle" "MuscleGroup" NOT NULL,
    "secondaryMuscle" "MuscleGroup",
    "equipment" TEXT,
    "difficulty" "WorkoutDifficulty" NOT NULL DEFAULT 'INTERMEDIATE',
    "videoUrl" TEXT,
    "imageUrl" TEXT,
    "caloriesPerSet" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    "isPublic" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdById" TEXT,
    CONSTRAINT "Exercise_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable Workout
CREATE TABLE "Workout" (
    "id" TEXT PRIMARY KEY,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "WorkoutDifficulty" NOT NULL DEFAULT 'INTERMEDIATE',
    "status" "WorkoutStatus" NOT NULL DEFAULT 'DRAFT',
    "frequency" TEXT DEFAULT 'weekly',
    "schedule" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "estimatedDuration" INTEGER,
    "estimatedCalories" INTEGER,
    "isTemplate" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    CONSTRAINT "Workout_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Workout_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable WorkoutBlock
CREATE TABLE "WorkoutBlock" (
    "id" TEXT PRIMARY KEY,
    "workoutId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkoutBlock_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable WorkoutExercise
CREATE TABLE "WorkoutExercise" (
    "id" TEXT PRIMARY KEY,
    "blockId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "restSeconds" INTEGER,
    "tempo" TEXT,
    "instructions" TEXT,
    "estimatedTempo" INTEGER,
    CONSTRAINT "WorkoutExercise_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "WorkoutBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable SessionLog
CREATE TABLE "SessionLog" (
    "id" TEXT PRIMARY KEY,
    "workoutId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "performedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMinutes" INTEGER,
    "perceivedEffort" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionLog_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX "Exercise_category_idx" ON "Exercise" ("category");
CREATE INDEX "Exercise_primaryMuscle_idx" ON "Exercise" ("primaryMuscle");
CREATE INDEX "Exercise_deletedAt_idx" ON "Exercise" ("deletedAt");
CREATE INDEX "Workout_trainerId_idx" ON "Workout" ("trainerId");
CREATE INDEX "Workout_clientId_idx" ON "Workout" ("clientId");
CREATE INDEX "Workout_status_idx" ON "Workout" ("status");
CREATE INDEX "Workout_isTemplate_idx" ON "Workout" ("isTemplate");
CREATE INDEX "Workout_deletedAt_idx" ON "Workout" ("deletedAt");
CREATE INDEX "WorkoutBlock_workoutId_idx" ON "WorkoutBlock" ("workoutId");
CREATE INDEX "WorkoutBlock_order_idx" ON "WorkoutBlock" ("order");
CREATE INDEX "WorkoutExercise_blockId_idx" ON "WorkoutExercise" ("blockId");
CREATE INDEX "WorkoutExercise_exerciseId_idx" ON "WorkoutExercise" ("exerciseId");
CREATE INDEX "SessionLog_clientId_idx" ON "SessionLog" ("clientId");
CREATE INDEX "SessionLog_workout_performed_idx" ON "SessionLog" ("workoutId", "performedAt");

-- Triggers
CREATE TRIGGER set_exercise_updated_at
BEFORE UPDATE ON "Exercise"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_workout_updated_at
BEFORE UPDATE ON "Workout"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_workout_block_updated_at
BEFORE UPDATE ON "WorkoutBlock"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
