function presentPreference(row) {
  let meta = {};
  if (row.meta) {
    try {
      meta = typeof row.meta === 'string' ? JSON.parse(row.meta) : row.meta;
    } catch {
      meta = {};
    }
  }
  return {
    type: row.type,
    meta,
  };
}

module.exports = { presentPreference };
