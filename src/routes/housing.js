const express = require('express');
const router = express.Router();

// Thrift store home page
router.get('/', (req, res) => {
  res.render('housing/index', { 
    title: 'Hustle Free Real Estate - City',
    items: [],
    apiKey: process.env.OPENCAGE_API_KEY // This will be populated from the spreadsheet later
  });
});

module.exports = router;
