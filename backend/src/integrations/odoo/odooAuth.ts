import axios from "axios";
import { envVarible } from "../../config/envCustom";

export async function authenticateOdoo() {
  const url = envVarible.odoo_url;
  const db = envVarible.odoo_Db;
  const username = envVarible.odoo_username;
  const apikey = envVarible.odoo_apikey;
  const response = await axios.post(`${url}/jsonrpc`, {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "common",
      method: "authenticate",
      args: [db, username, apikey, {}],
    },
    id: Date.now(),
  });
  return response.data.result;
}
