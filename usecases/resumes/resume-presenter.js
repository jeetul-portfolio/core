function presentResume(row) {
  return {
    id: row.id,
    filename: row.filename,
    fileUrl: row.fileUrl,
    isActive: Boolean(row.isActive),
    uploadedAt: row.uploadedAt,
  };
}

module.exports = { presentResume };
