"use strict"

/** 
 * Game Constants, Variables
 * These affect the display and mood of the game
*/

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const MAZE_SIZE = CANVAS_WIDTH;
const MAZE_ROWS = 10;
const MAZE_COLUMNS = 10;

const MAZE_ROW_SCALE = MAZE_SIZE / MAZE_ROWS;
const MAZE_COLUMN_SCALE = MAZE_SIZE / MAZE_COLUMNS;

const MAZE_COUNTDOWN = 30;
const MAZE_PELLET_SCORE = 1;

let highscore = 1000;
let score = 0;
let timer = null;
let current;

// import pacman from "/assets/pacman.json" assert { type: "json" };

// START OF EXTERNAL CODE

class Sprite {
  /** 
   * https://codehs.com/tutorial/andy/Programming_Sprites_in_JavaScript
   * Code by Andy Bayer
  */

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

class Sprite_V2 {
  /** 
   * https://codehs.com/tutorial/andy/Programming_Sprites_in_JavaScript
   * Code by Andy Bayer
  */

  constructor(src, name) {
    this.src = src;
    this.name = name;
    this.ready = false;
  }

  async initialize() {
    const response = await fetch(this.src);
    const json = await response.json();

    this.meta = json.sprites[this.name].meta;
    this.animation = json.sprites[this.name].animation;

    this.ready = true;
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
  constructor() {
    this.image = new Image();
    this.image.src = "/assets/images/sprites.png";

    this.sprite = new Sprite(13, 13, 7, 7);

    this.animation = {
      "left": [
        [0, 2],
        [0, 0],
        [0, 1],
        [0, 0],
      ],
      "right": [
        [0, 2],
        [1, 0],
        [1, 1],
        [1, 0],
      ],
      "up": [
        [0, 2],
        [2, 0],
        [2, 1],
        [2, 0],
      ],
      "down": [
        [0, 2],
        [3, 0],
        [3, 1],
        [3, 0],
      ],

      "death": [
        [12, 0],
        [12, 1],
        [12, 2],
        [12, 3],
        [12, 4],
        [12, 5],
        [12, 6],
        [12, 7],
        [12, 8],
        [12, 9],
        [12, 10],
      ]
    }

    // Coordinates of Pac Man
    this.rowNumber = 0;
    this.columnNumber = 0;

    // Direction Pac Man Faces

    this.interval = null;
    this.direction = "death";
    this.changeAnimation();

    this.createEvents();
  }

  movePlayer() {
    if (this.direction == "left") { this.rowNumber-- }
    else if (this.direction == "right") { this.rowNumber++ }
    else if (this.direction == "up") { this.columnNumber-- }
    else if (this.direction == "down") { this.columnNumber++ };

    if (this.rowNumber < 0) { this.rowNumber = 0; }
    if (this.columnNumber < 0) { this.columnNumber = 0; }
    if (this.rowNumber > MAZE_ROWS - 1) { this.rowNumber = MAZE_ROWS - 1; }
    if (this.columnNumber > MAZE_COLUMNS - 1) { this.columnNumber = MAZE_COLUMNS - 1; }
  }

  changeAnimation() {
    clearInterval(this.interval);

    this.frame = 0;

    this.position = this.sprite.toImagePosition(
      this.animation[this.direction][this.frame][0],
      this.animation[this.direction][this.frame][1]
    );

    this.movePlayer();

    this.interval = setInterval(() => {
      if (this.frame == this.animation[this.direction].length - 1) {
        this.frame = 0;
      } else {
        this.frame++;
      }

      this.position = this.sprite.toImagePosition(
        this.animation[this.direction][this.frame][0],
        this.animation[this.direction][this.frame][1]
      );

      this.movePlayer();
    }, 41.66666 * 2);

    // This checks if out of bounds, if so, moves back

  }

  createEvents() {
    window.onkeydown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
        case "A":
        case "a":
          this.direction = "left";
          break;
        case "ArrowRight":
        case "D":
        case "d":
          this.direction = "right";
          break;
        case "ArrowUp":
        case "W":
        case "w":
          this.direction = "up";
          break;
        case "ArrowDown":
        case "A":
        case "a":
          this.direction = "down";
          break;
      }

      this.changeAnimation();
    }
  }

  render(ctx) {
    ctx.save();

    ctx.translate(this.rowNumber * MAZE_ROW_SCALE, this.columnNumber * MAZE_COLUMN_SCALE)

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.sprite.width,
      this.sprite.height,
      0,
      0,
      MAZE_ROW_SCALE,
      MAZE_COLUMN_SCALE
    );

    ctx.restore();
  }
}

// https://www.youtube.com/watch?v=nHjqkLV_Tp0

class Maze {
  constructor(player) {
    this.player = player;
    this.grid = [];
    this.stack = [];
    this.ready = false;

    // You can predict how many steps it will take to finish the maze.
    // This program is not very efficient and is 

    this.estimatedTotalSteps = 2 * (MAZE_COLUMNS * MAZE_ROWS);
    this.steps = 2;
  }

  get progress() {
    return this.steps / this.estimatedTotalSteps;
  }

  initialize() {
    for (let r = 0; r < MAZE_ROWS; r++) {
      let row = [];
      for (let c = 0; c < MAZE_COLUMNS; c++) {
        let cell = new Cell(r, c, this.grid);

        row.push(cell);
      }
      this.grid.push(row);
    }

    current = this.grid[0][0];
  }

  generateMaze(ctx) {
    let next = current.checkNeighbors();

    if (next) {
      next.visited = true;

      this.stack.push(current);

      current.highlight(ctx);

      current.removeWalls(current, next);

      current = next;
    } else if (this.stack.length > 0) {
      let cell = this.stack.pop();

      current = cell;
      current.highlight(ctx);
    }

    this.steps++;

    if (this.stack.length == 0) {
      this.ready = true;
      return;
    }
  }

  render(ctx) {
    current.visited = true;

    for (let r = 0; r < MAZE_ROWS; r++) {
      for (let c = 0; c < MAZE_COLUMNS; c++) {
        let grid = this.grid;
        grid[r][c].render(ctx);
      }
    }

    if (!this.ready) this.generateMaze(ctx);
  }
}

class Cell {
  constructor(rowNumber, columnNumber, parentGrid, parentSize) {
    this.rowNumber = rowNumber;
    this.columnNumber = columnNumber
    this.parentGrid = parentGrid;
    this.visited = false;

    this.walls = {
      left: true,
      right: true,
      top: true,
      bottom: true
    }
  }

  removeWalls(cell1, cell2) {
    // If there are two overlaping walls, remove one wall
    // OMGOOSH FINALLY FOUND THE ERROR AND IT WAS HERE!!!! ASFHA(UISVFUIASHFHUAHSFUIJA SFUIAUI)
    let x = cell1.columnNumber - cell2.columnNumber;

    if (x == 1) {
      cell1.walls.left = false;
      cell2.walls.right = false;
    } else if (x == -1) {
      cell1.walls.right = false;
      cell2.walls.left = false;
    }

    let y = cell1.rowNumber - cell2.rowNumber;

    if (y == 1) {
      cell1.walls.top = false;
      cell2.walls.bottom = false;
    } else if (y == -1) {
      cell1.walls.bottom = false;
      cell2.walls.top = false;
    }
  }

  checkNeighbors() {
    let grid = this.parentGrid;
    let row = this.rowNumber;
    let col = this.columnNumber;
    let neighbors = [];


    let top = (row !== 0) ? grid[row - 1][col] : undefined;
    let right = (col !== grid.length - 1) ? grid[row][col + 1] : undefined;
    let bottom = (row !== grid.length - 1) ? grid[row + 1][col] : undefined;
    let left = (col !== 0) ? grid[row][col - 1] : undefined;

    if (left && !left.visited) neighbors.push(left);
    if (right && !right.visited) neighbors.push(right);
    if (top && !top.visited) neighbors.push(top);
    if (bottom && !bottom.visited) neighbors.push(bottom);

    if (neighbors.length !== 0) {
      // Gets a random element from neighbors list to go to next
      let random = Math.floor(Math.random() * neighbors.length);

      return neighbors[random];
    } else {
      return undefined;
    }
  }

  highlight(ctx) {
    let x = (this.columnNumber * MAZE_SIZE) / MAZE_COLUMNS + 1;
    let y = (this.rowNumber * MAZE_SIZE) / MAZE_COLUMNS + 1;

    ctx.fillStyle = "purple";
    ctx.fillRect(x, y, MAZE_SIZE / MAZE_COLUMNS - 3, MAZE_SIZE / MAZE_COLUMNS - 3);
  }

  render(ctx) {
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#f002";
    ctx.lineWidth = 3;

    if (this.walls.left) {
      ctx.beginPath();
      ctx.moveTo(MAZE_COLUMN_SCALE * this.columnNumber, MAZE_ROW_SCALE * this.rowNumber);
      ctx.lineTo(MAZE_COLUMN_SCALE * this.columnNumber, MAZE_ROW_SCALE * this.rowNumber + MAZE_ROW_SCALE);
      ctx.stroke();
    }

    if (this.walls.right) {
      ctx.beginPath();
      ctx.moveTo(MAZE_COLUMN_SCALE * this.columnNumber + MAZE_COLUMN_SCALE, MAZE_ROW_SCALE * this.rowNumber);
      ctx.lineTo(MAZE_COLUMN_SCALE * this.columnNumber + MAZE_COLUMN_SCALE, MAZE_ROW_SCALE * this.rowNumber + MAZE_ROW_SCALE);
      ctx.stroke();
    }

    if (this.walls.top) {
      ctx.beginPath();
      ctx.moveTo(MAZE_COLUMN_SCALE * this.columnNumber, MAZE_ROW_SCALE * this.rowNumber);
      ctx.lineTo(MAZE_COLUMN_SCALE * this.columnNumber + MAZE_ROW_SCALE, MAZE_ROW_SCALE * this.rowNumber);
      ctx.stroke();
    }

    if (this.walls.bottom) {
      ctx.beginPath();
      ctx.moveTo(MAZE_COLUMN_SCALE * this.columnNumber, MAZE_ROW_SCALE * this.rowNumber + MAZE_ROW_SCALE);
      ctx.lineTo(MAZE_COLUMN_SCALE * this.columnNumber + MAZE_COLUMN_SCALE, MAZE_ROW_SCALE * this.rowNumber + MAZE_ROW_SCALE);
      ctx.stroke();
    }

    if (this.visited) {
      ctx.fillRect(MAZE_COLUMN_SCALE * this.columnNumber, MAZE_ROW_SCALE * this.rowNumber, MAZE_COLUMN_SCALE, MAZE_ROW_SCALE);
    }
  }
}

// List of querySelectors
let canvas = document.getElementById("canvas");
let start = document.getElementById("start");

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

function startGame() {
  let ctx = canvas.getContext("2d");

  let player = new Player();
  let maze = new Maze(player);
  maze.initialize();

  let pacman = new Sprite_V2("/assets/js/sprites.json", "@pacman/default");

  // How do I initialize this if it's asynchronous?
  console.log(pacman.animation)

  function repeatForever() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // maze
    maze.render(ctx);

    // player

    if (maze.ready) player.render(ctx);

    if (!maze.ready) {
      // background
      ctx.fillStyle = "#000c";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#fff";
      ctx.textAlign = "left";
      ctx.font = "12px monospace";
      ctx.fillText(`${(maze.progress * 100).toFixed(1)}%`, 12, 24);
      
      ctx.font = "24px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Loading Maze...", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

      ctx.fillStyle = "#ff0";
      ctx.fillRect(0, 0, CANVAS_WIDTH * (maze.progress), 4);
    }

    window.requestAnimationFrame(repeatForever);
  }

  window.requestAnimationFrame(repeatForever);
}

function loadingScreen(ctx) {
  
}

function gameOver(ctx) {

}

startGame()