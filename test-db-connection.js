// Test script for MongoDB connection
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Manually load .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

async function testDatabaseConnection() {
  console.log('🔍 Testing MongoDB connection...\n');

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI not found in .env file');
    process.exit(1);
  }

  // Mask the password in the URI for display
  const maskedUri = MONGODB_URI.replace(/:[^:@]+@/, ':****@');
  console.log(`📍 Connecting to: ${maskedUri}\n`);

  try {
    const startTime = Date.now();
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000
    });
    const connectionTime = Date.now() - startTime;

    console.log('✅ Successfully connected to MongoDB!');
    console.log(`⚡ Connection time: ${connectionTime}ms`);
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🖥️  Host: ${mongoose.connection.host}`);
    console.log(`📡 Ready state: ${mongoose.connection.readyState} (1 = connected)\n`);

    // Test a simple operation
    console.log('🧪 Testing database operations...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📚 Found ${collections.length} collection(s) in the database:`);
    collections.forEach((col, idx) => {
      console.log(`   ${idx + 1}. ${col.name}`);
    });

    console.log('\n✨ All tests passed! Database connection is working properly.\n');

  } catch (error) {
    console.error('\n❌ Failed to connect to MongoDB:');
    console.error(`   Error: ${error.message}\n`);

    if (error.message.includes('authentication')) {
      console.log('💡 Tip: Check your database username and password');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Tip: Check your network connection and firewall settings');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Tip: Check your MongoDB URI hostname');
    }

    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
  }
}

testDatabaseConnection();
