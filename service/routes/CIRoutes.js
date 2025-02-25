const express = require('express');
const router = express.Router();
const CIController = require('../controllers/CIController');

router.post('/processCIData', CIController.processCIData);

module.exports = router;