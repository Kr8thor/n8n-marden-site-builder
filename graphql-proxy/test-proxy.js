const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const ENDPOINTS = {
  health: '/health',
  content: '/graphql-proxy/content',
  auth: '/graphql-proxy/auth',
  form: '/graphql-proxy/form',
  menu: '/graphql-proxy/menu'
};

// Test functions
async function testHealth() {
  try {
    console.log('\n🔍 Testing Health Endpoint...');
    const response = await axios.get(`${BASE_URL}${ENDPOINTS.health}`);
    
    if (response.status === 200 && response.data.status === 'ok') {
      console.log('✅ Health check passed');
      console.log(`   - Status: ${response.data.status}`);
      console.log(`   - Debug Mode: ${response.data.debug}`);
      console.log(`   - Version: ${response.data.version}`);
      return true;
    } else {
      console.log('❌ Health check failed');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check failed with error:');
    console.log(`   - ${error.message}`);
    return false;
  }
}

async function testContent() {
  try {
    console.log('\n🔍 Testing Content Endpoint...');
    const response = await axios.get(`${BASE_URL}${ENDPOINTS.content}`);
    
    if (response.status === 200 && response.data.posts) {
      console.log('✅ Content endpoint passed');
      console.log(`   - Retrieved ${response.data.posts.length} posts`);
      console.log(`   - First post title: "${response.data.posts[0]?.title || 'N/A'}"`);
      return true;
    } else {
      console.log('❌ Content endpoint failed');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Content endpoint failed with error:');
    console.log(`   - ${error.message}`);
    return false;
  }
}

async function testAuth() {
  try {
    console.log('\n🔍 Testing Auth Endpoint (Invalid Credentials)...');
    // Test with invalid credentials first (should fail)
    const invalidResponse = await axios.post(
      `${BASE_URL}${ENDPOINTS.auth}`,
      { username: 'invalid', password: 'invalid' }
    );
    
    console.log('❌ Auth test failed - invalid credentials accepted!');
    return false;
  } catch (error) {
    // We expect this to fail
    if (error.response && error.response.status === 401) {
      console.log('✅ Auth endpoint correctly rejected invalid credentials');
      
      if (process.env.DEBUG_MODE === 'true') {
        // In debug mode, test valid credentials
        try {
          console.log('\n🔍 Testing Auth Endpoint (Valid Credentials in Debug Mode)...');
          const validResponse = await axios.post(
            `${BASE_URL}${ENDPOINTS.auth}`,
            { username: 'admin', password: 'password' }
          );
          
          if (validResponse.status === 200 && validResponse.data.success) {
            console.log('✅ Auth endpoint accepted valid debug credentials');
            console.log(`   - Token received: ${validResponse.data.token ? 'Yes' : 'No'}`);
            console.log(`   - User info received: ${validResponse.data.user ? 'Yes' : 'No'}`);
            return true;
          }
        } catch (validError) {
          console.log('❌ Auth endpoint failed with valid debug credentials:');
          console.log(`   - ${validError.message}`);
        }
      }
      
      return true; // This test passes if invalid credentials are rejected
    } else {
      console.log('❌ Auth endpoint failed with unexpected error:');
      console.log(`   - ${error.message}`);
      return false;
    }
  }
}

async function testForm() {
  try {
    console.log('\n🔍 Testing Form Submission Endpoint (Invalid Data)...');
    // Test with invalid form data first (should fail validation)
    const invalidResponse = await axios.post(
      `${BASE_URL}${ENDPOINTS.form}`,
      { name: '', email: 'invalid', message: '' }
    );
    
    console.log('❌ Form test failed - invalid data accepted!');
    return false;
  } catch (error) {
    // We expect this to fail with validation errors
    if (error.response && error.response.status === 400) {
      console.log('✅ Form endpoint correctly rejected invalid data');
      console.log(`   - Validation errors: ${JSON.stringify(error.response.data.errors || [])}`);
      
      // Now test with valid form data
      try {
        console.log('\n🔍 Testing Form Submission Endpoint (Valid Data)...');
        const validResponse = await axios.post(
          `${BASE_URL}${ENDPOINTS.form}`,
          { 
            name: 'Test User', 
            email: 'test@example.com', 
            message: 'This is a test message' 
          }
        );
        
        if (validResponse.status === 200 && validResponse.data.success) {
          console.log('✅ Form endpoint accepted valid data');
          console.log(`   - Response: ${validResponse.data.message}`);
          return true;
        } else {
          console.log('❌ Form endpoint failed with valid data');
          console.log(`   - Status: ${validResponse.status}`);
          console.log(`   - Response: ${JSON.stringify(validResponse.data)}`);
          return false;
        }
      } catch (validError) {
        console.log('❌ Form endpoint failed with valid data:');
        console.log(`   - ${validError.message}`);
        return false;
      }
    } else {
      console.log('❌ Form endpoint failed with unexpected error:');
      console.log(`   - ${error.message}`);
      return false;
    }
  }
}

async function testMenu() {
  try {
    console.log('\n🔍 Testing Menu Endpoint...');
    const response = await axios.get(`${BASE_URL}${ENDPOINTS.menu}`);
    
    if (response.status === 200 && response.data.success && response.data.menu) {
      console.log('✅ Menu endpoint passed');
      console.log(`   - Menu name: "${response.data.menu.name}"`);
      console.log(`   - Menu items: ${response.data.menu.items.length}`);
      return true;
    } else {
      console.log('❌ Menu endpoint failed');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Menu endpoint failed with error:');
    console.log(`   - ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting GraphQL Proxy Server Tests\n');
  
  const healthResult = await testHealth();
  const contentResult = await testContent();
  const authResult = await testAuth();
  const formResult = await testForm();
  const menuResult = await testMenu();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   Health Check: ${healthResult ? '✅ Passed' : '❌ Failed'}`);
  console.log(`   Content Endpoint: ${contentResult ? '✅ Passed' : '❌ Failed'}`);
  console.log(`   Auth Endpoint: ${authResult ? '✅ Passed' : '❌ Failed'}`);
  console.log(`   Form Endpoint: ${formResult ? '✅ Passed' : '❌ Failed'}`);
  console.log(`   Menu Endpoint: ${menuResult ? '✅ Passed' : '❌ Failed'}`);
  
  const allPassed = healthResult && contentResult && authResult && formResult && menuResult;
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed!'}`);
  
  return allPassed;
}

// Run the tests
runTests()
  .then(allPassed => {
    process.exit(allPassed ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
