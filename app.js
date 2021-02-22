var createError = require('http-errors');
var express = require('express');
var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');

const sessionParser = session({
  saveUninitialized: false,
  secret: 'onix',
  resave: false
});

var indexRouter = require('./routes/index');
var multiRouter = require('./routes/multisnake');
var soloRouter = require('./routes/solosnake');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionParser);


const WebSocket = require('ws');
const { request } = require('express');
const wss = new WebSocket.Server({ clientTracking: true, noServer: true });
const server = http.createServer(app);


app.use('/', indexRouter.router);
app.use('/multi', multiRouter);
app.use('/solo', soloRouter);

var players = indexRouter.players;

var clients = {};
let height = 15;
let width = 20;


wss.clients.forEach(function each(ws) {
  return ws.terminate();
});

server.on('upgrade', function upgrade(req, socket, head) {
  sessionParser(req, {}, () => {
    if (!req.session.name) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, function (ws) {
      wss.emit('connection', ws, req);
    });
  });
});

wss.on('connection', function connection(ws, req) {
  connectedtows(req.session.name, ws);
  ws.on('message', function message(msg) {

    if (parseInt(msg,10)){
      if (clients[req.session.adversaire]){
        clients[req.session.name].dir = parseInt(msg,10);
        if (clients[req.session.adversaire].dir != 'nok'){
          game(req.session.name,req.session.adversaire);
        }
      }
      else{
        clients[req.session.name].ws.send('adv left');
        clients[req.session.name] = null;
      }
    }

    else if (/^snake/i.test(msg)){
      msg = msg.replace('snake', '');
      clients[req.session.name].snake = msg.split(',').map(x => parseInt(x,10));
      clients[req.session.name].food = [];
      clients[req.session.name].dir = 'nok';
    }
  
    else if (msg === 'connected'){
      if (!clients[req.session.adversaire])
        ws.send('wait')
      else
        ifconnectedok(req.session.name, req.session.adversaire);
    }

    else if (msg === 'ready' && clients[req.session.adversaire]){
      aplayerisready(req.session.name, req.session.adversaire);
    }

    else if (msg === 'readynot' && clients[req.session.adversaire]){
      clients[req.session.name].status = 'not rdy';
      console.error(req.session.name +' is '+ clients[req.session.name].status)
    }

    else if (msg === 'restart' && clients[req.session.adversaire]){
      clients[req.session.adversaire].ws.send('machin want to play again !');
    }
  });
  ws.on('close', function () {
    if (clients[req.session.adversaire]){
      clients[req.session.adversaire].ws.send('adv left');
    }
    if(players.indexOf(req.session.name) != -1){
      console.log(players.splice(players.indexOf(req.session.name),1)+' removed');
      console.log(players)
    }
    clients[req.session.name] = null;
  });
});







// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




// my functions ###############################################


function game(name, adv){
  let playerList = [name, adv];
  //    SET NEW POSTITION
  
  for (player of playerList){
    let dir = clients[player].dir;
    clients[player].dir = 'nok';
    let newpos;
    let mySnake = clients[player].snake;
    switch(dir){
      case 38:
          newpos = mySnake[0]-width;
          break;
      case 40:
          newpos = mySnake[0]+width;
          break;
      case 37:
          newpos = mySnake[0]-1;
          break;
      case 39:
          newpos = mySnake[0]+1;
    }
    if(newpos < 0){
      newpos += width*height;
    }
    if(newpos > width*height-1){
      newpos -= width*height;
    }
    if(newpos%width == width-1 && dir == 37){
      newpos += width
    }
    if(newpos%width == 0 && dir == 39){
        newpos -= width
    }
    clients[player].newpos = newpos;
  }

  let snake0 = clients[playerList[0]].snake;
  let snake1 = clients[playerList[1]].snake;
  let newpos0 = clients[playerList[0]].newpos;
  let newpos1 = clients[playerList[1]].newpos;

  //    IF HEAD TO HEAD

  if(newpos0 == snake1[0] && newpos1 == snake0[0] || newpos0 == newpos1){
    newpos0 = snake0.shift();
    newpos1 = snake1.shift();
  }


  //    CUTTING CASE

  for (player of playerList){
    newpos = clients[player].newpos;
    let snake = clients[player].snake;
    if (snake.includes(newpos)){
      let moreFood = snake.splice(snake.indexOf(newpos)+1);
      for (newFood of moreFood){
          addfood(newFood, name, adv);
      }
      clients[player].snake = snake;
    }
  }

  if (snake1.includes(newpos0)){
    let moreFood = snake1.splice(snake1.indexOf(newpos0)+1);
    for (newFood of moreFood){
        addfood(newFood, name, adv);
      }
      
  }
  if (snake0.includes(newpos1)){
    let moreFood = snake0.splice(snake0.indexOf(newpos1)+1);
    for (newFood of moreFood){
        addfood(newFood, name, adv);
      }
  }

  clients[playerList[0]].snake = snake0;
  clients[playerList[1]].snake = snake1;
  clients[playerList[0]].newpos = newpos0;
  clients[playerList[1]].newpos =  newpos1;

  for (player of playerList){
  //    MOVING
  //    IF A SNAKE IS NO MORE
    if (clients[player].snake.length != 0){
      clients[player].snake.unshift(clients[player].newpos);
    }
  //    IF EATING
    if (clients[player].food.includes(clients[player].snake[0])){
      rmvfood((clients[player].snake[0]), name, adv);
    }
  //    IF NOT EATING
    else{
      (clients[player].snake).pop();
    }
  }

  //    GENERATE FOOD
  if((clients[name].food).length < 7){
    genfood(name, adv, snake0, snake1);
  }
  else{
    let rdmt = Math.random();
    if(rdmt < 0.33){
      genfood(name, adv, snake0, snake1);
    }
  }

  //    SEND DATA
  senddata(name, adv);
}
  


function senddata(name, adv){
  clients[name].ws.send('food'+clients[name].food.join());
  clients[name].ws.send('mysnake'+clients[name].snake.join());
  clients[name].ws.send('hissnake'+clients[adv].snake.join());
  clients[adv].ws.send('food'+clients[adv].food.join());
  clients[adv].ws.send('mysnake'+clients[adv].snake.join());
  clients[adv].ws.send('hissnake'+clients[name].snake.join());
}


function genfood(name, adv, snake0, snake1){

  let rdm = Math.floor(Math.random() * width*height);
  if(!snake1.includes(rdm) && !snake0.includes(rdm) && !clients[name].food.includes(rdm)){
    addfood(rdm, name, adv);
  }
  if ((clients[name].food).length < 7){
    genfood(name, adv, snake0, snake1);
  }
}


function addfood(nf, name, adv){
  clients[name]['food'].push(nf)
  clients[adv]['food'].push(nf)
}

function rmvfood(rf, name, adv){
  clients[name]['food'].splice(clients[name]['food'].indexOf(rf),1);
  clients[adv]['food'].splice(clients[adv]['food'].indexOf(rf),1);
}




function connectedtows(name, ws){
  clients[name] = {};
  clients[name].ws = ws;
  clients[name].numero = null;
  clients[name].status = 'not rdy';
}


function ifconnectedok(name, adv){
  if(clients[name].numero === null){
    clients[name].numero = 'player1';
    clients[adv].numero = 'player2';
    clients[name].ws.send(clients[name].numero);
  }
  else{
    clients[name].ws.send(clients[name].numero);
  }
}


function aplayerisready(name, adv){
  console.error(name + ' is ready')
  clients[name].status ='rdy';
  if(clients[adv].status === 'rdy'){
    clients[name].ws.send('decount');
    clients[adv].ws.send('decount');
  }
}



module.exports = {app:app, server:server};
