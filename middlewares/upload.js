const multer = require('multer');
const path = require('path');

const UPLOAD_DIR = '/app/assets/resume';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Strip any path separators and null bytes from the original name to prevent path traversal
    const sanitized = file.originalname
      .replace(/[/\\?%*:|"<>\x00]/g, '-')
      .replace(/\s+/g, '_');
    const unique = `${Date.now()}-${sanitized}`;
    cb(null, unique);
  },
});

function fileFilter(_req, file, cb) {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
}

const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('file');

module.exports = { uploadResume };
