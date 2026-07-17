const submitButton = document.getElementById("submitButton");
const questionIdText = document.getElementById("questionId");
const questionText = document.getElementById("questionText");
const answerTexts = [...document.querySelectorAll(".answerText")];

let currentQuestion = {
    id: "PREVIEW",
    correct: 2,
    refs: "(wow)",
    question: "Does this look cool?",
    answers: ["Yes", "Of course", "No, the FCC rules prohibit it from looking cool", "The ARRL bylaws prevent ham software from looking new"],
    figure: "",
    correctLetter: "C",
    explanation: "FCC rules explicitly state the software used by hams must never look cool. If a ham uses such software, their license may be immediately and permanently revoked or suspended.",
    userQuestionInfo: {
        id: "PREVIEW",
        pool: "PREVIEW",
        score: -2,
        firstTime: false
    }
};

submitButton.addEventListener("click", () => {
    
});

document.querySelectorAll('input[type="radio"]').forEach(el => {
    el.addEventListener("click", () => submitButton.disabled = false)
});

const abcd = ["A", "B", "C", "D"];
function nextQuestion() {
    currentQuestion = structuredClone(questionPool[Math.floor(questionPool.length * Math.random())]);
    
    const correctAnswer = currentQuestion.answers[currentQuestion.correct];
    
    shuffle(currentQuestion.answers);

    const newCorrectAnswerIndex = currentQuestion.answers.indexOf(correctAnswer);
    currentQuestion.correct = newCorrectAnswerIndex;
    currentQuestion.correct_letter = abcd[newCorrectAnswerIndex];

    questionIdText.innerText = currentQuestion.id;
    questionText.innerText = currentQuestion.question;
    currentQuestion.answers.forEach((answer, i) => {
        answerTexts[i].innerText = answer;
    })
}

// Source - https://stackoverflow.com/a/2450976
// Posted by ChristopheD, modified by community. See post 'Timeline' for change history
// Retrieved 2026-07-17, License - CC BY-SA 4.0
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}