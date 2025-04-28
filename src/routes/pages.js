const express = require('express');
const router = express.Router();

router.get('/about-us', (req, res) => {
  res.render('pages/about', { 
    title: 'About Us - City',
    items: [] // This will be populated from the spreadsheet later
  });
});

router.get('/contact-us', (req, res) => {
  res.render('pages/contact', { 
    title: 'Contact Us - City',
    items: [] // This will be populated from the spreadsheet later
  });
});

module.exports = router;
