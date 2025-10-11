#!/usr/bin/env node

// server/test-db.js
import { getPrismaClient } from './src/config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabase() {
  console.log('🔍 Testing database connectivity...\n');

  try {
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set ✓' : 'Missing ✗');
    
    const prisma = getPrismaClient();
    console.log('✅ Prisma client created successfully');

    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);

    // Test count (if User table exists)
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User count: ${userCount}`);
    } catch (error) {
      console.log('⚠️  User table might not exist yet:', error.message);
    }

    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');

    console.log('\n🎉 Database connectivity test completed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDatabase();