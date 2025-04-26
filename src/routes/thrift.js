const express = require('express');
const router = express.Router();

// Thrift store home page
router.get('/', (req, res) => {
  res.render('thrift/index', { 
    title: 'Thrift Store - City',
    items: [] // This will be populated from the spreadsheet later
  });
});

module.exports = router;
