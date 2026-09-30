# ClearPo

ClearPo is an invoice review project. I built it to take an invoice PDF, extract the important details, compare them with records in an ERP system, and show the review status in a web interface.

The project has a TypeScript and Express backend and a React frontend. BullMQ and Redis handle background jobs, PostgreSQL stores invoice and review data, and Odoo provides the ERP records used during reconciliation.

## Architecture
<img width="3792" height="760" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/1032ebc5-af91-448e-9bc5-676fcb51a11b" />


## Invoice flow

1. The front end uploads a PDF to the backend. For now, the file is saved in the backend's `uploads` folder.
2. The backend puts the file details on a queue. The email sync worker creates an initial invoice record in PostgreSQL, so the invoice can appear in the front end while it is being processed.
3. A reviewer starts the flow. The backend reads the invoice record and queues a PDF extraction job.
4. The PDF extraction worker reads the file, uses a PDF parser to get its text, and sends that text to a small language model running locally. The model returns structured invoice details such as the supplier, invoice number, amount, and purchase order.
5. The extracted details are saved in PostgreSQL and sent to the reconciliation queue.
6. The reconciliation worker runs deterministic checks against the purchase order and related ERP records. These checks always run.
7. If the checks leave something unclear, the investigation agent looks up more information in Odoo. The agent has read only tools and cannot change ERP records or make payments. Clear cases do not need an agent call.
8. The policy engine uses the results to return a decision and its reason. The front end receives status, invoice data, and decision updates through server sent events.

## Project structure

```text
backend/
  src/
    controller/       API handlers
    db/               PostgreSQL schema and connection
    integrations/     Odoo access
    LLM/              PDF extraction and agent logic
    policyEngine/     Final decision rules
    queue/            BullMQ queues and Redis connections
    reconciliation/   Deterministic checks
    workers/          Email sync, extraction, and reconciliation workers
frontend/
  src/
    components/       Invoice list and detail view
    hooks/            Invoice API access
    pages/            Main workbench page
    store/            Invoice state
```

## Run locally

### Requirements

- Bun
- Node.js and npm
- Docker with Docker Compose
- PostgreSQL and Redis, or the services from `backend/docker-compose.yml`
- A local model server compatible with the chat completions API used by the backend
- An Odoo instance with the records you want to check

### Start supporting services

```bash
cd backend
docker compose up -d postgres redis odoo
```

### Configure the backend

Create `backend/.env` with the connection details for your local services:

```dotenv
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/clearpo
ODOO_URL=http://localhost:8069
ODOO_DB=your_odoo_database
ODOO_USERNAME=your_odoo_username
ODOO_API_KEY=your_odoo_api_key
```

The backend connects to Redis at `localhost:6379`. The PDF extraction code currently expects the local model service at `http://127.0.0.1:8080/v1/chat/completions` and uses a quantized Llama 3.2 3B Instruct model.

Install dependencies, create or update the database schema, and start the backend:

```bash
bun install
bunx drizzle-kit push
bun src/server.ts
```

Run those commands from the `backend` folder.

### Start the front end

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite. The front end currently calls the backend at `http://localhost:3000`.

## API routes

| Method | Route                   | Purpose                                                                                 |
| ------ | ----------------------- | --------------------------------------------------------------------------------------- |
| `POST` | `/upload`               | Upload an invoice PDF. Send the file as multipart form data with the field name `file`. |
| `GET`  | `/invoice`              | Get the invoice list.                                                                   |
| `POST` | `/startFlow/:invoiceId` | Start processing an invoice already in the database.                                    |
| `GET`  | `/timeline/:invoiceId`  | Open the server sent event stream for one invoice.                                      |

## Current status

The project currently stores PDFs on local disk. I plan to use blob storage for uploaded files in a production setup. Odoo is connected for ERP lookups. Slack integration is still in development.
