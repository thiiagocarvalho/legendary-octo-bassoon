ALTER TABLE "Enrollment" ADD COLUMN "classSlotId" TEXT;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_classSlotId_fkey" FOREIGN KEY ("classSlotId") REFERENCES "ClassSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
