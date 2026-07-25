import pg from 'pg';
const { Client } = pg;

const hosts = [
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com'
];

async function tryHost(host) {
  const connectionString = `postgres://postgres.reldnmbcyyndqctopmix:sp_QhkKhqs9BZBQ@${host}:6543/postgres`;
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('SUCCESS CONNECTED TO:', host);
    
    await client.query(`
      CREATE OR REPLACE FUNCTION enforce_paid_stage()
      RETURNS TRIGGER AS $$
      BEGIN
        IF LOWER(NEW.status) = 'paid' THEN
          NEW.stage := 'paid';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trg_enforce_paid_stage ON invoices;
      CREATE TRIGGER trg_enforce_paid_stage
      BEFORE INSERT OR UPDATE ON invoices
      FOR EACH ROW
      EXECUTE FUNCTION enforce_paid_stage();
    `);

    const updateRes = await client.query(`
      UPDATE invoices SET stage = 'paid' WHERE LOWER(status) = 'paid';
    `);
    console.log(`UPDATED ${updateRes.rowCount} paid rows to stage='paid'!`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`Failed for ${host}:`, err.message);
    await client.end();
    return false;
  }
}

async function main() {
  for (const host of hosts) {
    const ok = await tryHost(host);
    if (ok) break;
  }
}

main();
