ALTER TABLE "Invoice" ADD COLUMN "externalId" TEXT;
CREATE UNIQUE INDEX "Invoice_externalId_key" ON "Invoice"("externalId");
