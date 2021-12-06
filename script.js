/*
 * This file is part of htmlMaze created by JakeMoe.
 * <https://github.com/JakeMoe/htmlMaze>
 *
 * htmlMaze is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * htmlMaze is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with htmlMaze.  If not, see <https://www.gnu.org/licenses/>.
 */

let ctx;
let canvas;
let maze;
let mazeHeight;
let mazeWidth;
let player;
let events;
let currentLevel = 1;
let sprite = new Image(25, 25);
let eventSprite = new Image(246.75, 90);
const multipliers = [
  10,
  15,
  20,
  25
];
const messageCount = 19;

class Player {

  constructor() {
    this.col = 0;
    this.row = 0;
  }
}

class Events {

  constructor() {
    
    this.eventMessages = [];
    this.generate();

  }

  generate() {

    for (let i = 0; i < messageCount; i++) {
      this.eventMessages.push(new EventMessage("Assets/EventMessages/achievementArtboard " + (i + 1) + ".png"));
    }
  
  }

  achievementGet() {
    let allAcquired = true;

    for (let i = 0; i < this.eventMessages.length; i++) {
      if (!this.eventMessages[i].acquired) {
        allAcquired = false;
        break;
      }
    }

    if (allAcquired) {
      console.log("Achievement get! You have collected all events!");
    }

    return allAcquired;
  }

}

class EventMessage {

  constructor(message) {
    this.message = message;
    this.acquired = false;
    this.acquiredCount = 0;
  }

}

class MazeCell {

  constructor(col, row) {
    this.col = col;
    this.row = row;

    this.eastWall = true;
    this.northWall = true;
    this.southWall = true;
    this.westWall = true;

    this.visited = false;
    this.hasEvent = false;
    this.eventMessage = "";
  }

}

class Maze {

  constructor(level, cellSize) {

    this.backgroundColor = "#ffffff";
    this.cols = multipliers[level - 1];
    this.endColor = "#88FF88";
    this.mazeColor = "#000000";
    this.eventColor = "#a6dee0";
    this.playerColor = "#880088";
    this.rows = multipliers[level - 1];
    this.cellSize = cellSize;

    this.cells = [];
    this.eventCells = [];

    this.generate();
    this.generateEvents();

  }

  // Randomizes a maze
  generate() {

    mazeHeight = this.rows * this.cellSize;
    mazeWidth = this.cols * this.cellSize;

    canvas.height = mazeHeight;
    canvas.width = mazeWidth;
    canvas.style.height = mazeHeight;
    canvas.style.width = mazeWidth;

    for (let col = 0; col < this.cols; col++) {
      this.cells[col] = [];
      for (let row = 0; row < this.rows; row++) {
        this.cells[col][row] = new MazeCell(col, row);
      }
    }

    let rndCol = Math.floor(Math.random() * this.cols);
    let rndRow = Math.floor(Math.random() * this.rows);

    let stack = [];
    stack.push(this.cells[rndCol][rndRow]);

    let currCell;
    let dir;
    let foundNeighbor;
    let nextCell;

    while (this.hasUnvisited(this.cells)) {
      currCell = stack[stack.length - 1];
      currCell.visited = true;
      if (this.hasUnvisitedNeighbor(currCell)) {
        nextCell = null;
        foundNeighbor = false;
        do {
          dir = Math.floor(Math.random() * 4);
          switch (dir) {
            case 0:
              if (currCell.col !== (this.cols - 1) && !this.cells[currCell.col + 1][currCell.row].visited) {
                currCell.eastWall = false;
                nextCell = this.cells[currCell.col + 1][currCell.row];
                nextCell.westWall = false;
                foundNeighbor = true;
              }
              break;
            case 1:
              if (currCell.row !== 0 && !this.cells[currCell.col][currCell.row - 1].visited) {
                currCell.northWall = false;
                nextCell = this.cells[currCell.col][currCell.row - 1];
                nextCell.southWall = false;
                foundNeighbor = true;
              }
              break;
            case 2:
              if (currCell.row !== (this.rows - 1) && !this.cells[currCell.col][currCell.row + 1].visited) {
                currCell.southWall = false;
                nextCell = this.cells[currCell.col][currCell.row + 1];
                nextCell.northWall = false;
                foundNeighbor = true;
              }
              break;
            case 3:
              if (currCell.col !== 0 && !this.cells[currCell.col - 1][currCell.row].visited) {
                currCell.westWall = false;
                nextCell = this.cells[currCell.col - 1][currCell.row];
                nextCell.eastWall = false;
                foundNeighbor = true;
              }
              break;
          }
          if (foundNeighbor) {
            stack.push(nextCell);
          }
        } while (!foundNeighbor)
      } else {
        currCell = stack.pop();
      }
    }

    this.redraw();

  }

  // Populates the maze with events
  generateEvents() {
    let totalEvents = 6 * multipliers[currentLevel - 1] / 10;
    let rndCol = Math.floor(Math.random() * (this.cols - 1));
    let rndRow = Math.floor(Math.random() * (this.rows - 1));

    while (totalEvents > 0) {
      while (this.cells[rndCol][rndRow].hasEvent || (rndCol == 0 && rndRow == 0)) {
        rndCol = Math.floor(Math.random() * (this.cols - 1));
        rndRow = Math.floor(Math.random() * (this.rows - 1));
      }

      ctx.fillStyle = this.eventColor;
      ctx.fillRect(rndCol * this.cellSize + 2, rndRow * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4);

      this.cells[rndCol][rndRow].hasEvent = true;
      this.eventCells.push(this.cells[rndCol][rndRow]);

      totalEvents--;
    }
  }

  hasUnvisited() {
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (!this.cells[col][row].visited) {
          return true;
        }
      }
    }
    return false;
  }

  hasUnvisitedNeighbor(mazeCell) {
    return ((mazeCell.col !== 0               && !this.cells[mazeCell.col - 1][mazeCell.row].visited) ||
            (mazeCell.col !== (this.cols - 1) && !this.cells[mazeCell.col + 1][mazeCell.row].visited) ||
            (mazeCell.row !== 0               && !this.cells[mazeCell.col][mazeCell.row - 1].visited) ||
            (mazeCell.row !== (this.rows - 1) && !this.cells[mazeCell.col][mazeCell.row + 1].visited));
  }

  // Outlines the walls of the maze
  redraw() {

    // Colors the maze background
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, mazeHeight, mazeWidth);

    // Colors the maze end
    ctx.fillStyle = this.endColor;
    ctx.fillRect((this.cols - 1) * this.cellSize, (this.rows - 1) * this.cellSize, this.cellSize, this.cellSize);

    ctx.strokeStyle = this.mazeColor;
    ctx.strokeRect(0, 0, mazeHeight, mazeWidth);

    // Draws the maze walls
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (this.cells[col][row].eastWall) {
          ctx.beginPath();
          ctx.moveTo((col + 1) * this.cellSize, row * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].northWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, row * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, row * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].southWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, (row + 1) * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].westWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, row * this.cellSize);
          ctx.lineTo(col * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = this.eventColor;
    
    // Colors the event cells
    for (let i = 0; i < this.eventCells.length; i++) {
      ctx.fillRect(this.eventCells[i].col * this.cellSize + 2, this.eventCells[i].row * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4);
    }

    sprite.src = "Assets/CharacterNobg.png";

    // Loads the player sprite
    sprite.onload = function() {
      ctx.drawImage(sprite, player.col * 25, player.row * 25, sprite.width, sprite.height);
    }

  }

}

function checkEvent() {
  // Displays randomized event message
  for (let i = 0; i < maze.eventCells.length; i++) {
    let rand = Math.floor(Math.random() * events.eventMessages.length);
    
    if (maze.eventCells[i].col == player.col && maze.eventCells[i].row == player.row) {
      // If all event messages have not been collected, each message will be displayed a maximum of 3 times
      if (!events.achievementGet()) {
        while (events.eventMessages[rand].acquiredCount == 3) {
          rand = Math.floor(Math.random() * events.eventMessages.length);
        }
      }
      eventSprite.src = events.eventMessages[rand].message;

      // Displays eventMessage image
      eventSprite.onload = function() {
        var audio = new Audio(src="Assets/eventsound.mp3");
        audio.play();
        ctx.drawImage(eventSprite, (multipliers[currentLevel - 1] * 25 - eventSprite.width) / 2, (multipliers[currentLevel - 1] * 25 - eventSprite.height) / 2, eventSprite.width, eventSprite.height);
      }

      events.eventMessages[rand].acquiredCount++;
      events.eventMessages[rand].acquired = true;
      maze.eventCells.splice(i, 1);
    }
  }
}

// Checks whether to display the Next Level/Play Again button or not
function checkWin() {
  if (player.col == maze.cols - 1 && player.row == maze.rows - 1) {
    var audio = new Audio(src="Assets/eventsound.mp3");
      audio.play(); 
    if (currentLevel < 4) {
      toggleVisablity("nextLevel");
    } else {     
      document.location.href = "endScreen.html";
      toggleVisablity("playAgain");
    }
    document.removeEventListener("keydown", onKeyDown);
  }
}

// Creates a new maze level
function nextLevel() {
  if (currentLevel < 4) {
    var audio = new Audio(src="Assets/nextlevel.mp3");
    audio.play(); 
    currentLevel++;
    toggleVisablity("nextLevel");
  } else {
    currentLevel = 1;
    events = new Events();
    document.getElementById("playAgain").style.visibility == "visible";
    //toggleVisablity("playAgain");
  }

  document.getElementById("level").innerHTML = "Level " + currentLevel;

  maze = new Maze(currentLevel, 25);
  player = new Player();
  maze.redraw();
  document.addEventListener("keydown", onKeyDown);
}

// Adjusts player's position when an arrow key is pressed
function onKeyDown(event) {
  switch (event.keyCode) {
    case 37:
    case 65:
      if (!maze.cells[player.col][player.row].westWall) {
        player.col -= 1;
      }
      break;
    case 39:
    case 68:
      if (!maze.cells[player.col][player.row].eastWall) {
        player.col += 1;
      }
      break;
    case 40:
    case 83:
      if (!maze.cells[player.col][player.row].southWall) {
        player.row += 1;
      }
      break;
    case 38:
    case 87:
      if (!maze.cells[player.col][player.row].northWall) {
        player.row -= 1;
      }
      break;
    default:
      break;
  }

  checkEvent();
  maze.redraw();
  checkWin();
}

// Hides/unhides html elements
function toggleVisablity(id) {
  if (document.getElementById(id).style.visibility == "visible") {
    document.getElementById(id).style.visibility = "hidden";
  } else {
    document.getElementById(id).style.visibility = "visible";
  }
}

function onLoad() {

  canvas = document.getElementById("mainForm");
  ctx = canvas.getContext("2d");

  player = new Player();
  events = new Events();
  maze = new Maze(1, 25);

  document.addEventListener("keydown", onKeyDown);
  document.getElementById("level").innerHTML = "Level " + currentLevel;
  document.getElementById("nextLevel").addEventListener("click", nextLevel);
  document.getElementById("playAgain").addEventListener("click", nextLevel);
}
