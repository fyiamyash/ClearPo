export type emailSyncJob = {
  emailId: string;
  fileName: string;
  size: number;
  location: string;
};

export type pdfExtraction = {
  invoiceId: string;
  location: string;
  size: number;
};

export type reconciliation_type = {
  supplier_Email: string;
  supplier_name: string;
  invoice_number: string;
  total_amount: number;
  purchase_order: string;
  lineItems: [
    {
      product: string;
      quantity: number;
      unit_price: number;
      total_amount: number;
    },
  ];
};
