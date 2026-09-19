import "dotenv/config";

export const envVarible = {
  Port: process.env.PORT,
  odoo_url: process.env.ODOO_URL,
  odoo_Db: process.env.ODOO_DB,
  odoo_username: process.env.ODOO_USERNAME,
  odoo_apikey: process.env.ODOO_API_KEY,
};
