CREATE TYPE "ManualPaymentMethod" AS ENUM ('PIX', 'CASH', 'CARD_IN_PERSON');

CREATE TABLE "ManualPayment" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "method" "ManualPaymentMethod" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "monthsCovered" INTEGER NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "receivedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ManualPayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ManualPaymentInvoice" (
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    CONSTRAINT "ManualPaymentInvoice_pkey" PRIMARY KEY ("paymentId", "invoiceId")
);

ALTER TABLE "ManualPayment" ADD CONSTRAINT "ManualPayment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManualPaymentInvoice" ADD CONSTRAINT "ManualPaymentInvoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "ManualPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManualPaymentInvoice" ADD CONSTRAINT "ManualPaymentInvoice_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invoice" DROP COLUMN "checkoutUrl", DROP COLUMN "externalId";
