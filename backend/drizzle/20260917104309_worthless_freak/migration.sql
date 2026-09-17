CREATE TYPE "actor" AS ENUM('SYSTEM', 'ADMIN');--> statement-breakpoint
CREATE TYPE "status_Enum" AS ENUM('RECEIVED', 'EXTRACTING', 'RECONCILING', 'REVIEW_REQUIRED', 'READY_FOR_PAYMENT', 'PAYMENT_PROCESSING', 'PAID', 'BLOCKED', 'FAILED');--> statement-breakpoint
CREATE TABLE "AgentRun" (
	"id" uuid PRIMARY KEY,
	"invoiceId" uuid,
	"reconcileId" uuid,
	"startedAt" timestamp with time zone NOT NULL,
	"completedAt" timestamp with time zone NOT NULL,
	"result" varchar
);
--> statement-breakpoint
CREATE TABLE "Human_Review" (
	"id" uuid PRIMARY KEY,
	"invoiceId" uuid NOT NULL,
	"decision" varchar NOT NULL,
	"reviewer" varchar,
	"reason" varchar,
	"createdAt" timestamp with time zone NOT NULL,
	"resolvedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Invoice" (
	"id" uuid PRIMARY KEY,
	"location" varchar NOT NULL,
	"filename" varchar NOT NULL,
	"supplier_Email" varchar,
	"supplier_name" varchar,
	"invoice_number" varchar,
	"total_amount" varchar,
	"purchase_order" varchar,
	"status" "status_Enum",
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Invoice_Events" (
	"id" integer PRIMARY KEY,
	"invoiceId" uuid,
	"type" varchar,
	"actor" "actor",
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Reconcile" (
	"id" uuid PRIMARY KEY,
	"invoiceId" uuid,
	"result" varchar,
	"startedAt" timestamp with time zone NOT NULL,
	"completedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_invoiceId_Invoice_id_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id");--> statement-breakpoint
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_reconcileId_Reconcile_id_fkey" FOREIGN KEY ("reconcileId") REFERENCES "Reconcile"("id");--> statement-breakpoint
ALTER TABLE "Human_Review" ADD CONSTRAINT "Human_Review_invoiceId_Invoice_id_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id");--> statement-breakpoint
ALTER TABLE "Invoice_Events" ADD CONSTRAINT "Invoice_Events_invoiceId_Invoice_id_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id");--> statement-breakpoint
ALTER TABLE "Reconcile" ADD CONSTRAINT "Reconcile_invoiceId_Invoice_id_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id");