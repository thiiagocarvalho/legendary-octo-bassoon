CREATE TABLE "HealthProfileHistory" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "restrictions" TEXT NOT NULL,
    "goals" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HealthProfileHistory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "HealthProfileHistory" ADD CONSTRAINT "HealthProfileHistory_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "HealthProfileHistory_studentId_createdAt_idx" ON "HealthProfileHistory"("studentId", "createdAt");
