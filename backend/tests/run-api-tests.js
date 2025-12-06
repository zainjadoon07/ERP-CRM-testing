const newman = require('newman');
const fs = require('fs');
const path = require('path');

const apiTestsDir = path.join(__dirname, 'API');
const files = fs.readdirSync(apiTestsDir).filter(file => file.endsWith('.json'));

console.log(`Found ${files.length} test collections.`);

const runCollection = (index) => {
  if (index >= files.length) {
    console.log('All API tests completed successfully.');
    process.exit(0);
  }

  const file = files[index];
  console.log(`\nRunning: ${file}`);

  newman.run({
    collection: path.join(apiTestsDir, file),
    reporters: 'cli'
  }, (err) => {
    if (err) {
      console.error(`Test failed: ${file}`);
      process.exit(1);
    }
    runCollection(index + 1);
  });
};

runCollection(0);
