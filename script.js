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
let countdownTimer = 30;

// START OF EXTERNAL CODE

// https://codehs.com/tutorial/andy/Programming_Sprites_in_JavaScript
// Code by Andy Bayer

class Sprite {
  constructor(spriteWidth, spriteHeight, borderWidth, spacingWidth) {
    this.width = spriteWidth;
    this.height = spriteHeight;
    this.offsetLeft = 0;
    this.offsetRight = 0;
    this.borderWidth = borderWidth;
    this.spacingWidth = spacingWidth;
  }

  toImagePosition(row, col) {
    
    return {
      x: (
            this.borderWidth +
            col * (this.spacingWidth + this.width)
      ),
      y: (
          this.borderWidth +
          row * (this.spacingWidth + this.height)
      )
    }
  }
}

// END OF EXTERNAL CODE

class Player {
  constructor(ctx) {
    this.ctx = ctx;
    
    this.image = new Image();
    this.image.src = "/assets/sprites.png";

    this.sprite = new Sprite(13,13,7,7);

    // Coordinate/Position
    this.x = 0;
    this.y = 0;
    this.scale = 50;
    this.position = this.sprite.toImagePosition(0,0);

    this.createEvents();
  }

  createEvents() {
    window.onkeydown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
        case "A":
        case "a":
          this.position = this.sprite.toImagePosition(0,0);
          this.x--;
          break;
        case "ArrowRight":
        case "D":
        case "d":
          this.position = this.sprite.toImagePosition(1,0);
          this.x++;
          break;
        case "ArrowUp":
        case "W":
        case "w":
          this.position = this.sprite.toImagePosition(2,0);
          this.y--;
          break;
        case "ArrowDown":
        case "A":
        case "a":
          this.position = this.sprite.toImagePosition(3,0);
          this.y++;
          break;
      }
    }
  }

  render() {
    let ctx = this.ctx;

    ctx.save();

    ctx.translate(this.x * this.scale, this.y * this.scale)

    ctx.imageSmoothingEnabled = false;
    
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.sprite.width,
      this.sprite.height,
      0,
      0,
      this.scale,
      this.scale
    );
    
    ctx.restore();
  }
}

// List of querySelectors
let canvas = document.getElementById("canvas");
let start = document.getElementById("start");

function startGame() {
  let ctx = canvas.getContext("2d");

  let player = new Player(ctx);
  
  function repeatForever() {
    ctx.clearRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
    // background
    // ctx.fillStyle = "black";
    // ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  
    // player
    player.render();
  
    window.requestAnimationFrame(repeatForever);
  }

  window.requestAnimationFrame(repeatForever)
}

function verifyCollision() {

}

function gameOver() {
  
}

startGame()