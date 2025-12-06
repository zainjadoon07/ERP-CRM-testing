const newman = require('newman');
const fs = require('fs');
const path = require('path');

const apiTestsDir = path.join(__dirname, 'API');
const files = fs.readdirSync(apiTestsDir).filter(file => file.endsWith('.json'));

console.log(`Found ${files.length} test collections.`);

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

runCollection(0);
