import axios from "axios";
import { envVarible } from "../../config/envCustom";

export async function odooCall(
  model: string,
  method: string,
  args: unknown[],
  kwargs: Record<string, unknown> = {},
) {
  const url = envVarible.odoo_url;
  const db = envVarible.odoo_Db;
  const username = envVarible.odoo_username;
  const apikey = envVarible.odoo_apikey;
  const response = await axios.post(url!, {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "object",
      method: "execute_kw",
      args: [db, username, apikey, model, method, args, kwargs],
    },
    id: Date.now(),
  });

  if (response.data.error) {
    throw new Error(
      response.data.error.data?.message ?? "Odoo API request failed",
    );
  }
  return response.data.result;
}
