-- Supabase PostgreSQL Schema & Trigger Definitions

-- 1. Create Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  associated_person TEXT,
  client_email TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
  payment_link TEXT,
  stage TEXT DEFAULT 'No reminder',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PostgreSQL Trigger Function: Automatically set stage = 'paid' when status = 'paid'
CREATE OR REPLACE FUNCTION enforce_paid_stage()
RETURNS TRIGGER AS $$
BEGIN
  IF LOWER(NEW.status) = 'paid' THEN
    NEW.stage := 'paid';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach Trigger to invoices table
DROP TRIGGER IF EXISTS trg_enforce_paid_stage ON invoices;

CREATE TRIGGER trg_enforce_paid_stage
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION enforce_paid_stage();
