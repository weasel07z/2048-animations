const gameboard = document.querySelector('.gameboard');
var tiles = [];

hasK = false;
hasY = false;
hasS = false;

var rowSize = 4;
var colSize = 4;

//var isShadowToggled = true;
//const multi = document.querySelector('.multi');
var multiplier = 2;


// Get keyboard inputs
document.addEventListener('keydown', function(key) {
    let moved = false;
    if (key.keyCode == 37 || key.keyCode == 65) { // left_arrow_key or a
        moved = moveLeft();
    } else if (key.keyCode == 38 || key.keyCode == 87) { // up_arrow_key or w
        moved = moveUp();
    } else if(key.keyCode == 39 || key.keyCode == 68) { // right_arrow_key or d
        moved = moveRight();
    } else if(key.keyCode == 40 || key.keyCode == 83) { // down_arrow_key or s
        hasS = true;
        keepYourselfSafe();
        moved = moveDown();
    } else if(key.keyCode == 82) { // r
        resetGame();
    } else if(key.keyCode == 77) { // m
        setMultiplier();
    } else if(key.keyCode == 51) { // 3
        colonThree();
    } else if(key.keyCode == 75) { // k
        hasK = true;
        keepYourselfSafe();
    } else if(key.keyCode == 89) { // y
        hasY = true;
        keepYourselfSafe();
    }
    if(moved){
      spawnRandomTile();
    }
    colors();
    //console.log(hasPlayerLost())
    if(hasPlayerLost()){
        document.getElementById("lossButton").style.display = "block";
        document.getElementById("lossText").style.display = "block";
    }
}, true);
window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

// Swiping
var touchStartClientX, touchStartClientY;
//const container = document.querySelector('.container');

gameboard.addEventListener('touchstart', function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches.length > 1) {
      return; // Ignore if touching with more than 1 finger
    }
    if (window.navigator.msPointerEnabled) {
      touchStartClientX = event.pageX;
      touchStartClientY = event.pageY;
    } else {
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
    }

    event.preventDefault();
});

gameboard.addEventListener('touchmove', function (event) {
    event.preventDefault();
});

gameboard.addEventListener('touchend', function (event) {
    let moved = false;
    event.preventDefault();

    if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches.length > 0) {
      return; // Ignore if still touching with one or more fingers
    }

    var touchEndClientX, touchEndClientY;

    if (window.navigator.msPointerEnabled) {
      touchEndClientX = event.pageX;
      touchEndClientY = event.pageY;
    } else {
      touchEndClientX = event.changedTouches[0].clientX;
      touchEndClientY = event.changedTouches[0].clientY;
    }

    var dx = touchEndClientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = touchEndClientY - touchStartClientY;
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 20) {
        event.preventDefault();
      // (right : left) : (down : up)
        if(absDx > absDy){
            if(dx > 0) {
                moved = moveRight();
            } else {
                moved = moveLeft();
            }
            } else {
            if(dy > 0){
                moved = moveDown();
            } else {
                moved = moveUp();
            }
        }
      //self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    }
    if(moved){
        spawnRandomTile();
    }
    colors();
    
});

// Sliding animation :3 nvm fuck this 
/*
function moveTile(currentTile, targetTile, animationClass) {
  currentTile.classList.add(animationClass);
  setTimeout(function () {
    currentTile.classList.remove(animationClass);
    targetTile.classList.remove('new');
  }, 200);
} */

// checking for merge
function canEat(i, j, newTile){
  if(i >= rowSize || j >= colSize || i < 0 || j < 0){
      return false;
  }
  return(parseInt(getTile(i,j).innerText) === parseInt(newTile.innerText));
}
// checks for open space
function canMove(i, j){
  if(i >= rowSize || j >= colSize || i < 0 || j < 0 || tiles[i*colSize + j].innerText !== ''){
      return false;
  }
  return true;
}
// Initializing function
function createGameboard() {
    for (let i = 0; i < (rowSize*colSize); i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        gameboard.appendChild(tile);
        tiles.push(tile);
    }
    // Spawn two random tiles at start
    spawnRandomTile();
    spawnRandomTile();
    colors();
}
// spawn random tiles
function spawnRandomTile() {
    
  const emptyTiles = tiles.filter(tile => !tile.innerText);
  const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
  if(multiplier != 2){
    randomTile.innerText = 2;
    randomTile.classList.add('new');
  } else {
    randomTile.innerText = Math.random() < 0.9 ? '2' : '4';
    randomTile.classList.add('new');
  } 
}
// Get tile at certain row and column
function getTile(row, col){
  return tiles[row*colSize + col];
}
// Resets game to only 2 tiles
function resetGame() {
  tiles.forEach(tile => {
    tile.innerText = '';
    tile.classList.remove('new', 'merged');
  });
  document.getElementById("lossButton").style.display = "none";
  document.getElementById("lossText").style.display = "none";
  spawnRandomTile();
  spawnRandomTile();
  colors();
}
// Initailizing for document on load
createGameboard();

// MOVEMENT * * * * * * * * * * * * *
function moveLeft(){
    let moved = false;
    for(let i = 0; i < rowSize; i++){
        for(let j = 0; j < colSize; j++){
            const curTile = getTile(i, j);
            if(!!curTile.innerText){
                var newI = i;
                var newJ = j;
                while(canMove(newI, newJ-1)){
                    newJ--;
                }
                if(canEat(newI, newJ-1, curTile)){
                  const newTile = getTile(newI, newJ-1);
                  newTile.innerText = parseInt(newTile.innerText)*multiplier;
                  //moveTile(curTile, newTile, 'slide-left');
                  curTile.innerText = '';
                  newTile.classList.add('merged');
                  curTile.classList.remove('new');
                  curTile.classList.remove('merged');
                  moved = true;
                } else {
                  if(newI == i && newJ == j){
                    curTile.classList.remove('merged');
                    curTile.classList.remove('new');
                    continue;
                  }
                  const newTile = getTile(newI, newJ);
                  newTile.innerText = curTile.innerText;
                  //moveTile(curTile, newTile, 'slide-left');
                  curTile.innerText = '';
                  curTile.classList.remove('merged');
                  curTile.classList.remove('new');
                  moved = true;
                }
            }
        }
    }
    return moved;
}

function moveRight(){
    let moved = false;
    for(let i = rowSize-1; i >= 0; i--){
        for(let j = colSize-1; j >= 0; j--){
            const curTile = getTile(i, j);
            if(curTile.innerText){
                var newI = i;
                var newJ = j;
                while(canMove(newI, newJ+1)){
                    newJ++;
                }
                if(canEat(newI, newJ+1, curTile)){
                  const newTile = getTile(newI, newJ+1);
                  newTile.innerText = parseInt(newTile.innerText)*multiplier;
                  curTile.innerText = '';
                  newTile.classList.add('merged');
                  curTile.classList.remove('new');
                  curTile.classList.remove('merged');
                  //moveTile(curTile, newTile, 'slide-right');
                  moved = true;
                } else {
                  if(newI == i && newJ == j){
                    curTile.classList.remove('merged');
                    curTile.classList.remove('new');
                    continue;
                  }
                  const newTile = getTile(newI, newJ);
                  newTile.innerText = curTile.innerText;
                  curTile.innerText = '';
                  curTile.classList.remove('merged');
                  curTile.classList.remove('new');
                  //moveTile(curTile, newTile, 'slide-right');
                  moved = true;
                }
            }
        }
    }
    return moved;
}
function moveDown(){
    let moved = false;
    for(let i = rowSize-1; i >= 0; i = i-1){
        for(let j = colSize-1; j >= 0 ; j = j-1){
            const curTile = getTile(i, j);
            if(curTile.innerText){
                var newI = i;
                var newJ = j;
                while(canMove(newI+1, newJ)){
                    newI++;
                }
                if(canEat(newI+1, newJ, curTile)){
                  const newTile = getTile(newI+1, newJ);
                  newTile.innerText = parseInt(newTile.innerText)*multiplier;
                  curTile.innerText = '';
                  newTile.classList.add('merged');
                  curTile.classList.remove('new');
                  curTile.classList.remove('merged');
                  moved = true;
                } else {
                  if(newI == i && newJ == j){
                    curTile.classList.remove('merged');
                    curTile.classList.remove('new');
                    continue;
                  }
                  const newTile = getTile(newI, newJ);
                  newTile.innerText = curTile.innerText;
                  curTile.innerText = '';
                  curTile.classList.remove('merged');
                  curTile.classList.remove('new');
                  moved = true;
                }
            }
        }
    }
    return moved;
}
function moveUp(){
    let moved = false;
    for(let i = 0; i < rowSize; i++){
        for(let j = 0; j < colSize; j++){
            const curTile = getTile(i, j);
            if(curTile.innerText){
                var newI = i;
                var newJ = j;
                while(canMove(newI-1, newJ)){
                    newI--;
                }
                if(canEat(newI-1, newJ, curTile)){
                  const newTile = getTile(newI-1, newJ);
                  newTile.innerText = parseInt(newTile.innerText)*multiplier;
                  curTile.innerText = '';
                  newTile.classList.add('merged');
                  curTile.classList.remove('new');
                  curTile.classList.remove('merged');
                  moved = true;
                } else {
                  if(newI == i && newJ == j){
                    curTile.classList.remove('merged');
                    curTile.classList.remove('new');
                    continue;
                  }
                  const newTile = getTile(newI, newJ);
                  newTile.innerText = curTile.innerText;
                  curTile.innerText = '';
                  curTile.classList.remove('merged');
                  curTile.classList.remove('new');
                  moved = true;
                }
            }
        }
    }
    return moved;
}

// Sets the colors for each tile on the board
function colors(){
    var els = document.getElementsByClassName('tile');
    for(let i = 0; i < rowSize*colSize; i++){
        var temp = els[i];
        if(!temp.innerText){
            removeAllClass(temp);
            temp.classList.add('zero');
        } else if(temp.innerText == 2 || temp.innerText < 4){
            removeAllClass(temp);
            temp.classList.add('two');
        } else if(temp.innerText == 4 || temp.innerText < 8){
            removeAllClass(temp);
            temp.classList.add('four');
        } else if(temp.innerText == 8 || temp.innerText < 16){
            removeAllClass(temp);
            temp.classList.add('eight');
        } else if(temp.innerText == 16 || temp.innerText < 32){
            removeAllClass(temp);
            temp.classList.add('sixteen');
        } else if(temp.innerText == 32 || temp.innerText < 64){
            removeAllClass(temp);
            temp.classList.add('thirtytwo');
        } else if(temp.innerText == 64 || temp.innerText < 128){
            removeAllClass(temp);
            temp.classList.add('sixtyfour');
        } else if(temp.innerText == 128 || temp.innerText < 256){
            removeAllClass(temp);
            temp.classList.add('onetwentyeight');
        } else if(temp.innerText == 256 || temp.innerText < 512){
            removeAllClass(temp);
            temp.classList.add('twofiftysix');
        } else if(temp.innerText == 512 || temp.innerText < 1024){
            removeAllClass(temp);
            temp.classList.add('fivetwelve');
        } else if(temp.innerText == 1024 || temp.innerText < 2048){
            removeAllClass(temp);
            temp.classList.add('tentwentyfour');
        } else if(temp.innerText == 2048){
            removeAllClass(temp);
            temp.classList.add('twentyfourtyeight');
        } else if(temp.innerText.length < 5){
            removeAllClass(temp);
            temp.classList.add('fourtyninetysix');
        } else {
            removeAllClass(temp);
            temp.classList.add('passed');
        }
    }
}
// removing all the possible colors (probably a way easier way to do this but idk how)
function removeAllClass(thing){
    thing.classList.remove('zero');
    thing.classList.remove('two');
    thing.classList.remove('four');
    thing.classList.remove('eight');
    thing.classList.remove('sixteen');
    thing.classList.remove('thirtytwo');
    thing.classList.remove('sixtyfour');
    thing.classList.remove('onetwentyeight');
    thing.classList.remove('twofiftysix');
    thing.classList.remove('fivetwelve');
    thing.classList.remove('tentwentyfour');
    thing.classList.remove('twentyfourtyeight');
    thing.classList.remove('fourtyninetysix');
    thing.classList.remove('passed');
}
//<button class="multi" onclick="setMultiplier()">Current Mulitplier: 2</button>
function setMultiplier() {
    let m = prompt("Set Multiplier: ", "2");
    if(m.includes("kys")){
        const title = document.querySelector(".dipshit");
        title.innerText = "🖕"
    }
    if(m == null || m == "") {
        //pass
    } else if (isNaN(m)){
      //pass
    } else {
        if(multiplier != parseInt(m)){
            multiplier = parseInt(m);
            //multi.innerText = "Current Multiplier: " + m;
            resetGame();
        }
    }
}

function colonThree() {
    const title = document.querySelector(".dipshit");
    if(title.innerText == "2048 :3"){
        title.innerText = "2048";
    } else {
        title.innerText = "2048 :3";
    }

}
function keepYourselfSafe(){
    const title = document.querySelector(".dipshit");
    if(hasK && hasY && hasS){
        title.innerText = "🖕"
    }
}
document.querySelector('#gridSize').addEventListener("click", function() {
    tiles = [];
    for(let i = (rowSize*colSize)-1; i >= 0; i--){
        if(!gameboard.lastChild.classList.contains('fades')){
            gameboard.removeChild(gameboard.lastChild);
        }
    }
    rowSize = rowSlider.value;
    colSize = colSlider.value;
    createGameboard();
    gameboard.style.setProperty('--colSize', colSize);
    gameboard.style.setProperty('--rowSize', rowSize);
    //colors();
})

var rowSlider = document.getElementById("rowSlider");
var rowVal = document.getElementById("rowVal");
rowVal.innerHTML = rowSlider.value;

rowSlider.oninput = function() {
  rowVal.innerHTML = this.value;
}
var colSlider = document.getElementById("colSlider");
var colVal = document.getElementById("colVal");
colVal.innerHTML = colSlider.value;

colSlider.oninput = function() {
  colVal.innerHTML = this.value;
}

function hasPlayerLost(){
    for(var i = 0; i < 4; i++){
        for(var j = 0; j < 4; j++){
                if(getTile(i,j) == null){
                      return false;
                } else if(canMove(i-1, j) || canEat(i-1, j, getTile(i, j))){
                      return false;
                } else if(canMove(i+1,j) || canEat(i+1, j, getTile(i, j))){
                      return false;
                } else if(canMove(i,j-1) || canEat(i, j-1, getTile(i, j))){
                      return false;
                } else if(canMove(i,j+1) || canEat(i, j+1, getTile(i, j))){
                      return false;
                }
        }
    }
    return true;
}