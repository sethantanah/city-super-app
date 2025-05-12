const express = require('express');
const router = express.Router();

// Thrift store home page
router.get('/', (req, res) => {
  res.render('services/index', { 
    title: 'Local Services - City',
    items: [],
    apiKey: process.env.OPENCAGE_API_KEY // This will be populated from the spreadsheet later
  });
});

module.exports = router;
