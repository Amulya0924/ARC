const express = require('express');
const path = require('path');
const pino = require('pino');
const pinoHttp = require('pino-http');
const multer = require('multer');
const healthRouter = require('./routes/health');
const photosRouter = require('./routes/photos');

const app = express();

const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'silent' : 'info')
});

app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', healthRouter);
app.use('/api', photosRouter);

// Global error handler middleware
app.use((err, req, res, next) => {
  if (req.log) {
    req.log.error({ err }, 'Unhandled request error');
  } else {
    console.error('Unhandled error:', err);
  }

  if (err instanceof multer.MulterError || (err.name === 'MulterError')) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'PHOTO_TOO_LARGE',
        message: 'File size exceeds maximum allowed limit of 8 MiB'
      });
    }
  }

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An internal error occurred processing your request'
  });
});

module.exports = app;
