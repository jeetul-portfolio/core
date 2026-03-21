
function makeGetSampleDataDataAccess({ config, logger }) {
  return async function getSampleDataDataAccess() {
    // In a real application, you would fetch data from a database.
    return { message: 'This is sample data from the data access layer.' };
  }
}

module.exports = makeGetSampleDataDataAccess;
