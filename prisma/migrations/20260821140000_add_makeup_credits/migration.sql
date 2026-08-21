CREATE TYPE "MakeupCreditStatus" AS ENUM ('AVAILABLE', 'USED', 'CANCELED');

CREATE TABLE "MakeupCredit" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "sourceBookingId" TEXT NOT NULL,
  "usedBookingId" TEXT,
  "status" "MakeupCreditStatus" NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "usedAt" TIMESTAMP(3),
  CONSTRAINT "MakeupCredit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MakeupCredit_sourceBookingId_key" ON "MakeupCredit"("sourceBookingId");
CREATE UNIQUE INDEX "MakeupCredit_usedBookingId_key" ON "MakeupCredit"("usedBookingId");
ALTER TABLE "MakeupCredit" ADD CONSTRAINT "MakeupCredit_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MakeupCredit" ADD CONSTRAINT "MakeupCredit_sourceBookingId_fkey" FOREIGN KEY ("sourceBookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MakeupCredit" ADD CONSTRAINT "MakeupCredit_usedBookingId_fkey" FOREIGN KEY ("usedBookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
