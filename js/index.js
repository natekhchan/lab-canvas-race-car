let canvas, ctx, roadImg, carImg, carX;
const obstacles = [];
const roadStartX = 50; // Adjust based on your road image
const roadEndX = 450;  // Adjust based on your road image
let maxObstacleWidth;
let roadY1 = 0;
let roadY2;
let obstacleSpeed = 1.5; // Initial obstacle speed
let score = 0; // Initial score
let gameOver = false; // Game over flag
const carWidth = 50;
const carHeight = 100;
let gameInterval; // To keep track of the game update interval

function startGame() {
  // Check if a game is already running, if so, reset it
  if (gameInterval) {
    resetGame();
  }

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  maxObstacleWidth = canvas.width * 0.4; // Maximum width is 40% of the canvas width
  roadImg = new Image();
  roadImg.src = 'images/road.png';
  carImg = new Image();
  carImg.src = 'images/car.png';
  carX = (canvas.width - carWidth) / 2; // Center car horizontally
  roadY2 = -canvas.height; // Initialize the second road image position

  roadImg.onload = () => {
    carImg.onload = () => {
      // Start creating obstacles and updating the game
      setInterval(createObstacle, 2000); // Create a new obstacle every 2 seconds
      gameInterval = requestAnimationFrame(updateGame);
    };
  };

  document.addEventListener('keydown', moveCar);

  // Increase the drop speed after 20 seconds
  setTimeout(() => {
    obstacleSpeed *= 1.2;
  }, 20000);

  // Increase the score by 1 point every second
  setInterval(() => {
    if (!gameOver) {
      score += 1;
    }
  }, 1000);
}

function resetGame() {
  // Clear existing game state
  if (gameInterval) {
    cancelAnimationFrame(gameInterval);
    gameInterval = null;
  }

  // Clear all obstacles
  obstacles.length = 0;

  // Reset game variables
  roadY1 = 0;
  roadY2 = -canvas.height;
  obstacleSpeed = 1.5;
  score = 0;
  gameOver = false;
  carX = (canvas.width - carWidth) / 2; // Center car horizontally

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Restart the game
  startGame();
}

function createObstacle() {
  const minObstacleWidth = 300;
  const obstacleWidth = Math.random() * (maxObstacleWidth - minObstacleWidth) + minObstacleWidth;
  let obstacleX;

  // Randomize the starting position of the obstacle
  const positionType = Math.floor(Math.random() * 3);
  if (positionType === 0) {
    obstacleX = roadStartX;
  } else if (positionType === 1) {
    obstacleX = roadEndX - obstacleWidth;
  } else {
    obstacleX = (canvas.width - obstacleWidth) / 2;
  }

  const lastObstacleY = obstacles.length > 0 ? obstacles[obstacles.length - 1].y : 0;
  const obstacleY = lastObstacleY - 300; // Spacing obstacles 300 pixels apart
  obstacles.push({ x: obstacleX, y: obstacleY, width: obstacleWidth, height: 20 });
}

function moveCar(event) {
  if (event.key === 'ArrowLeft' && carX > roadStartX) {
    carX -= 10;
  } else if (event.key === 'ArrowRight' && carX < roadEndX - carWidth) {
    carX += 10;
  }
}

function checkCollision(carX, carY, carWidth, carHeight, obstacle) {
  return (
    carX < obstacle.x + obstacle.width &&
    carX + carWidth > obstacle.x &&
    carY < obstacle.y + obstacle.height &&
    carY + carHeight > obstacle.y
  );
}

function updateGame() {
  if (gameOver) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move the road images upwards
  roadY1 += obstacleSpeed;
  roadY2 += obstacleSpeed;

  // Draw the road images
  ctx.drawImage(roadImg, 0, roadY1, canvas.width, canvas.height);
  ctx.drawImage(roadImg, 0, roadY2, canvas.width, canvas.height);

  // Reset the road images when they move off the canvas
  if (roadY1 >= canvas.height) {
    roadY1 = roadY2 - canvas.height;
  }
  if (roadY2 >= canvas.height) {
    roadY2 = roadY1 - canvas.height;
  }

  // Draw the car
  ctx.drawImage(carImg, carX, canvas.height - carHeight - 10, carWidth, carHeight);

  // Update and draw obstacles
  obstacles.forEach((obstacle, index) => {
    obstacle.y += obstacleSpeed; // Increasing the drop speed

    ctx.fillStyle = 'brown';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    // Check for collision
    if (checkCollision(carX, canvas.height - carHeight - 10, carWidth, carHeight, obstacle)) {
      gameOver = true;
      displayGameOver();
    }

    // Remove obstacles that have moved off the screen
    if (obstacle.y > canvas.height) {
      obstacles.splice(index, 1);
      score += 10; // Increase score for each obstacle avoided
    }
  });

  // Draw the score
  ctx.font = '35px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Score: ${score}`, 65, 40); // Position the score 40 pixels from the top and 65 pixels from the left
  
  gameInterval = requestAnimationFrame(updateGame);
}

function displayGameOver() {
  // Clear all obstacles
  obstacles.length = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '40px Arial';
  ctx.fillStyle = 'red';
  ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 30);

  ctx.font = '30px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Your final score: ${score}`, canvas.width / 2 - 150, canvas.height / 2 + 30);
}

window.addEventListener('load', () => {
  let startBtn = document.querySelector('#start-button');
  startBtn.addEventListener('click', startGame);
});
