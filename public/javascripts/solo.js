let dir = 38;
let olddir = 38;
let play;
let long = [];
let speed = 250;
let canStart = true;
let loosed = false;
let width = 25; //to do!!!!!!!!!!!!!!!
let height = 20; //to do!!!!!!!!!!!!!!
let toeat = [];
let eat = 0;
let howManyFood = 7;
let myColor = 'black';
let bodyColor = 'grey';


generategrid();
main();


function main(){
    window.addEventListener('keydown', function(e){
        let wkey = e.key;
        listenKey(wkey);
        if(wkey == 'Enter' && canStart == true){
            canStart = false;
            init();
            food();
            play = setInterval(game,speed);
        }
        if(wkey == 'Escape' || (wkey == 'Enter' && loosed == true)){
            exxit();
        }
        if(wkey == 'o'){
            option();
        }
    });
}



function game(){
    let newpos;
    olddir = dir;
    switch(dir){            // move
        case 38:
            newpos = long[0]-width;
            break;
        case 40:
            newpos = long[0]+width;
            break;
        case 37:
            newpos = long[0]-1;
            break;
        case 39:
            newpos = long[0]+1;
    }
    // loose condition
    if(newpos < 0 || newpos > width*height-1 ||
        (newpos%width == width-1 && dir == 37) || (newpos%width == 0 && dir == 39)){
        return loose();
    }

    if (toeat.includes(newpos)){ // if eat
        toeat.splice(toeat.indexOf(newpos),1);
        food();
        eat = 1;
    }

    let lastpos;
    if (eat == 0){
        lastpos = long.pop();
    }
    else{
        lastpos = long[long.length-1];
        eat = 0;
    }

    for(block of long){
        if(block == newpos){
            long.push(lastpos);
            return loose();
        }
    }
    long.unshift(newpos);
    document.getElementById(lastpos).style.backgroundColor = "#EEEEEE";
    document.getElementById(newpos).style.backgroundColor = myColor;
    document.getElementById(long[1]).style.backgroundColor = bodyColor;  
}



function init(){
    let x = Math.floor(width*height/2 + width/2);  //todo
    for(let i = 0; i < 5; i++){
        if (i == 0){
            document.getElementById(x+i*width).style.backgroundColor = myColor;
            long.push(x+i*width);
        }
        else{
            document.getElementById(x+i*width).style.backgroundColor = bodyColor;
            long.push(x+i*width);
        }

    }
}



function exxit(){
    clearInterval(play);
    for (block of long){
        document.getElementById(block).style.backgroundColor = "#EEEEEE";
    }
    for (block of toeat){
        document.getElementById(block).style.backgroundColor = "#EEEEEE";
    }
    long = [];
    toeat = [];
    dir = 38;
    canStart = true;
    loosed = false;
}



function listenKey(e){
    let d = keycode(e);
    if (d == olddir + 2 || d == olddir - 2){
        //do nothing
    }
    else if (d > 36 && d < 41){
        dir = d;
    }
    if(e == '+'){
        speed /= 1.25;
        changeSpeed();
    }
    if(e == '-'){
        speed *= 1.25;
        changeSpeed();
    }
}



function option(){
    let menu = document.getElementById('option').style;
    if(menu.display == 'block'){
        menu.display = 'none';
    }
    else{
        menu.display = 'block';
    }
}



function loose(){
    clearInterval(play);
    loosed = true;
    let i = 0;
    play = setInterval(function(){
        let colori;
        if(i == 0){
            colori = "red";
            i = 1;
        }
        else{
            colori = "black";
            i = 0;
        }
        for (block of long){
            document.getElementById(block).style.backgroundColor = colori;
        }

    },500);
}



function changeSpeed(){
    clearInterval(play);
    play = setInterval(game,speed);
}



function food(){
    if (toeat.length == howManyFood){
        return;
    }
    let rdm = Math.floor(Math.random() * width*height);
    if(!long.includes(rdm)){
        toeat.push(rdm);
        document.getElementById(rdm).style.backgroundColor = 'green';
        return food();
    }
    return food();
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
    mainElement.style.width = (100*height/width).toString() + 'vh';                         //(90*width/height).toString() + 'vh'
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
