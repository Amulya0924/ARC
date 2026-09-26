const express = require('express');
const router = express.Router();

router.get('/healthz', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.3.1',
    uptime: process.uptime()
  });
});

module.exports = router;
