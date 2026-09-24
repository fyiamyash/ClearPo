import { odooCall } from "./odooCall";
import { getPurchaseOrder } from "./odooPurchaseOrder";

export async function getReceipts(receiptIds: number[]) {
  if (!receiptIds.length) {
    return [];
  }
  const result = await odooCall("stock.picking", "search_read", [[["id", "in", receiptIds]]], {
    fields: [
      "id",
      "name",
      "origin",
      "state",
      "partner_id",
      "move_ids",
      "move_line_ids",
      "purchase_id",
      "date_done",
    ],
  });
  return result;
}

export async function getStockRecieved(receiptIds: number[]) {
  if (!receiptIds.length) {
    return [];
  }
  const result = await odooCall("stock.picking", "search_read", [[["id", "in", receiptIds]]], {
    fields: ["id", "product_id", "product_uom_qty", "quantity", "state"],
  });
  return result;
}

export async function getVendorBills(invoiceIds: number[]) {
  return await odooCall(
    "account.move",
    "search_read",
    [
      [
        ["id", "in", invoiceIds],
        ["move_type", "=", "in_invoice"],
      ],
    ],
    {
      fields: [
        "id",
        "name",
        "ref",
        "state",
        "payment_state",
        "amount_total",
        "amount_residual",
        "invoice_date",
        "partner_id",
      ],
    },
  );
}

export async function createBill(PurchaseOrder: string) {
  const checkPo = await getPurchaseOrder({ poNumber: PurchaseOrder });
  console.log("Feecthed pruchase order detials");
  if (!checkPo) {
    console.error("There is purchase order exist with Id:", PurchaseOrder);
    return;
  }
  if (checkPo.invoiceIds.length) {
    console.log("Invoice for this Purchase order number is already generated!");
  } else {
    console.log("Creating invoice for this Purchase order number:", PurchaseOrder);
    await odooCall("purchase.order", "action_create_invoice", [checkPo.id], {
      context: {
        create_bill: true,
      },
    });
    console.log("Bill created for Purchase order :", PurchaseOrder);
  }

  const bill = await getVendorBills(checkPo.invoiceIds);

  return bill;
}

export async function payVendorBill(billId: number, amount?: number) {
  const bills = await odooCall("account.move", "search_read", [[["id", "=", billId]]], {
    fields: ["id", "name", "state", "payment_state", "amount_total", "amount_residual"],
    limit: 1,
  });

  if (!bills.length) {
    throw new Error(`Bill ${billId} not found`);
  }

  const bill = bills[0];

  if (bill.state !== "posted") {
    throw new Error(`Bill ${bill.name} is not posted`);
  }

  if (bill.payment_state === "paid") {
    throw new Error(`Bill ${bill.name} is already paid`);
  }

  const paymentAmount = amount ?? bill.amount_residual;

  // 2. Create payment registration wizard
  const wizardId = await odooCall(
    "account.payment.register",
    "create",
    [
      {
        amount: paymentAmount,
      },
    ],
    {
      context: {
        active_model: "account.move",
        active_ids: [bill.id],
      },
    },
  );

  const paymentResult = await odooCall(
    "account.payment.register",
    "action_create_payments",
    [[wizardId]],
    {
      context: {
        active_model: "account.move",
        active_ids: [bill.id],
      },
    },
  );

  const updatedBill = await odooCall("account.move", "search_read", [[["id", "=", bill.id]]], {
    fields: ["id", "name", "state", "payment_state", "amount_total", "amount_residual"],
    limit: 1,
  });

  return {
    paymentResult,
    bill: updatedBill[0],
  };
}

export async function postBill(billdate: string, purchaseOrder: string) {
  const poDetails = await getPurchaseOrder({ poNumber: purchaseOrder });
  if (!poDetails) {
    console.error("Purchase order does not exists");
    return;
  }

  const bills = await getVendorBills(poDetails.invoiceIds);

  if (!bills.length) {
    console.error(`Bill for purchaseId : ${purchaseOrder} does not exists`);
    return;
  }
  const bill = bills[0];
  if (bill.state === "posted") {
    console.log(`Bill ${bill.name} is already posted`);

    return bill;
  }
  if (bill.payment_state === "paid") {
    console.error(`Bill for purchaseId : ${purchaseOrder} already paid!`);
    return;
  }
  const setbillDate = await odooCall("account.move", "write", [
    [bill.id],
    {
      invoice_date: billdate,
    },
  ]);
  console.log("bill date is updated", setbillDate, " with bill date", billdate);
  if (setbillDate) {
    const posted = await odooCall("account.move", "action_post", [bill.id]);
    console.log(posted);
    const updatedBill = await odooCall(
      "account.move",
      "search_read",
      [[["id", "in", poDetails.invoiceIds]]],
      {
        fields: ["id", "name", "state", "payment_state", "amount_total", "amount_residual"],
      },
    );
    return updatedBill;
  } else {
    console.error("Bill date cannot be set!");
    return setbillDate;
  }
}
