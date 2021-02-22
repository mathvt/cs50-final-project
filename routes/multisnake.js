var express = require('express');
var router = express.Router();
//var clients = require("../app").clients; 





router.get('/', function(req, res) {
  if (req.session.name != null)
    res.render('multisnake', {title: 'multi'});
  else
    res.render('index', {title: 'snake menu'});
});


router.get('/names', function(req, res) {
  res.send(req.session.name+ ',' + req.session.adversaire);
});



  module.exports = router;