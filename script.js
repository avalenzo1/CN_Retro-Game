/** 
 * Canvas/Game Constants
 * These affect the display of the game
*/

let CANVAS_WIDTH = 500;
let CANVAS_HEIGHT = 500;

/** 
 * Game Variables
 * These affect the way the game functions
*/

// 
let score = 0;
let tile = { x: 1, y: 1 };
let countdownTimer = 30;

// List of querySelectors
let canvas = document.getElementById("canvas");
let start = document.getElementById("start");

function startGame() {
  let ctx = canvas.getContext("2d");
  
  function repeatForever() {
  // background
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

  // player

  ctx.fillStyle = "white";
  ctx.fillRect(0 * tile.x, 0 * tile.y, 100, 100);
}

  window.requestAnimationFrame(() => {
    repeatForever();
  })
}

function verifyCollision() {

}

function gameOver() {
  
}



startGame()