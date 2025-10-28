-- CreateTable
CREATE TABLE "Trainer" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Trainer_email_key" ON "Trainer"("email");

CREATE TRIGGER "Trainer_updatedAt" AFTER UPDATE ON "Trainer"
FOR EACH ROW
BEGIN
  UPDATE "Trainer" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = NEW."id";
END;

CREATE TABLE "Client" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

CREATE TRIGGER "Client_updatedAt" AFTER UPDATE ON "Client"
FOR EACH ROW
BEGIN
  UPDATE "Client" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = NEW."id";
END;

CREATE TABLE "TrainerClientProfile" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "trainerId" INTEGER NOT NULL,
  "clientId" INTEGER NOT NULL,
  "goals" TEXT,
  "injuries" TEXT,
  "preferences" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrainerClientProfile_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainerClientProfile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "TrainerClientProfile_trainerId_clientId_key" ON "TrainerClientProfile"("trainerId", "clientId");

CREATE TRIGGER "TrainerClientProfile_updatedAt" AFTER UPDATE ON "TrainerClientProfile"
FOR EACH ROW
BEGIN
  UPDATE "TrainerClientProfile" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = NEW."id";
END;

CREATE TABLE "AuditTrail" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "entity" TEXT NOT NULL,
  "entityId" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "changes" TEXT,
  "performedBy" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "profileId" INTEGER,
  CONSTRAINT "AuditTrail_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TrainerClientProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "AuditTrail_entity_entityId_idx" ON "AuditTrail"("entity", "entityId");
