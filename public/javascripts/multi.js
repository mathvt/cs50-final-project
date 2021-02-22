let me;
let adversaire;
let theTime;
let time;
let mySnake = [];
let hisSnake = [];
let myNewSnake;
let hisNewSnake;
let height = 15;
let width = 20;
let myColor;
let myBodyColor;
let hisColor;
let hisBodyColor;
let speed = 266;
let dir = 38;
let olddir = 38;
let rivalPos;
let ws;
let wkey;
let toeat = [];
let no;
let start = false;
let myName;
let hisName;
let restrt = false;

generategrid();

initws();



function startgame(){
    clearTimeout(time);
    start = true;
    time = setInterval(game, speed);
    return;
}


function initws(){
    if (ws) {
      ws.onerror = ws.onopen = ws.onclose = null;
      ws.close();
    }
    ws = new WebSocket('ws://'+window.location.host);
    ws.onopen = function () {
        console.error('WebSocket connection established');
        ws.send("connected");
    };
    ws.onmessage = function({data}) {
        if(/^mysnake/i.test(data)){
            data = data.replace('mysnake', '');
            if(data == ''){
                document.getElementById(mySnake[0]).style.backgroundColor = "#EEEEEE";
                theend();
            }
            else{
                myNewSnake = data.split(',').map(x => parseInt(x,10));
                move(mySnake, myNewSnake, myColor, myBodyColor);
                mySnake = myNewSnake;
                score();                
            }
        }

        else if(/^hissnake/i.test(data)){
            data = data.replace('hissnake', '');
            if(data == ''){
                document.getElementById(hisSnake[0]).style.backgroundColor = "#EEEEEE";
                theend();
            }
            else{
                hisNewSnake = data.split(',').map(x => parseInt(x,10));
                move(hisSnake, hisNewSnake, hisColor, hisBodyColor);
                hisSnake = hisNewSnake;
                score();
            }
        }

        else if(/^food/i.test(data)){
            data = data.replace('food', '');
            toeat = data.split(',').map(x => parseInt(x,10));
            showfood();
        }

        else if (data === 'player1' || data === 'player2'){
            no = data
            console.error('no= ' + no);
            initgame(no);
            getname();
            ws.send('ready');
        }

        else if (data === 'decount'){
            time = setTimeout(startgame, 3000);
            gametime();
        }

        else if (data === 'adv left'){
            ws.close();
            clearInterval(theTime);
            clearInterval(time);
            document.getElementById('haveleftmsg').style.display = 'block';
        }

        else if (/machin/i.test(data)){
            restrt = true;
            data = data.replace('machin', hisName);
            console.error(data);
            document.getElementById('leavemsg').innerHTML = data;
            document.getElementById('leavemsg').style.display = 'block';
        }

        else if(data === 'wait'){
            wait();
        }
    };
        
    ws.onclose = function () {
        console.error('WebSocket connection closed');
        ws = null;
    };    
};


function game(){
    ws.send(dir);
    olddir = dir;
}


function move(old, newest, color, mbcolor){

    if (newest[1]){
        document.getElementById(newest[1]).style.backgroundColor = mbcolor;
    }
    document.getElementById(newest[0]).style.backgroundColor = color;
    
    let last = old.pop()
    if(!toeat.includes(last)){
        document.getElementById(last).style.backgroundColor = "#EEEEEE";
    }
}



function showfood(){
    toeat.forEach(x => document.getElementById(x).style.backgroundColor = "green");
}



function initgame(no){
    if (no == 'player1'){
        myColor = 'blue';
        myBodyColor = '#5555FF';
        hisColor = 'red';
        hisBodyColor = '#FF5555';
        mySnake.push(Math.floor(height*width/2 + width/3));
        hisSnake.push(Math.floor(height*width/2 + 2*width/3));
    }
    else{
        hisColor = 'blue';
        hisBodyColor = '#5555FF';
        myColor = 'red';
        myBodyColor = '#FF5555';
        hisSnake.push(Math.floor(height*width/2 + width/3));
        mySnake.push(Math.floor(height*width/2 + 2*width/3));
    }
    for(let i = 0; i < 5; i++){
        if (i == 0){
            document.getElementById(mySnake[0]+i*width).style.backgroundColor = myColor;
            document.getElementById(hisSnake[0]+i*width).style.backgroundColor = hisColor;            
        }
        if (i > 0){
            document.getElementById(mySnake[0]+i*width).style.backgroundColor = myBodyColor;
            document.getElementById(hisSnake[0]+i*width).style.backgroundColor = hisBodyColor;            
            mySnake.push(mySnake[0]+i*width);
            hisSnake.push(hisSnake[0]+i*width);
        }
    }
    ws.send('snake'+mySnake);
}



function generategrid(){
    let mainElement = document.getElementById('main')
    for (let i = 0; i < height; i++){
        
        let row = document.createElement("div");
        row.setAttribute('class','row');
        mainElement.appendChild(row);

        for (let j = 0; j < width; j++){

            let column = document.createElement("div");
            column.setAttribute('id', (i*width + j).toString());
            column.setAttribute('class','column');
            row.appendChild(column);

        }
    }
    mainElement.style.width = (100*height/width).toString() + 'vh'; //(90*width/height).toString() + 'vh'
    mainElement.style.height = (80*height/width).toString() + 'vh';
    row = document.getElementsByClassName('row');
    column = document.getElementsByClassName('column');
    for (e of row){
        e.style.height = (100/height).toString() + '%';
    }
    for (e of column){
        e.style.width = (100/width).toString() + '%';
    }
}


function listenKey(e){
    let d = keycode(e);
    if (d == olddir + 2 || d == olddir - 2){
        //do nothing
    }
    else if (d > 36 && d < 41){
        dir = d;
    }
}


function keycode(e){
    if (e == 'ArrowUp'){
        return 38;
    }
    if (e == 'ArrowDown'){
        return 40;
    }
    if (e == 'ArrowLeft'){
        return 37;
    }
    if (e == 'ArrowRight'){
        return 39;
    }
}


window.addEventListener('keydown', function(e){
    wkey = e.key;
    listenKey(wkey);
});



function getname(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200){
            let names =  xhttp.responseText.split(',');
            myName = names[0];
            hisName = names[1];
            document.getElementById('me').textContent =  names[0];
            document.getElementById('me').style.color = myColor;
            document.getElementById('him').textContent = names[1];
            document.getElementById('him').style.color = hisColor;
        }
    }
    xhttp.open("GET", "/multi/names", true);
    xhttp.send();
}


function gametime(){
    let decount = 3;
    let gtime = 30;
    theTime = setInterval(function(){
        decount --;
        if (decount + gtime > gtime)
            document.getElementById('time').textContent = (decount).toString();
        if (decount + gtime == gtime)
            document.getElementById('time').textContent = 'START';
        if (decount + gtime < gtime-1 && decount + gtime > 0)
            document.getElementById('time').textContent = (decount+gtime).toString();
        if (decount + gtime == 0){
            document.getElementById('time').textContent = 'The End';
            clearInterval(time);
        }
        if (decount + gtime < 0){
            theend();
        }
    },1000);
}


function score(){
    document.getElementById('sme').textContent = mySnake.length.toString();
    document.getElementById('shim').textContent = hisSnake.length.toString();
}


function theend(){
    clearInterval(time);
    clearInterval(theTime);    
    score();
    start = false;
    ws.send('readynot');

    if (mySnake.length > hisSnake.length){
        document.getElementById('me').textContent += ' WON !';
    }
    else if (mySnake.length == hisSnake.length){
        document.getElementById('leavemsg').textContent = 'ex aequo';
    }

    else{
        document.getElementById('him').textContent += ' WON !';
    }
    
    document.getElementById('restart').style.display = 'block';
}


function restart(){
    if(restrt === false){
        ws.send('restart');
    }
    ws.send('ready');
    restrt = false;
    for (let i = 0; i < width*height-1; i++){
        document.getElementById(i).style.backgroundColor = "#EEEEEE";
    }
    document.getElementById('me').textContent = myName;
    document.getElementById('him').textContent = hisName;
    document.getElementById('restart').style.display = 'none';
    document.getElementById('leavemsg').style.display = 'none';
    mySnake = [];
    hisSnake = [];
    toeat = [];
    dir = 38;
    olddir = 38;

    initgame(no);
}


function wait(){
    let time  = setTimeout(function() {
        ws.send("connected");
        clearTimeout(time);
    }, 1000);
}