import pg from 'pg';

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  const columns = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'Order'
      AND column_name IN ('paymentStatus', 'paymentProvider', 'paidAt', 'paymentExpiresAt', 'paymentNotifiedAt')
    ORDER BY column_name
  `);
  const paymentAttemptTable = await client.query(`
    SELECT to_regclass('public."PaymentAttempt"') IS NOT NULL AS present
  `);
  const paymentStates = await client.query(`
    SELECT "paymentStatus"::text AS status, COUNT(*)::int AS count
    FROM "Order"
    GROUP BY 1
    ORDER BY 1
  `);

  console.log(JSON.stringify({
    columns: columns.rows.map((row) => row.column_name),
    paymentAttemptTable: paymentAttemptTable.rows[0].present,
    orderPaymentStates: paymentStates.rows,
  }, null, 2));
} finally {
  await client.end();
}
