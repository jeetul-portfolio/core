const test = require('node:test');
const assert = require('node:assert/strict');
const makeGetCommits = require('../external-calls/github/get-commits');

const axiosError = (status, data) => Object.assign(new Error(`Request failed with status code ${status}`), { response: { status, data } });

function run(status) {
  const errors = [];
  const getCommits = makeGetCommits({
    githubClient: { get: async () => { throw axiosError(status, { message: 'x' }); } },
    logger: { info() {}, warn() {}, error: (...args) => errors.push(args) },
  });
  return getCommits({ owner: 'me', repo: 'r', defaultBranch: 'main' }).then(
    () => assert.fail('expected rejection'),
    (error) => ({ error, errors })
  );
}

test('empty repository (409) rejects with status but is not logged as an error', async () => {
  const { error, errors } = await run(409);
  assert.equal(error.status, 409);
  assert.equal(errors.length, 0);
});

test('real GitHub failures are still logged as errors', async () => {
  const { error, errors } = await run(500);
  assert.equal(error.status, 500);
  assert.equal(errors.length, 1);
});
