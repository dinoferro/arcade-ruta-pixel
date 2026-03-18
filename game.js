const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const overlay = document.getElementById("overlay");
const formStep = document.getElementById("formStep");
const rankingStep = document.getElementById("rankingStep");
const leaderboardList = document.getElementById("leaderboardList");
const scoreForm = document.getElementById("scoreForm");
const saveMessage = document.getElementById("saveMessage");
const restartBtn = document.getElementById("restartBtn");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const ROAD_WIDTH = 180;
const ROAD_X = (canvas.width - ROAD_WIDTH) / 2;
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
  w: 26,
  h: 52,
  x: 0,
  y: canvas.height - 90
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
  ctx.fillStyle = "#73461f";
  ctx.fillRect(x + 6, y + 16, 8, 16);

  ctx.fillStyle = "#1faa59";
  ctx.fillRect(x, y + 8, 20, 12);
  ctx.fillRect(x + 3, y, 14, 10);
  ctx.fillRect(x + 3, y + 18, 14, 8);
}

function drawEnvironment() {
  ctx.fillStyle = "#47a84c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height + 64; y += 58) {
    drawTree(28, (y + roadLineOffset * 0.45) % (canvas.height + 64) - 40);
    drawTree(canvas.width - 48, (y + roadLineOffset * 0.45 + 22) % (canvas.height + 64) - 40);
  }
}

function drawRoad() {
  ctx.fillStyle = "#373737";
  ctx.fillRect(ROAD_X, 0, ROAD_WIDTH, ROAD_HEIGHT);

  ctx.fillStyle = "#d9d9d9";
  ctx.fillRect(ROAD_X, 0, 5, ROAD_HEIGHT);
  ctx.fillRect(ROAD_X + ROAD_WIDTH - 5, 0, 5, ROAD_HEIGHT);

  ctx.fillStyle = "#ffffff";
  roadLineOffset += 7;
  if (roadLineOffset >= 52) roadLineOffset = 0;

  for (let lane = 1; lane < LANE_COUNT; lane++) {
    const x = ROAD_X + lane * LANE_WIDTH - 2;
    for (let y = -52 + roadLineOffset; y < ROAD_HEIGHT; y += 52) {
      ctx.fillRect(x, y, 4, 26);
    }
  }
}

function drawPlayerCar(x, y, w, h) {
  ctx.fillStyle = "#00c2ff";
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "#111";
  ctx.fillRect(x + 5, y + 7, w - 10, 13);

  ctx.fillStyle = "#222";
  ctx.fillRect(x - 2, y + 8, 4, 12);
  ctx.fillRect(x + w - 2, y + 8, 4, 12);
  ctx.fillRect(x - 2, y + h - 18, 4, 12);
  ctx.fillRect(x + w - 2, y + h - 18, 4, 12);

  ctx.fillStyle = "#ffe066";
  ctx.fillRect(x + 2, y + 2, 5, 4);
  ctx.fillRect(x + w - 7, y + 2, 5, 4);

  ctx.fillStyle = "#ff4d4d";
  ctx.fillRect(x + 3, y + h - 5, 5, 3);
  ctx.fillRect(x + w - 8, y + h - 5, 5, 3);
}

function drawEnemyCar(x, y, w, h) {
  ctx.fillStyle = "#ff5252";
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "#111";
  ctx.fillRect(x + 5, y + 7, w - 10, 13);

  ctx.fillStyle = "#222";
  ctx.fillRect(x - 2, y + 8, 4, 12);
  ctx.fillRect(x + w - 2, y + 8, 4, 12);
  ctx.fillRect(x - 2, y + h - 18, 4, 12);
  ctx.fillRect(x + w - 2, y + h - 18, 4, 12);

  ctx.fillStyle = "#ffe066";
  ctx.fillRect(x + 2, y + 2, 5, 4);
  ctx.fillRect(x + w - 7, y + 2, 5, 4);
}

function createEnemy() {
  const lane = Math.floor(Math.random() * LANE_COUNT);

  enemies.push({
    lane,
    x: ROAD_X + lane * LANE_WIDTH + (LANE_WIDTH - 26) / 2,
    y: -70,
    w: 26,
    h: 52,
    speed: Math.min(4.6 + score * 0.04, 9)
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

function showFormModal() {
  overlay.classList.remove("hidden");
  formStep.classList.remove("hidden");
  rankingStep.classList.add("hidden");
}

function showRankingModal() {
  formStep.classList.add("hidden");
  rankingStep.classList.remove("hidden");
}

function endGame() {
  gameOver = true;
  showFormModal();
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
      leaderboardList.innerHTML = "<p style='text-align:center;color:#c8d0de;'>Aún no hay puntajes cargados.</p>";
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
    leaderboardList.innerHTML = "<p style='text-align:center;color:#ffb4b4;'>No se pudo cargar el ranking.</p>";
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
    saveMessage.textContent = "";
    await loadLeaderboard();
    showRankingModal();
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
  overlay.classList.add("hidden");
  formStep.classList.remove("hidden");
  rankingStep.classList.add("hidden");
  formSubmitted = false;
  updateGame();
});

loadLeaderboard();
updateGame();
