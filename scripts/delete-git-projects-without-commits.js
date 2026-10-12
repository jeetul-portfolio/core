const container = require('../di-container');

// Usage: npm run cleanup:git [-- --dry-run]
async function run() {
  const dryRun = process.argv.includes('--dry-run');
  try {
    const result = await container.usecase.gitUsecase.deleteGitProjectsWithoutCommits({ dryRun });
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Git project cleanup failed:', error.message);
    process.exit(1);
  }
}

run();
