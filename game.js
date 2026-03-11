const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const leaderboardList = document.getElementById("leaderboardList");
const gameOverPanel = document.getElementById("gameOverPanel");
const scoreForm = document.getElementById("scoreForm");
const saveMessage = document.getElementById("saveMessage");
const restartBtn = document.getElementById("restartBtn");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const ROAD_X = 60;
const ROAD_WIDTH = 240;
const ROAD_HEIGHT = canvas.height;
const LANE_COUNT = 3;
const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;

let score = 0;
let frame = 0;
let gameOver = false;
let enemySpawnRate = 55;
let roadLineOffset = 0;
let formSubmitted = false;

const player = {
  lane: 1,
  w: 34,
  h: 64,
  x: 0,
  y: canvas.height - 100
};

let enemies = [];

function updatePlayerPosition() {
  player.x = ROAD_X + player.lane * LANE_WIDTH + (LANE_WIDTH - player.w) / 2;
}

updatePlayerPosition();

function moveLeft() {
  if (gameOver) return;
  if (player.lane > 0) {
    player.lane--;
    updatePlayerPosition();
  }
}

function moveRight() {
  if (gameOver) return;
  if (player.lane < LANE_COUNT - 1) {
    player.lane++;
    updatePlayerPosition();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowRight") moveRight();
});

leftBtn.addEventListener("click", moveLeft);
rightBtn.addEventListener("click", moveRight);

leftBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveLeft();
});

rightBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveRight();
});

function drawTree(x, y) {
  ctx.fillStyle = "#6b3f1d";
  ctx.fillRect(x + 8, y + 18, 10, 20);

  ctx.fillStyle = "#1faa59";
  ctx.fillRect(x, y + 8, 26, 16);
  ctx.fillRect(x + 4, y, 18, 12);
  ctx.fillRect(x + 4, y + 20, 18, 10);
}

function drawEnvironment() {
  ctx.fillStyle = "#4caf50";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height + 64; y += 64) {
    drawTree(12, (y + roadLineOffset * 0.5) % (canvas.height + 64) - 50);
    drawTree(324, (y + roadLineOffset * 0.5 + 28) % (canvas.height + 64) - 50);
  }
}

function drawRoad() {
  ctx.fillStyle = "#3b3b3b";
  ctx.fillRect(ROAD_X, 0, ROAD_WIDTH, ROAD_HEIGHT);

  ctx.fillStyle = "#d9d9d9";
  ctx.fillRect(ROAD_X, 0, 6, ROAD_HEIGHT);
  ctx.fillRect(ROAD_X + ROAD_WIDTH - 6, 0, 6, ROAD_HEIGHT);

  ctx.fillStyle = "#ffffff";
  roadLineOffset += 8;
  if (roadLineOffset >= 60) roadLineOffset = 0;

  for (let lane = 1; lane < LANE_COUNT; lane++) {
    const x = ROAD_X + lane * LANE_WIDTH - 3;
    for (let y = -60 + roadLineOffset; y < ROAD_HEIGHT; y += 60) {
      ctx.fillRect(x, y, 6, 32);
    }
  }
}

function drawPlayerCar(x, y, w, h) {
  ctx.fillStyle = "#00c2ff";
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "#111";
  ctx.fillRect(x + 7, y + 8, w - 14, 16);

  ctx.fillStyle = "#222";
  ctx.fillRect(x - 2, y + 10, 5, 15);
  ctx.fillRect(x + w - 3, y + 10, 5, 15);
  ctx.fillRect(x - 2, y + h - 22, 5, 15);
  ctx.fillRect(x + w - 3, y + h - 22, 5, 15);

  ctx.fillStyle = "#ffe066";
  ctx.fillRect(x + 3, y + 3, 7, 5);
  ctx.fillRect(x + w - 10, y + 3, 7, 5);

  ctx.fillStyle = "#ff4d4d";
  ctx.fillRect(x + 4, y + h - 7, 6, 4);
  ctx.fillRect(x + w - 10, y + h - 7, 6, 4);
}

function drawEnemyCar(x, y, w, h) {
  ctx.fillStyle = "#ff5252";
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "#111";
  ctx.fillRect(x + 7, y + 8, w - 14, 16);

  ctx.fillStyle = "#222";
  ctx.fillRect(x - 2, y + 10, 5, 15);
  ctx.fillRect(x + w - 3, y + 10, 5, 15);
  ctx.fillRect(x - 2, y + h - 22, 5, 15);
  ctx.fillRect(x + w - 3, y + h - 22, 5, 15);

  ctx.fillStyle = "#ffe066";
  ctx.fillRect(x + 3, y + 3, 7, 5);
  ctx.fillRect(x + w - 10, y + 3, 7, 5);
}

function createEnemy() {
  const lane = Math.floor(Math.random() * LANE_COUNT);

  enemies.push({
    lane,
    x: ROAD_X + lane * LANE_WIDTH + (LANE_WIDTH - 34) / 2,
    y: -90,
    w: 34,
    h: 64,
    speed: Math.min(5 + score * 0.05, 11)
  });
}

function collide(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function endGame() {
  gameOver = true;
  gameOverPanel.classList.remove("hidden");
}

function updateGame() {
  if (gameOver) return;

  frame++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawEnvironment();
  drawRoad();
  drawPlayerCar(player.x, player.y, player.w, player.h);

  if (frame % enemySpawnRate === 0) {
    createEnemy();
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.y += enemy.speed;

    drawEnemyCar(enemy.x, enemy.y, enemy.w, enemy.h);

    if (collide(player, enemy)) {
      endGame();
      return;
    }

    if (enemy.y > canvas.height) {
      enemies.splice(i, 1);
      score++;
      scoreEl.textContent = score;

      if (score > 0 && score % 8 === 0 && enemySpawnRate > 30) {
        enemySpawnRate--;
      }
    }
  }

  requestAnimationFrame(updateGame);
}

async function loadLeaderboard() {
  try {
    const data = await getLeaderboard();

    if (!data.length) {
      leaderboardList.innerHTML = "<p>Aún no hay puntajes cargados.</p>";
      return;
    }

    leaderboardList.innerHTML = data
      .map((item, index) => {
        return `
          <div class="leaderboard-item">
            <span class="rank-name">${index + 1}. ${item.nombre} ${item.apellido}</span>
            <strong>${item.puntaje}</strong>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    leaderboardList.innerHTML = "<p>No se pudo cargar el ranking.</p>";
  }
}

scoreForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (formSubmitted) return;

  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  if (!nombre || !apellido || !telefono) {
    saveMessage.textContent = "Completá todos los campos.";
    return;
  }

  saveMessage.textContent = "Guardando...";

  try {
    await saveScore({
      nombre,
      apellido,
      telefono,
      puntaje: score
    });

    formSubmitted = true;
    saveMessage.textContent = "Puntaje guardado correctamente.";
    await loadLeaderboard();
  } catch (error) {
    saveMessage.textContent = error.message || "No se pudo guardar.";
  }
});

restartBtn.addEventListener("click", () => {
  score = 0;
  frame = 0;
  gameOver = false;
  enemySpawnRate = 55;
  roadLineOffset = 0;
  enemies = [];
  player.lane = 1;
  updatePlayerPosition();
  scoreEl.textContent = "0";
  scoreForm.reset();
  saveMessage.textContent = "";
  gameOverPanel.classList.add("hidden");
  formSubmitted = false;
  updateGame();
});

loadLeaderboard();
updateGame();
