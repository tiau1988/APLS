const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.NEON_DATABASE_URL);

async function checkDatabaseStructure() {
  try {
    console.log('Checking registrations table structure...');
    
    const result = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'registrations' 
      AND table_schema = 'public' 
      ORDER BY ordinal_position
    `;
    
    console.log('\nRegistrations table columns:');
    result.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check specifically for payment_slip_url column
    const paymentSlipColumn = result.find(col => col.column_name === 'payment_slip_url');
    if (paymentSlipColumn) {
      console.log('\n✅ payment_slip_url column exists!');
      console.log(`   Type: ${paymentSlipColumn.data_type}`);
      console.log(`   Nullable: ${paymentSlipColumn.is_nullable}`);
    } else {
      console.log('\n❌ payment_slip_url column NOT found!');
    }
    
    // Also check for any data in the payment_slip_url column
    const dataCheck = await sql`
      SELECT COUNT(*) as total_records,
             COUNT(payment_slip_url) as records_with_payment_slip,
             COUNT(CASE WHEN payment_slip_url IS NOT NULL AND payment_slip_url != '' THEN 1 END) as records_with_valid_payment_slip
      FROM registrations
    `;
    
    console.log('\nData analysis:');
    console.log(`- Total records: ${dataCheck[0].total_records}`);
    console.log(`- Records with payment_slip_url: ${dataCheck[0].records_with_payment_slip}`);
    console.log(`- Records with valid payment_slip_url: ${dataCheck[0].records_with_valid_payment_slip}`);
    
  } catch (error) {
    console.error('Error checking database structure:', error.message);
  }
}

checkDatabaseStructure();