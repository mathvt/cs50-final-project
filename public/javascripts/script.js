if (goodname == false){
    askname();
}

function askname(){
    document.getElementById('som').style.display ='none';
    document.getElementById('option').style.display ='block';
}

function onssubmit(){
    document.getElementById('option').style.display ='none';
    document.getElementById('wait').style.display ='block';
}
