var express = require('express');
var router = express.Router();





let waitformulti = [];
let foundmulti = [];
let players = [];


router.get('/', function(req, res, next) {
    res.render('index', { title: 'snake menu', invalidname : false });
  });
  
  router.post('/', lookformulti, wait, function(req, res, next) {
    res.render('multisnake', { title: 'multi' });
  });



function lookformulti(req, res, next){
  if (!req.body.name || players.includes(!req.body.name)){
    return res.render('index', { title: 'snake menu', invalidname : true });
  }
  else{
    req.session['name'] = req.body.name;
    players.push(req.body.name);
    console.log(players);
    req.session['adversaire'] = null;
  }
  if (waitformulti.length > 0){
    req.session['adversaire'] = waitformulti.shift();
    foundmulti.push([req.session['adversaire'],req.session['name']])
  }
  next();
}



function wait(req, res, next){
  if (req.session['adversaire']){
    return next();
  }
  waitformulti.push(req.session['name']);
  time = setInterval(function(){
    if (foundmulti.length > 0){
      for (e of foundmulti){
        if (e[0] == req.session['name']){
          clearInterval(time);
          req.session['adversaire'] = e[1];
          foundmulti.splice(foundmulti.indexOf(e),1)
          console.error('  test    '+foundmulti+ '           '+waitformulti);
          next();
        }
      }
    }
  },333)
}


module.exports = {router:router, players:players};