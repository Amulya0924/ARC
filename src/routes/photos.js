const express = require('express');
const multer = require('multer');
const { storePhoto, getPhotoMetadata, getPhotoContent } = require('../services/storage');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

router.post('/photos', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'No photo uploaded'
      });
    }

    const metadata = await storePhoto(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(201).json(metadata);
  } catch (err) {
    next(err);
  }
});

router.get('/photos/:id', async (req, res, next) => {
  try {
    const metadata = await getPhotoMetadata(req.params.id);
    if (!metadata) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Photo not found'
      });
    }
    res.json(metadata);
  } catch (err) {
    next(err);
  }
});

router.get('/photos/:id/content', async (req, res, next) => {
  try {
    const result = await getPhotoContent(req.params.id);
    if (!result) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Photo not found'
      });
    }
    res.setHeader('Content-Type', result.metadata.mimeType || 'image/png');
    res.setHeader('Content-Length', result.buffer.length);
    res.send(result.buffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
