// Support pour le mode sombre
if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  document.documentElement.classList.add("dark");
}
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (event) => {
    document.documentElement.classList.toggle("dark", event.matches);
  });

// Menu déroulant
document.addEventListener("DOMContentLoaded", function () {
  const menu = document.querySelector(".menu");
  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", function () {
    menu.classList.toggle("visible", window.scrollY < lastScrollY);
    lastScrollY = window.scrollY;
  });

  document.addEventListener("mousemove", function (event) {
    menu.classList.toggle("visible", event.clientY < 100);
  });

  // Afficher le menu au chargement initial
  menu.classList.add("visible");
  setTimeout(() => {
    menu.classList.remove("visible");
  }, 3000);
});

// Données du quiz
const questions = [
  {
    question:
      "Si tu veux espionner un élément comme un détective avec un sélecteur CSS, quelle méthode utilises-tu ?",
    options: [
      "document.getElementById(id)",
      "document.querySelector(selector)",
      "document.createElement(tagName)",
      "element.addEventListener(event, callback)",
    ],
    correctAnswer: 1,
  },
  {
    question:
      "Comment déclare-t-on une variable qui ne changera jamais de valeur en JavaScript moderne ?",
    options: ["var x = 5;", "let x = 5;", "const x = 5;", "static x = 5;"],
    correctAnswer: 2,
  },
  {
    question:
      "Quelle méthode permet d'ajouter un élément à la fin d'un tableau en JavaScript ?",
    options: [
      "array.push(element)",
      "array.pop(element)",
      "array.unshift(element)",
      "array.shift(element)",
    ],
    correctAnswer: 0,
  },
  {
    question:
      "Comment vérifie-t-on si deux valeurs sont égales en valeur ET en type ?",
    options: ["x == y", "x = y", "x === y", "x.equals(y)"],
    correctAnswer: 2,
  },
  {
    question:
      "Comment écrit-on une fonction fléchée qui retourne la somme de deux nombres ?",
    options: [
      "function(a, b) { return a + b; }",
      "(a, b) => a + b",
      "a, b => { a + b }",
      "const sum = function(a, b) => a + b",
    ],
    correctAnswer: 1,
  },
  // Ajoutez d'autres questions si nécessaire
];

// Éléments du DOM
const detailsDesResultats = document.getElementById("details-des-resultats");
const questionText = document.getElementById("question-text");
const questionNumber = document.getElementById("question-number");
const questionScore = document.getElementById("question-score");
const answerOptions = document.querySelectorAll(".answer-option");
const scoreDisplay = document.getElementById("score-display");
const timerDisplay = document.getElementById("timer-display");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset-button");
const resultContainer = document.getElementById("result-container");
const finalScore = document.getElementById("final-score");
const timeTaken = document.getElementById("time-taken");
const mainQuiz = document.getElementById("main-quiz");

// Variables d'état du quiz
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let timeElapsed = 0;
let quizStarted = false;
let answeredQuestions = new Array(questions.length).fill(false);
let userAnswers = new Array(questions.length).fill(-1);

// Fonction pour afficher la question actuelle
function displayQuestion() {
  const question = questions[currentQuestionIndex];
  questionText.textContent = question.question;
  questionNumber.textContent = `Question ${currentQuestionIndex + 1}/${
    questions.length
  }`

  answerOptions.forEach((option, index) => {
    option.textContent = question.options[index];
    option.className = "answer-option";
    option.disabled = answeredQuestions[currentQuestionIndex];

    if (answeredQuestions[currentQuestionIndex]) {
      if (index === question.correctAnswer) {
        option.classList.add("correct");
      } else if (index === userAnswers[currentQuestionIndex]) {
        option.classList.add("incorrect");
      }
    }
  });

  prevButton.disabled = currentQuestionIndex === 0 || !quizStarted;
  nextButton.disabled =
    currentQuestionIndex === questions.length - 1 || !quizStarted;
}

// Vérifier la réponse sélectionnée

function checkAnswer(selectedIndex) {
  if (!quizStarted || answeredQuestions[currentQuestionIndex]) return;

  const correctIndex = questions[currentQuestionIndex].correctAnswer;
  userAnswers[currentQuestionIndex] = selectedIndex;
  answeredQuestions[currentQuestionIndex] = true;

  answerOptions.forEach((option, index) => {
    option.disabled = true;
    if (index === correctIndex) {
      option.classList.add("correct");
    } else if (index === selectedIndex && selectedIndex !== correctIndex) {
      option.classList.add("incorrect");
    }
  });

  if (selectedIndex === correctIndex) {
    score++;
    scoreDisplay.textContent = `Votre score: ${score}`;
    questionScore.textContent = `Score: ${score}/${questions.length}`;
  }

  if (answeredQuestions.every((answered) => answered)) {
    endQuiz();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayQuestion();
  }
}

// Naviguer vers la question suivante
function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  }
}

// Démarrer le quiz
function startQuiz() {
  quizStarted = true;
  startButton.textContent = "Pause";
  startButton.removeEventListener("click", startQuiz);
  startButton.addEventListener("click", pauseQuiz);

  prevButton.disabled = currentQuestionIndex === 0;
  nextButton.disabled = currentQuestionIndex === questions.length - 1;

  if (!timerInterval) {
    timerInterval = setInterval(updateTimer, 1000);
  }
}

// Mettre en pause le quiz
function pauseQuiz() {
  quizStarted = false;
  startButton.textContent = "Reprendre";
  startButton.removeEventListener("click", pauseQuiz);
  startButton.addEventListener("click", startQuiz);

  prevButton.disabled = true;
  nextButton.disabled = true;

  clearInterval(timerInterval);
  timerInterval = null;
}

// Réinitialiser le quiz
function resetQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  timeElapsed = 0;
  quizStarted = false;
  answeredQuestions.fill(false);
  userAnswers.fill(-1);

  clearInterval(timerInterval);
  timerInterval = null;

  timerDisplay.textContent = "00:00:00";
  scoreDisplay.textContent = "Votre score: 0";
  questionScore.textContent = `Score: 0/${questions.length}`;

  startButton.textContent = "Démarrer";
  startButton.style.display = "inline";
  resetButton.style.display = "none";
  startButton.removeEventListener("click", pauseQuiz);
  startButton.addEventListener("click", startQuiz);

  resultContainer.style.display = "none";
  displayQuestion();
}

// Mettre à jour le chronomètre
function updateTimer() {
  timeElapsed++;
  const hours = Math.floor(timeElapsed / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((timeElapsed % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeElapsed % 60).toString().padStart(2, "0");
  timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

// Montrer les résultats
function showResults() {
  document.querySelector(".main-quiz").classList.add("hidden"); // Masquer le quiz
  resultContainer.classList.remove("hidden"); // Afficher le conteneur des résultats

  // Effacer les résultats existants
  detailsDesResultats.innerHTML = "";

  // Ajouter les résultats pour chaque question
  questions.forEach((question, index) => {
    const isCorrect = userAnswers[index] === question.correctAnswer;
    const resultDiv = document.createElement("div");
    resultDiv.className = `result-item ${isCorrect ? "correct" : "incorrect"}`;

    const selectedOption =
      userAnswers[index] !== -1
        ? question.options[userAnswers[index]]
        : "Non répondu";
    const correctOption = question.options[question.correctAnswer];

    resultDiv.innerHTML = `
            <p>${index + 1}. ${question.question}</p>
            <p>Votre réponse: ${selectedOption}</p>
            <p>Réponse correcte: ${correctOption}</p>
        `;

    detailsDesResultats.appendChild(resultDiv);
  });
}

// Modifiez la fonction endQuiz pour appeler showResults
function endQuiz() {
  quizStarted = false;
  clearInterval(timerInterval);
  timerInterval = null;

  // Afficher les résultats
  finalScore.textContent = `Score final: ${score}/${questions.length}`;
  const hours = Math.floor(timeElapsed / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((timeElapsed % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeElapsed % 60).toString().padStart(2, "0");
  timeTaken.textContent = `Temps écoulé: ${hours}:${minutes}:${seconds}`;

  showResults(); // Appel à la fonction pour afficher les résultats détaillés

  startButton.style.display = "none";
  resetButton.style.display = "inline";
}

// Terminer le quiz
function endQuiz() {
  quizStarted = false;
  clearInterval(timerInterval);
  timerInterval = null;

  resultContainer.style.display = "block";
  finalScore.textContent = `Score final: ${score}/${questions.length}`;

  const hours = Math.floor(timeElapsed / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((timeElapsed % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeElapsed % 60).toString().padStart(2, "0");
  timeTaken.textContent = `Temps écoulé: ${hours}:${minutes}:${seconds}`;

  showResults();

  startButton.style.display = "none";
  resetButton.style.display = "inline";
}

// Gestionnaires d'événements
startButton.addEventListener("click", startQuiz);
resetButton.addEventListener("click", resetQuiz);
prevButton.addEventListener("click", prevQuestion);
nextButton.addEventListener("click", nextQuestion);

answerOptions.forEach((option) => {
  option.addEventListener("click", function () {
    if (quizStarted && !answeredQuestions[currentQuestionIndex]) {
      checkAnswer(parseInt(this.getAttribute("data-index")));
    }
  });
});

// Initialiser le quiz
displayQuestion();
