const express = require('express');
const router = express.Router();
router.use('/', require('./read-pdf'));

module.exports = router;