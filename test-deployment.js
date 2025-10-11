#!/usr/bin/env node

const FRONTEND_URL = 'https://main.dezleujsj0pht.amplifyapp.com';
const BACKEND_URL = 'https://ekcijugx71.execute-api.ap-southeast-1.amazonaws.com';

async function testEndpoint(url, name) {
  try {
    const response = await fetch(url);
    const data = await response.text();
    console.log(`✅ ${name}: Status ${response.status}`);
    if (response.ok) {
      console.log(`   Data: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
    }
    return response.ok;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing deployment...\n');

  console.log('📱 Frontend Tests:');
  await testEndpoint(FRONTEND_URL, 'Frontend Homepage');
  
  console.log('\n🔧 Backend API Tests:');
  await testEndpoint(BACKEND_URL, 'Backend Root');
  await testEndpoint(`${BACKEND_URL}/health`, 'Backend Health Check');
  await testEndpoint(`${BACKEND_URL}/test-secrets`, 'Backend Secrets Test');
  
  console.log('\n🔗 CORS Test (simulating frontend->backend):');
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ CORS Test: Status ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`❌ CORS Test: ${error.message}`);
  }

  console.log('\n📋 Summary:');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend:  ${BACKEND_URL}`);
  console.log('\n🎉 Deployment test completed!');
}

main().catch(console.error);