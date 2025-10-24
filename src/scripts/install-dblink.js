/**
 * Script to install dblink extension
 */
const db = require('../config/database');

async function installDblink() {
  try {
    console.log('Installing dblink extension...');
    
    // Check if dblink extension exists
    const checkResult = await db.raw(`
      SELECT EXISTS(
        SELECT 1 FROM pg_extension WHERE extname = 'dblink'
      ) as exists;
    `);
    
    if (checkResult.rows[0].exists) {
      console.log('✓ dblink extension already exists');
      return;
    }
    
    // Install dblink extension
    await db.raw('CREATE EXTENSION IF NOT EXISTS dblink');
    
    console.log('✓ dblink extension installed successfully');
    
    // Verify installation
    const verifyResult = await db.raw(`
      SELECT EXISTS(
        SELECT 1 FROM pg_extension WHERE extname = 'dblink'
      ) as exists;
    `);
    
    if (verifyResult.rows[0].exists) {
      console.log('✓ dblink extension verified');
    }
    
  } catch (error) {
    console.error('Error installing dblink:', error.message);
    console.error('\nPlease run this SQL manually as database superuser:');
    console.error('CREATE EXTENSION IF NOT EXISTS dblink;');
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

installDblink();

