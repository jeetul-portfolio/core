
function makeGetSampleDataUsecase({ dataAccess, config, logger}) {
  return async function getSampleDataUsecase() {
    // 1. Get initial data via data access
    const sampleData = await dataAccess.getSampleData();
    logger.info('Sample data retrieved', { sampleData });

    return sampleData;
  };
}

module.exports = makeGetSampleDataUsecase;
