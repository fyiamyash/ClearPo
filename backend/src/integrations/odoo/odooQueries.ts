export async function getPurchaseOrder(vendor?: string, poNumber?: string) {
  if (!vendor && !poNumber) {
    throw new Error(
      "Require atleast PO number | Vendor name to fetch PO from ERP!",
    );
    return -1;
  }
  if(poNumber || (poNumber && vendor)){
    
  }
}
