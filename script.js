const questions = [
  {
    question: "Qual declaração informa ao navegador que o documento usa HTML5?",
    answers: ["<html5>", "<!DOCTYPE html>", "<head>", "<!HTML>"],
    correct: 1,
    explanation: "O <!DOCTYPE html> deve aparecer no início do documento e indica que ele deve ser interpretado como HTML moderno."
  },
  {
    question: "Qual elemento contém o conteúdo principal e visível de uma página?",
    answers: ["<body>", "<head>", "<title>", "<meta>"],
    correct: 0,
    explanation: "O elemento <body> abriga o conteúdo que aparece na página, como textos, imagens, links e botões."
  },
  {
    question: "Qual atributo de uma imagem fornece uma descrição alternativa?",
    answers: ["src", "href", "alt", "title"],
    correct: 2,
    explanation: "O atributo alt descreve a imagem para leitores de tela e também é exibido quando a imagem não pode carregar."
  },
  {
    question: "Qual tag cria um link para outra página ou endereço?",
    answers: ["<link>", "<a>", "<nav>", "<url>"],
    correct: 1,
    explanation: "A tag <a> cria um link. O endereço de destino é informado no atributo href."
  },
  {
    question: "Qual elemento semântico é mais adequado para o conteúdo principal único da página?",
    answers: ["<section>", "<footer>", "<main>", "<aside>"],
    correct: 2,
    explanation: "O elemento <main> identifica o conteúdo principal da página. Em geral, deve haver apenas um por documento."
  },
  {
    question: "Qual tag representa uma seção de navegação com links?",
    answers: ["<nav>", "<menuitem>", "<aside>", "<header>"],
    correct: 0,
    explanation: "A tag <nav> marca uma área de navegação, como o menu principal ou um conjunto de links importantes."
  },
  {
    question: "Qual elemento define o título que aparece na aba do navegador?",
    answers: ["<h1>", "<header>", "<caption>", "<title>"],
    correct: 3,
    explanation: "A tag <title> fica dentro de <head> e define o texto mostrado na aba ou janela do navegador."
  },
  {
    question: "Qual elemento HTML5 pode ser usado para reproduzir vídeo sem plugin?",
    answers: ["<media>", "<movie>", "<video>", "<play>"],
    correct: 2,
    explanation: "O elemento <video> permite incorporar vídeos diretamente na página. O atributo controls pode exibir os controles de reprodução."
  },
  {
    question: "Qual elemento associa um texto descritivo a um campo de formulário?",
    answers: ["<legend>", "<label>", "<strong>", "<summary>"],
    correct: 1,
    explanation: "A tag <label> identifica o propósito de um campo. Associá-la ao campo melhora a acessibilidade e facilita o uso."
  },
  {
    question: "Em qual elemento ficam metadados e links para estilos que não são exibidos como conteúdo?",
    answers: ["<body>", "<footer>", "<main>", "<head>"],
    correct: 3,
    explanation: "O elemento <head> guarda informações sobre o documento, como título, codificação, metadados e links para CSS."
  }
];

const introScreen = document.querySelector("#intro-screen");
const quizScreen = document.querySelector("#quiz-screen");
const resultScreen = document.querySelector("#result-screen");
const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");
const questionCount = document.querySelector("#question-count");
const progressTrack = document.querySelector(".progress-track");
const progressFill = document.querySelector("#progress-fill");
const questionText = document.querySelector("#question-text");
const answersContainer = document.querySelector("#answers");
const feedback = document.querySelector("#feedback");
const feedbackTitle = document.querySelector("#feedback-title");
const feedbackExplanation = document.querySelector("#feedback-explanation");
const nextButton = document.querySelector("#next-button");
const scoreElement = document.querySelector("#score");
const timerToggle = document.querySelector("#timer-toggle");
const timerElement = document.querySelector("#timer");
const timerValue = document.querySelector("#timer-value");
const finalScore = document.querySelector("#final-score");
const resultMessage = document.querySelector("#result-message");
const resultArt = document.querySelector("#result-art");

let currentQuestion = 0;
let score = 0;
let timeLeft = 15;
let timerId;
let answered = false;

function startGame() {
  currentQuestion = 0;
  score = 0;
  scoreElement.textContent = score;
  introScreen.hidden = true;
  resultScreen.hidden = true;
  quizScreen.hidden = false;
  renderQuestion();
}

function renderQuestion() {
  answered = false;
  timerToggle.disabled = false;
  const question = questions[currentQuestion];
  questionCount.textContent = `PERGUNTA ${currentQuestion + 1} DE ${questions.length}`;
  progressTrack.setAttribute("aria-valuenow", currentQuestion + 1);
  progressFill.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
  questionText.textContent = question.question;
  questionText.setAttribute("aria-label", `Pergunta ${currentQuestion + 1} de ${questions.length}. ${question.question}`);
  feedback.hidden = true;
  feedback.classList.remove("is-correct", "is-incorrect");
  nextButton.hidden = true;
  answersContainer.replaceChildren();

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.type = "button";
    button.dataset.index = index;

    const letter = document.createElement("span");
    letter.className = "answer-letter";
    letter.setAttribute("aria-hidden", "true");
    letter.textContent = String.fromCharCode(65 + index);

    const text = document.createElement("span");
    text.className = "answer-text";
    text.textContent = answer;

    button.append(letter, text);
    button.addEventListener("click", () => selectAnswer(index));
    answersContainer.append(button);
  });

  startTimer();
  questionText.focus();
}

function startTimer() {
  window.clearInterval(timerId);
  if (!timerToggle.checked) {
    timerElement.hidden = true;
    timerElement.classList.remove("is-urgent");
    return;
  }

  timerElement.hidden = false;
  timeLeft = 15;
  updateTimer();
  timerId = window.setInterval(() => {
    timeLeft -= 1;
    updateTimer();

    if (timeLeft <= 0) {
      window.clearInterval(timerId);
      selectAnswer(-1);
    }
  }, 1000);
}

function updateTimer() {
  timerValue.textContent = timeLeft;
  timerElement.setAttribute("aria-label", `Tempo restante: ${timeLeft} segundos`);
  timerElement.classList.toggle("is-urgent", timeLeft <= 5);
}

function selectAnswer(selectedIndex) {
  if (answered) return;

  answered = true;
  window.clearInterval(timerId);
  timerToggle.disabled = true;
  const question = questions[currentQuestion];
  const isCorrect = selectedIndex === question.correct;

  answersContainer.querySelectorAll(".answer").forEach((button) => {
    const answerIndex = Number(button.dataset.index);
    button.disabled = true;

    if (answerIndex === question.correct) {
      button.classList.add("correct");
    } else if (answerIndex === selectedIndex) {
      button.classList.add("incorrect");
    }
  });

  if (isCorrect) {
    score += 10;
    scoreElement.textContent = score;
  }

  feedbackTitle.textContent = isCorrect
    ? "Isso mesmo! +10 pontos 🎉"
    : selectedIndex === -1
      ? "O tempo acabou!"
      : "Quase! Vamos aprender juntos.";
  feedbackExplanation.textContent = question.explanation;
  feedback.classList.add(isCorrect ? "is-correct" : "is-incorrect");
  feedback.hidden = false;
  nextButton.textContent = currentQuestion === questions.length - 1 ? "Ver resultado" : "Próxima";
  nextButton.append(document.createTextNode(" →"));
  nextButton.hidden = false;
  nextButton.focus();
}

function showNextQuestion() {
  currentQuestion += 1;
  if (currentQuestion === questions.length) {
    showResult();
    return;
  }

  renderQuestion();
}

function showResult() {
  window.clearInterval(timerId);
  quizScreen.hidden = true;
  resultScreen.hidden = false;
  progressTrack.setAttribute("aria-valuenow", questions.length);
  progressFill.style.width = "100%";
  finalScore.textContent = score;

  if (score === 100) {
    resultArt.textContent = "🏆";
    resultMessage.textContent = "Perfeito! Você acertou tudo e já pode se chamar de mestre das tags.";
  } else if (score >= 70) {
    resultArt.textContent = "🥳";
    resultMessage.textContent = "Excelente! Você conhece muito bem os fundamentos de HTML5.";
  } else if (score >= 40) {
    resultArt.textContent = "🌟";
    resultMessage.textContent = "Bom trabalho! Você está no caminho certo — continue praticando.";
  } else {
    resultArt.textContent = "🚀";
    resultMessage.textContent = "Todo especialista começou aprendendo. Tente de novo e some ainda mais pontos!";
  }

  document.querySelector("#result-title").focus();
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
nextButton.addEventListener("click", showNextQuestion);
timerToggle.addEventListener("change", () => {
  if (!quizScreen.hidden && !answered) {
    startTimer();
  }
});
