const express = require('express');
const router = express.Router();

// Billboard market home page
router.get('/', (req, res) => {
  res.render('adverts/index', { 
    title: 'Advertising & Marketting - City',
    billboards: [],
    apiKey: process.env.OPENCAGE_API_KEY // This will be populated from the spreadsheet later
  });
});

module.exports = router;
