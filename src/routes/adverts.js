const express = require('express');
const router = express.Router();

// Billboard market home page
router.get('/', (req, res) => {
  res.render('adverts/index', { 
    title: 'Billboard Market - City',
    billboards: [] // This will be populated from the spreadsheet later
  });
});

module.exports = router;
