const container = require('../di-container');

async function run() {
  try {
    const result = await container.usecase.syncGitData();
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Git sync failed:', error.message);
    process.exit(1);
  }
}

run();
