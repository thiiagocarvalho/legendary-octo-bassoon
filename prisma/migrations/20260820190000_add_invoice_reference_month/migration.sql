ALTER TABLE "Invoice" ADD COLUMN "referenceMonth" TIMESTAMP(3);

UPDATE "Invoice"
SET "referenceMonth" = date_trunc('month', "dueDate");

ALTER TABLE "Invoice" ALTER COLUMN "referenceMonth" SET NOT NULL;

CREATE UNIQUE INDEX "Invoice_enrollmentId_referenceMonth_key" ON "Invoice"("enrollmentId", "referenceMonth");
