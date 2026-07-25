# Project: Collections Agent

## Architecture
- **Backend**: Express.js server running on Node.js.
  - Integration with Google Sheets CRM data (`https://docs.google.com/spreadsheets/d/19Fz-qRFjfmwldXyCupjLGOzoS5o0pOZ_NwUnAnIZEXU/edit?usp=sharing`).
  - Overdue Evaluation Engine (`Stage 1`: 1-3 days, `Stage 2`: 4-10 days, `Stage 3`: >10 days).
  - Tiered Webhook Dispatcher targeting n8n (`https://rishielevyx.app.n8n.cloud/webhook/d98a9038-029a-498b-b7c3-b870568fd127`).
- **Frontend**: React + TypeScript + Vite dashboard in `src/`.
  - Connects to backend API endpoints for live data sync.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Google Sheets Schema & Backend Integration | Schema definition, Express server setup, Google Sheets data reader | None | DONE |
| 2 | Overdue Evaluation Engine & Test Script | Overdue calculation logic (DD-MM-YYYY), stage classifier, CLI mock test script | M1 | DONE |
| 3 | API Endpoints & n8n Webhook Service | REST endpoints for invoices/summary, tiered n8n webhook POST dispatcher | M1, M2 | DONE |
| 4 | React Frontend Dashboard Sync | Connect React components to backend API endpoints, replace hardcoded data | M3 | DONE |
| 5 | Full Integration & Forensic Audit | End-to-end testing, static & runtime integrity audit | M4 | DONE |

## Interface Contracts
### Google Sheets CRM Data Schema
- Date format: `DD-MM-YYYY`
- Columns: `Invoice ID`, `Client Name`, `Client Email`, `Amount`, `Due Date`, `Status`, `Payment Link`, `Notes`

### Express API Endpoints
- `GET /api/invoices` -> Returns list of synced invoices from Google Sheet with overdue stage details.
- `GET /api/summary` -> Returns metrics summary (total invoices, total overdue, stage breakdown).
- `POST /api/evaluate` -> Executes overdue invoice evaluation and returns classified stages.
- `POST /api/trigger-webhook` -> Body: `{ invoiceId }` -> Triggers n8n webhook for specified invoice.

### n8n Webhook Payload Schema
- Target URL: `https://rishielevyx.app.n8n.cloud/webhook/d98a9038-029a-498b-b7c3-b870568fd127`
- Payload:
  ```json
  {
    "clientEmail": "client@example.com",
    "invoiceAmount": 1500.00,
    "overdueStage": "Stage 1",
    "reminderText": "Friendly reminder: Your invoice #INV-1001 of $1500.00 is 2 days overdue.",
    "paymentLink": "https://pay.example.com/inv-1001",
    "invoiceId": "INV-1001",
    "daysOverdue": 2
  }
  ```

## Code Layout
- `server/`: Node.js Express backend
  - `server/index.js`: Main Express application server
  - `server/schema.json`: Strict schema definition for Google Sheet data
  - `server/sheetsService.js`: Google Sheets fetcher service
  - `server/overdueEngine.js`: Evaluation logic & date calculations
  - `server/webhookService.js`: n8n webhook dispatcher
  - `server/testOverdue.js`: CLI test script for mock invoices
- `src/`: React frontend
  - `src/services/api.ts`: API client connecting to backend endpoints
  - `src/App.tsx`: Main dashboard component rendering synced data
