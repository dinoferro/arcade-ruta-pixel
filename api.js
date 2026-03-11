  // Cuando tengamos el backend online, reemplazás null por tu URL.
  // Ejemplo:
  // baseUrl: "https://tu-backend.tudominio.workers.dev"
  baseUrl: null
};

function sanitizeText(value) {
  return String(value || "").trim();
}

function getLocalScores() {
  try {
    const raw = localStorage.getItem("arcade_scores");
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveLocalScores(scores) {
  localStorage.setItem("arcade_scores", JSON.stringify(scores));
}

async function saveScore(payload) {
  const cleanPayload = {
    nombre: sanitizeText(payload.nombre),
    apellido: sanitizeText(payload.apellido),
    telefono: sanitizeText(payload.telefono),
    puntaje: Number(payload.puntaje || 0)
  };

  if (API_CONFIG.baseUrl) {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cleanPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo guardar el puntaje.");
    }

    return data;
  }

  const scores = getLocalScores();

  scores.push({
    nombre: cleanPayload.nombre,
    apellido: cleanPayload.apellido,
    telefono: cleanPayload.telefono,
    puntaje: cleanPayload.puntaje,
    createdAt: new Date().toISOString()
  });

  saveLocalScores(scores);

  return { ok: true, local: true };
}

async function getLeaderboard() {
  if (API_CONFIG.baseUrl) {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/leaderboard`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo cargar el ranking.");
    }

    return data;
  }

  const scores = getLocalScores();

  return scores
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 10)
    .map((item) => ({
      nombre: item.nombre,
      apellido: item.apellido,
      puntaje: item.puntaje
    }));
}
