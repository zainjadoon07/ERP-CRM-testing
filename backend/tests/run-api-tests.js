const newman = require('newman');
const fs = require('fs');
const path = require('path');
const http = require('http');

const apiTestsDir = path.join(__dirname, 'API');
const files = fs.readdirSync(apiTestsDir).filter(file => file.endsWith('.json'));

console.log(`Found ${files.length} test collections.`);

// Function to check if server is ready
const waitForServer = (url, maxAttempts = 30, interval = 2000) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkServer = () => {
      attempts++;
      console.log(`Checking if server is ready... (attempt ${attempts}/${maxAttempts})`);

      http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          console.log('✅ Server is ready!');
          resolve();
        } else {
          retry();
        }
      }).on('error', (err) => {
        if (attempts >= maxAttempts) {
          console.error('❌ Server failed to start after maximum attempts');
          reject(new Error(`Server not available at ${url} after ${maxAttempts} attempts`));
        } else {
          retry();
        }
      });
    };

    const retry = () => {
      setTimeout(checkServer, interval);
    };

    checkServer();
  });
};

const runCollection = (index) => {
  if (index >= files.length) {
    console.log('\n✅ All API tests completed successfully.');
    process.exit(0);
  }

  const file = files[index];
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${file}`);
  console.log('='.repeat(60));

  newman.run({
    collection: path.join(apiTestsDir, file),
    reporters: 'cli',
    insecure: true,
    timeout: 10000
  }, (err) => {
    if (err) {
      console.error(`\n❌ Test failed: ${file}`);
      console.error(err);
      process.exit(1);
    }
    console.log(`✅ Completed: ${file}`);
    runCollection(index + 1);
  });
};

// Main execution
(async () => {
  try {
    console.log('Waiting for server to be ready...');
    await waitForServer('http://localhost:8888/api/login');
    console.log('\nStarting API tests...\n');
    runCollection(0);
  } catch (error) {
    console.error('Failed to connect to server:', error.message);
    console.error('\nMake sure the backend server is running on http://localhost:8888');
    process.exit(1);
  }
})();
