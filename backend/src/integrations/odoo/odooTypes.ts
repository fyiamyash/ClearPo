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
