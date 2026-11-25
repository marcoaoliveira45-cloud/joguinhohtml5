const nicknameInput = document.querySelector("#nickname-input");
const nicknameForm = document.querySelector("#nickname-form");
const nicknameStatus = document.querySelector("#nickname-status");
const leaderboardList = document.querySelector("#leaderboard-list");
const leaderboardStatus = document.querySelector("#leaderboard-status");
let savedNickname = "";

try {
  savedNickname = localStorage.getItem("html-run-nickname") || "";
} catch (error) {
  console.warn("Não foi possível ler o apelido salvo neste navegador.", error);
}
if (savedNickname) nicknameInput.value = savedNickname;

nicknameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nickname = nicknameInput.value.trim();

  if (!nickname || nickname.length > 20) {
    nicknameStatus.textContent = "Escolha um apelido de até 20 caracteres.";
    return;
  }

  nicknameInput.value = nickname;
  try {
    localStorage.setItem("html-run-nickname", nickname);
    nicknameStatus.textContent = "Apelido salvo neste dispositivo.";
  } catch (error) {
    console.error("Não foi possível salvar o apelido neste navegador.", error);
    nicknameStatus.textContent = "Apelido definido, mas não pôde ser salvo neste dispositivo.";
  }
});

function renderScores(scores) {
  leaderboardList.replaceChildren();

  if (scores.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "leaderboard-empty";
    emptyItem.textContent = "Ainda não há pontuações. Seja o primeiro!";
    leaderboardList.append(emptyItem);
    return;
  }

  scores.forEach((entry, index) => {
    const item = document.createElement("li");
    const playerName = document.createElement("span");
    const playerScore = document.createElement("strong");

    playerName.textContent = `${index + 1}. ${entry.display_name}`;
    playerScore.textContent = String(entry.score).padStart(5, "0");
    item.append(playerName, playerScore);
    leaderboardList.append(item);
  });
}

function showConnectionError(error) {
  console.error("Não foi possível conectar ao placar do Supabase.", error);
  leaderboardStatus.textContent = "Placar indisponível. Tente novamente mais tarde.";
  leaderboardList.replaceChildren();
  const errorItem = document.createElement("li");
  errorItem.className = "leaderboard-empty";
  errorItem.textContent = "Não foi possível carregar as pontuações.";
  leaderboardList.append(errorItem);
}

async function connectToLeaderboard() {
  const config = window.HTMLRunSupabaseConfig;
  const validConfig = config
    && typeof config.url === "string"
    && typeof config.anonKey === "string"
    && !config.url.includes("SEU-PROJETO")
    && !config.anonKey.includes("SUA_CHAVE");
  if (!validConfig) {
    leaderboardStatus.textContent = "Configure o Supabase para ativar o placar ao vivo.";
    leaderboardList.replaceChildren();
    const setupItem = document.createElement("li");
    setupItem.className = "leaderboard-empty";
    setupItem.textContent = "As instruções de configuração estão no README.";
    leaderboardList.append(setupItem);
    return null;
  }

  try {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    const supabase = createClient(config.url, config.anonKey);

    const refreshScores = async () => {
      const { data, error } = await supabase
        .from("scores")
        .select("display_name, score")
        .order("score", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(10);

      if (error) throw error;
      renderScores(data);
    };

    await refreshScores();
    leaderboardStatus.textContent = "Placar carregado · conectando ao vivo...";
    supabase
      .channel("html-run-scores")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "scores" }, () => {
        refreshScores().catch(showConnectionError);
      })
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          leaderboardStatus.textContent = "Conexão ao vivo interrompida. Tentando reconectar...";
        } else if (status === "SUBSCRIBED") {
          leaderboardStatus.textContent = "Conectado · atualiza em tempo real";
          refreshScores().catch(showConnectionError);
        }
      });

    return supabase;
  } catch (error) {
    showConnectionError(error);
    return null;
  }
}

const connection = connectToLeaderboard();

async function submitScore(score) {
  const supabase = await connection;
  if (!supabase) return;

  const displayName = nicknameInput.value.trim();
  if (!displayName) {
    nicknameStatus.textContent = "Salve um apelido para enviar sua pontuação.";
    nicknameInput.focus();
    return;
  }

  try {
    const { error } = await supabase.from("scores").insert({
      display_name: displayName.slice(0, 20),
      score
    });

    if (error) throw error;
    leaderboardStatus.textContent = "Pontuação enviada!";
  } catch (error) {
    console.error("Não foi possível enviar a pontuação ao Supabase.", error);
    leaderboardStatus.textContent = "Não foi possível enviar sua pontuação.";
    return;
  }
}

window.submitLeaderboardScore = submitScore;
window.isAdminPlayer = () => nicknameInput.value.trim().toUpperCase() === "ADM";
