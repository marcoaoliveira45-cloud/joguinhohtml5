const gameTab = document.querySelector("#game-tab");
const terminalTab = document.querySelector("#terminal-tab");
const gameView = document.querySelector("#game-view");
const terminalView = document.querySelector("#terminal-view");
const terminalForm = document.querySelector("#terminal-form");
const terminalInput = document.querySelector("#terminal-input");
const terminalOutput = document.querySelector("#terminal-output");
const settings = window.HTMLRunSettings;

const defaultSettings = {
  playerColor: "#f26a3d",
  obstacleColor: null,
  speedMultiplier: 1,
  jumpHeight: 125
};

function printTerminal(message, className = "") {
  const line = document.createElement("p");
  line.textContent = message;
  if (className) line.className = className;
  terminalOutput.append(line);
  while (terminalOutput.children.length > 40) {
    terminalOutput.firstElementChild.remove();
  }
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function saveSettings() {
  try {
    localStorage.setItem("html-run-settings", JSON.stringify(settings));
  } catch (error) {
    console.error("Não foi possível salvar as configurações do terminal.", error);
    printTerminal("Aviso: não foi possível salvar as configurações neste dispositivo.", "terminal-error");
  }
}

function restoreSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("html-run-settings") || "null");
    if (!saved || typeof saved !== "object") return;

    if (/^#[\da-f]{6}$/i.test(saved.playerColor)) settings.playerColor = saved.playerColor;
    if (saved.obstacleColor === null || /^#[\da-f]{6}$/i.test(saved.obstacleColor)) {
      settings.obstacleColor = saved.obstacleColor;
    }
    if (Number.isFinite(saved.speedMultiplier) && saved.speedMultiplier >= 0.5 && saved.speedMultiplier <= 2) {
      settings.speedMultiplier = saved.speedMultiplier;
    }
    if (Number.isFinite(saved.jumpHeight) && saved.jumpHeight >= 60 && saved.jumpHeight <= 180) {
      settings.jumpHeight = saved.jumpHeight;
    }
  } catch (error) {
    console.error("Não foi possível carregar as configurações do terminal.", error);
    printTerminal("Aviso: configurações salvas inválidas; usando os valores padrão.", "terminal-error");
  }
}

function showTab(tab) {
  const showTerminal = tab === terminalTab;
  gameTab.setAttribute("aria-selected", String(!showTerminal));
  gameTab.tabIndex = showTerminal ? -1 : 0;
  terminalTab.setAttribute("aria-selected", String(showTerminal));
  terminalTab.tabIndex = showTerminal ? 0 : -1;
  gameTab.classList.toggle("is-active", !showTerminal);
  terminalTab.classList.toggle("is-active", showTerminal);
  gameView.hidden = showTerminal;
  terminalView.hidden = !showTerminal;
  if (showTerminal) terminalInput.focus();
}

function showHelp() {
  printTerminal("Comandos aceitos:");
  printTerminal("  set player.color #RRGGBB     muda a cor do personagem");
  printTerminal("  set obstacle.color #RRGGBB  muda a cor das tags");
  printTerminal("  set game.speed 0.5-2        ajusta a velocidade global");
  printTerminal("  set player.jump 60-180      ajusta a altura do pulo em pixels");
  printTerminal("  status                       mostra as configurações");
  printTerminal("  reset                        restaura os valores padrão");
}

function showStatus() {
  printTerminal(`player.color = ${settings.playerColor}`);
  printTerminal(`obstacle.color = ${settings.obstacleColor || "cores originais"}`);
  printTerminal(`game.speed = ${settings.speedMultiplier}`);
  printTerminal(`player.jump = ${settings.jumpHeight}px`);
}

function runCommand(rawCommand) {
  const command = rawCommand.trim();
  if (!command) return;

  printTerminal(`> ${command}`, "terminal-command");
  const parts = command.split(/\s+/);
  const action = parts[0]?.toLowerCase();

  if (action === "help" && parts.length === 1) {
    showHelp();
    return;
  }

  if (action === "status" && parts.length === 1) {
    showStatus();
    return;
  }

  if (action === "reset" && parts.length === 1) {
    Object.assign(settings, defaultSettings);
    saveSettings();
    printTerminal("Configurações restauradas.");
    return;
  }

  if (action !== "set" || parts.length !== 3) {
    printTerminal("Comando inválido. Digite help para ver os comandos disponíveis.", "terminal-error");
    return;
  }

  const [, setting, value] = parts;
  if (setting === "player.color" || setting === "obstacle.color") {
    if (!/^#[\da-f]{6}$/i.test(value)) {
      printTerminal("Use uma cor hexadecimal no formato #RRGGBB.", "terminal-error");
      return;
    }
    if (setting === "player.color") settings.playerColor = value;
    else settings.obstacleColor = value;
  } else if (setting === "game.speed") {
    const multiplier = Number(value);
    if (!Number.isFinite(multiplier) || multiplier < 0.5 || multiplier > 2) {
      printTerminal("A velocidade deve ser um número entre 0.5 e 2.", "terminal-error");
      return;
    }
    settings.speedMultiplier = multiplier;
  } else if (setting === "player.jump") {
    const jumpHeight = Number(value);
    if (!Number.isFinite(jumpHeight) || jumpHeight < 60 || jumpHeight > 180) {
      printTerminal("A altura do pulo deve ser um número entre 60 e 180 pixels.", "terminal-error");
      return;
    }
    settings.jumpHeight = jumpHeight;
  } else {
    printTerminal("Configuração desconhecida. Digite help para ver as opções.", "terminal-error");
    return;
  }

  saveSettings();
  printTerminal(`${setting} atualizado para ${value}.`);
}

gameTab.addEventListener("click", () => showTab(gameTab));
terminalTab.addEventListener("click", () => showTab(terminalTab));
for (const tab of [gameTab, terminalTab]) {
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextTab = tab === gameTab ? terminalTab : gameTab;
    showTab(nextTab);
    nextTab.focus();
  });
}

terminalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  runCommand(terminalInput.value);
  terminalInput.value = "";
});

restoreSettings();
