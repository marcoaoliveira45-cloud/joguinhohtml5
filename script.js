const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");
const startButton = document.querySelector("#start-button");
const bestScoreElement = document.querySelector("#best-score");
const gameStatus = document.querySelector("#game-status");

const width = canvas.width;
const height = canvas.height;
const groundY = height - 32;
const player = {
  x: 78,
  y: groundY - 52,
  width: 48,
  height: 52,
  velocityY: 0,
  grounded: true
};

let state = "ready";
let distance = 0;
let score = 0;
let bestScore = 0;
let speed = 360;
let runTime = 0;
let nextObstacleDistance = 340;
let lastFrameTime = 0;
let obstacles = [];
let difficulty = 0;
let isNight = false;

const stars = [
  [42, 34], [105, 78], [174, 28], [238, 92], [292, 42], [358, 71],
  [423, 30], [491, 86], [547, 39], [617, 72], [685, 31], [754, 83]
];

const obstacleTypes = [
  { label: "</>", width: 48, height: 42, color: "#438b5b" },
  { label: "<div>", width: 66, height: 48, color: "#6556c9" },
  { label: "<body>", width: 76, height: 56, color: "#df673e" }
];

function startGame() {
  if (state === "running") {
    window.submitLeaderboardScore(score);
  }

  state = "running";
  distance = 0;
  score = 0;
  speed = 360;
  difficulty = 0;
  isNight = false;
  runTime = 0;
  nextObstacleDistance = 340;
  obstacles = [];
  player.y = groundY - player.height;
  player.velocityY = 0;
  player.grounded = true;
  startButton.innerHTML = 'Reiniciar <span aria-hidden="true">↻</span>';
  gameStatus.textContent = "Jogo iniciado. Pule para desviar das tags.";
  canvas.focus({ preventScroll: true });
}

function jump() {
  if (state !== "running") {
    startGame();
    return;
  }

  if (player.grounded) {
    player.velocityY = -690;
    player.grounded = false;
  }
}

function finishGame() {
  state = "gameover";
  bestScore = Math.max(bestScore, score);
  bestScoreElement.textContent = String(bestScore).padStart(5, "0");
  startButton.innerHTML = 'Jogar novamente <span aria-hidden="true">↻</span>';
  gameStatus.textContent = `Fim de jogo. Sua pontuação: ${score}. Aperte espaço ou o botão para jogar novamente.`;
  window.submitLeaderboardScore(score);
  startButton.focus({ preventScroll: true });
}

function update(delta) {
  distance += speed * delta;
  score = Math.floor(distance / 10);
  difficulty = Math.floor(score / 1000);
  isNight = score >= 4000 && score % 4000 < 1000;
  speed = Math.min(360 + difficulty * 90, 900);
  runTime += delta;

  player.velocityY += 1900 * delta;
  player.y += player.velocityY * delta;
  if (player.y >= groundY - player.height) {
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.grounded = true;
  }

  if (distance >= nextObstacleDistance) {
    const meteorChance = isNight ? 0.35 : 0;
    const flyingChance = Math.min(0.25 + difficulty * 0.08, 0.65);
    if (Math.random() < meteorChance) {
      obstacles.push({
        kind: "meteor",
        x: width + 12,
        y: -18,
        width: 34,
        height: 24,
        fallSpeed: 220 + Math.random() * 50
      });
    } else if (Math.random() < flyingChance) {
      const birdHeight = 26;
      const birdY = Math.random() < 0.7 ? groundY - 68 : groundY - 124;
      obstacles.push({
        kind: "bird",
        x: width + 12,
        y: birdY,
        width: 46,
        height: birdHeight
      });
    } else {
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      obstacles.push({ ...type, kind: "ground", x: width + 12, y: groundY - type.height });
    }

    const baseGap = Math.max(0.72, 1.65 - difficulty * 0.12);
    const variableGap = Math.max(0.12, 0.5 - difficulty * 0.04);
    const gapInSeconds = baseGap + Math.random() * variableGap;
    nextObstacleDistance = distance + speed * gapInSeconds;
  }

  obstacles.forEach((obstacle) => {
    obstacle.x -= speed * delta;
    if (obstacle.kind === "meteor") obstacle.y += obstacle.fallSpeed * delta;
  });
  obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width > 0 && obstacle.y < height);

  const playerBox = {
    left: player.x + 8,
    right: player.x + player.width - 6,
    top: player.y + 5,
    bottom: player.y + player.height
  };
  const hit = obstacles.some((obstacle) => (
    playerBox.right > obstacle.x + 5
    && playerBox.left < obstacle.x + obstacle.width - 5
    && playerBox.bottom > obstacle.y + 4
    && playerBox.top < obstacle.y + obstacle.height - 4
  ));

  if (hit && !window.isAdminPlayer()) finishGame();
}

function drawBackground() {
  context.fillStyle = isNight ? "#17213f" : "#fffdf6";
  context.fillRect(0, 0, width, height);

  if (isNight) {
    context.fillStyle = "#f4e7b2";
    stars.forEach(([x, y]) => context.fillRect(x, y, 3, 3));
    context.beginPath();
    context.arc(704, 53, 19, 0, Math.PI * 2);
    context.fillStyle = "#f4e7b2";
    context.fill();
    context.beginPath();
    context.arc(713, 45, 18, 0, Math.PI * 2);
    context.fillStyle = "#17213f";
    context.fill();
  }

  context.fillStyle = isNight ? "#35405d" : "#e8e4d7";
  [42, 116, 196].forEach((baseX, index) => {
    const drift = (distance * (0.08 + index * 0.025)) % (width + 60);
    const cloudX = (baseX - drift + width + 60) % (width + 60) - 30;
    const cloudY = 47 + index * 29;
    context.fillRect(cloudX, cloudY, 38, 6);
    context.fillRect(cloudX + 8, cloudY - 6, 20, 6);
  });

  context.fillStyle = isNight ? "#65708b" : "#ded9cb";
  context.font = "bold 12px monospace";
  context.fillText("<html>", 310, 64);
  context.fillText("</body>", 605, 113);
}

function drawGround() {
  context.fillStyle = isNight ? "#d0c8b7" : "#4b4337";
  context.fillRect(0, groundY, width, 3);
  context.fillStyle = isNight ? "#4c5875" : "#d9d3c4";
  const offset = (distance * 0.8) % 46;
  for (let x = -46 + offset; x < width; x += 46) {
    context.fillRect(x, groundY + 13, 22, 4);
  }
}

function drawPlayer() {
  const x = Math.round(player.x);
  const y = Math.round(player.y);
  const legFrame = player.grounded ? Math.floor(runTime * 12) % 2 : 0;

  context.fillStyle = "#e6e0d1";
  context.fillRect(x + 4, groundY + 2, 44, 5);

  context.fillStyle = "#a9381f";
  context.fillRect(x + 8, y, 32, 6);
  context.fillRect(x + 4, y + 6, 40, 34);
  context.fillRect(x + 8, y + 40, 32, 6);
  context.fillRect(x + 14, y + 46, 20, 4);

  context.fillStyle = "#f26a3d";
  context.fillRect(x + 12, y + 6, 24, 5);
  context.fillRect(x + 8, y + 12, 32, 24);
  context.fillRect(x + 12, y + 36, 24, 5);

  context.fillStyle = "#fff8e9";
  context.font = "bold 14px monospace";
  context.textAlign = "center";
  context.fillText("</>", x + 24, y + 29);
  context.textAlign = "left";

  context.fillStyle = "#4b4337";
  context.fillRect(x + 10, y + 48, 10, 4);
  context.fillRect(x + (legFrame ? 30 : 26), y + 48, 10, 4);
  context.fillRect(x + (legFrame ? 6 : 8), y + 50, 8, 2);
  context.fillRect(x + (legFrame ? 32 : 34), y + 50, 8, 2);
}

function drawObstacle(obstacle) {
  const x = Math.round(obstacle.x);
  const y = Math.round(obstacle.y);

  if (obstacle.kind === "bird") {
    drawBird(obstacle, x, y);
    return;
  }

  if (obstacle.kind === "meteor") {
    drawMeteor(x, y);
    return;
  }

  context.fillStyle = "#403a31";
  context.fillRect(x, y + 4, obstacle.width, obstacle.height - 4);
  context.fillStyle = obstacle.color;
  context.fillRect(x + 4, y, obstacle.width - 8, obstacle.height - 4);
  context.fillStyle = "#fff8e9";
  context.fillRect(x + 9, y + 8, 5, 4);
  context.fillRect(x + obstacle.width - 14, y + 8, 5, 4);
  context.font = `bold ${obstacle.width < 55 ? 11 : 10}px monospace`;
  context.textAlign = "center";
  context.fillText(obstacle.label, x + obstacle.width / 2, y + obstacle.height / 2 + 5);
  context.textAlign = "left";
}

function drawBird(obstacle, x, y) {
  const wingOffset = Math.floor(runTime * 12) % 2 ? 0 : 7;

  context.fillStyle = "#403a31";
  context.fillRect(x + 7, y + 10, 25, 9);
  context.fillRect(x + 27, y + 5, 11, 12);
  context.fillRect(x + 34, y + 9, 8, 4);
  context.fillRect(x + 2, y + 8, 7, 4);
  context.fillRect(x + 13, y + wingOffset, 17, 6);

  context.fillStyle = "#6556c9";
  context.fillRect(x + 9, y + 11, 21, 5);
  context.fillRect(x + 29, y + 7, 7, 7);
  context.fillRect(x + 15, y + wingOffset + 1, 12, 3);

  context.fillStyle = "#fff8e9";
  context.fillRect(x + 33, y + 8, 2, 2);
}

function drawMeteor(x, y) {
  context.fillStyle = "#e95838";
  context.fillRect(x + 7, y - 10, 7, 18);
  context.fillStyle = "#ffb14a";
  context.fillRect(x + 10, y - 8, 4, 13);
  context.fillStyle = "#713b43";
  context.fillRect(x + 12, y + 3, 17, 15);
  context.fillStyle = "#bb5540";
  context.fillRect(x + 16, y, 13, 14);
  context.fillStyle = "#f28a45";
  context.fillRect(x + 20, y + 4, 5, 5);
}

function drawScore() {
  context.fillStyle = "#514a3e";
  context.font = "bold 14px monospace";
  context.textAlign = "right";
  context.fillText(`PONTOS ${String(score).padStart(5, "0")}`, width - 18, 26);
  context.textAlign = "left";
  context.fillText(`NÍVEL ${difficulty + 1} · ${isNight ? "NOITE" : "DIA"}`, 18, 26);
}

function drawOverlay() {
  if (state === "running") return;

  context.fillStyle = "rgb(255 253 246 / 88%)";
  context.fillRect(128, 77, 544, 100);
  context.strokeStyle = "#d9d3c4";
  context.lineWidth = 3;
  context.strokeRect(129.5, 78.5, 541, 97);

  context.textAlign = "center";
  context.fillStyle = "#403a31";
  context.font = "bold 24px monospace";
  context.fillText(state === "ready" ? "HTML RUN" : "FIM DE JOGO", width / 2, 117);
  context.fillStyle = "#726958";
  context.font = "bold 12px monospace";
  context.fillText(
    state === "ready" ? "APERTE ESPACO OU TOQUE PARA CORRER" : `PONTOS ${score}  -  ESPACO PARA TENTAR DE NOVO`,
    width / 2,
    145
  );
  context.textAlign = "left";
}

function render() {
  context.imageSmoothingEnabled = false;
  drawBackground();
  drawGround();
  obstacles.forEach(drawObstacle);
  drawPlayer();
  drawScore();
  drawOverlay();
}

function frame(timestamp) {
  const delta = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 1000, 0.04) : 0;
  lastFrameTime = timestamp;

  if (state === "running") update(delta);
  render();
  window.requestAnimationFrame(frame);
}

function handleKeydown(event) {
  if (event.code !== "Space" && event.code !== "ArrowUp" && event.code !== "KeyW") return;
  event.preventDefault();
  if (event.repeat) return;
  jump();
}

startButton.addEventListener("click", startGame);
canvas.addEventListener("pointerdown", jump);
document.addEventListener("keydown", handleKeydown);

bestScoreElement.textContent = String(bestScore).padStart(5, "0");
render();
window.requestAnimationFrame(frame);
