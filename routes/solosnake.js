var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('solosnake', { title: 'solo' });
  });
  
  module.exports = router;