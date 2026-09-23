export type incomingData = {
  poNumber?: string;
  vendor?: string;
};

export type receiptType = {
  id: number;
  name: string;
  origin: string;
  state: string;
  partner_id: any[];
  move_ids: any;
  move_line_ids: any;
  purchase_id: any;
  date_done: string;
};

export type bills = {
  id: number;
  name: string;
  ref: string | false;
  state: "draft" | "posted" | "cancel";
  payment_state: string;
  amount_total: number;
  amount_residual: number;
  invoice_date: string | false;
  partner_id: [number, string];
};
