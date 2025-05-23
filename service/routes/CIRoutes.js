const express = require('express');
const router = express.Router();
const CIController = require('../controllers/CIController');
const ApiCIController = require('../controllers/ApiCIController');
const path = require('path');
const fs = require('fs');

// Middleware to check if CSV file exists
const checkCSVExists = (req, res, next) => {
    const filePath = path.join(__dirname, '../data/synthetic_data.csv');
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: 'IP data file not found'
        });
    }
    next();
};

router.post('/processCIData', CIController.processCIData);
router.post('/processIpData', checkCSVExists, CIController.processIpData);
router.post('/processImpactedCI', CIController.impactedCI);
router.post('/analyzeImpact', CIController.analyzeImpact);

router.post('/processChangeData', ApiCIController.processChangeData);
router.get('/change-impact/:changeId', ApiCIController.getChangeImpactData);
router.post('/updateChangeData', ApiCIController.updateChangeData);
router.get('/current-change-impact/:changeId', ApiCIController.getCurrentChangeImpactData);
module.exports = router;