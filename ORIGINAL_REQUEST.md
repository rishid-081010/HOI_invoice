# Original User Request

## Initial Request — 2026-07-24T15:23:16Z

Build a Node.js/Express backend that connects to a specified Google Sheet to act as a CRM database, checks for overdue invoices daily, triggers tiered n8n webhooks for automated email follow-ups, and serves API endpoints for a React frontend dashboard.

Working directory: c:\Users\Rishi D\.antigravity\extensions\collections-agent
Integrity mode: development

## Requirements

### R1. Google Sheets Schema & Backend Integration
Define a strict data schema for the Google Sheet (including exact column names, data types, and exact date structures like DD-MM-YYYY) and implement a backend service to read/write from the provided Google Sheet URL. Connect this backend to the React frontend dashboard so the dashboard displays live Google Sheets data.

### R2. Overdue Evaluation Script & Logic
Write a backend script that checks invoice due dates and categorizes them into stages:
- 1-3 days overdue: Stage 1 (Friendly reminder)
- 4-10 days overdue: Stage 2 (Formal reminder)
- >10 days overdue: Stage 3 (Strict reminder + warning/termination of service)

### R3. API Endpoints & n8n Webhook Integration
Build API endpoints for the frontend to interact with the backend. Implement logic that triggers a POST request to the provided n8n webhook URL with the appropriate payload (invoice details, client info, appropriate reminder text based on stage, and a payment link) whenever an invoice falls into one of the overdue categories.

### R4. Provided Resources
- Google Sheet URL: `https://docs.google.com/spreadsheets/d/19Fz-qRFjfmwldXyCupjLGOzoS5o0pOZ_NwUnAnIZEXU/edit?usp=sharing`
- n8n Webhook URL: `https://rishielevyx.app.n8n.cloud/webhook/d98a9038-029a-498b-b7c3-b870568fd127`

## Acceptance Criteria

### Schema & Data Handling
- [ ] A document or configuration exists explicitly defining the column names, data types, and date structures for the Google Sheet.
- [ ] The backend successfully authenticates and fetches rows from the provided Google Sheet.

### Overdue Logic & Webhooks
- [ ] A test script can be executed that processes mock invoices and correctly identifies them as Stage 1, Stage 2, or Stage 3 based on their dates.
- [ ] The backend successfully sends a POST request to the n8n webhook URL containing the client email, invoice amount, overdue stage, and payment link.

### Frontend Integration
- [ ] The React dashboard successfully fetches data from the backend API endpoints and displays the synced Google Sheets data instead of hardcoded mocks.
