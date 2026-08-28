const submitButton = document.getElementById("submitButton");

const quizProgressBar = document.getElementById("quizProgress");
const questionsSeen = document.getElementById("questionsSeen");
const totalQuestions = document.getElementById("totalQuestions");

const questionIdText = document.getElementById("questionId");
const newOrWeak = document.getElementById("newOrWeak");

const questionText = document.getElementById("questionText");

const answers = [...document.querySelectorAll(".answer")];
const answerTexts = [...document.querySelectorAll(".answerText")];

const questionExplanationDialog = document.getElementById("questionExplanationDialog");
const questionExplanationButton = document.getElementById("questionExplanationButton");
const questionIdExplanation = document.getElementById("questionIdExplanation");
const questionExplanation = document.getElementById("questionExplanation");

const figure = document.getElementById("figure");

const correctBox = document.getElementById("correctBox");
const correctBoxTitle = document.getElementById("correctBoxTitle");
const correctBoxSubtitle = document.getElementById("correctBoxSubtitle");

const userQuestionInfos = JSON.parse(localStorage.getItem(`${studyClass}-pool`) ?? "{}");

const _placeholderQuestion = {
    id: "PREVIEW",
    correct: 2,
    refs: "(wow)",
    question: "Does this look cool?",
    answers: ["Yes", "Of course", "No, the FCC rules prohibit it from looking cool", "The ARRL bylaws prevent ham software from looking new"],
    figure: "",
    correct_letter: "C",
    explanation: "FCC rules explicitly state the software used by hams must never look cool. If a ham uses such software, their license may be immediately and permanently revoked or suspended.",
    userQuestionInfo: {
        id: "PREVIEW",
        pool: "PREVIEW",
        score: -2,
        firstTime: false
    }
};
let currentQuestion = _placeholderQuestion;

let answerSubmitted = false;

submitButton.addEventListener("click", () => {
    if (answerSubmitted) nextQuestion();
    else submitAnswer();
});

document.querySelectorAll('input[type="radio"]').forEach(el => {
    el.addEventListener("click", () => submitButton.disabled = false)
});

questionExplanationButton.addEventListener("click", () => questionExplanationDialog.showModal());
document.getElementById("explanationGotItButton").addEventListener("click", () => questionExplanationDialog.close())

const abcd = ["A", "B", "C", "D"];
function nextQuestion() {
    answerSubmitted = false;
    submitButton.innerText = "Submit";
    submitButton.disabled = true;
    
    correctBox.classList.remove("visible");
    correctBox.style.maxHeight = 0;

    document.querySelector(".answer.correct")?.classList?.remove("correct");

    const checkedRadio = document.querySelector('input[name="answerRadio"]:checked');
    if (checkedRadio) checkedRadio.checked = false;
    
    const scoresLessThanZero = Object.keys(userQuestionInfos).filter(key => userQuestionInfos[key].score < 0);

    if (scoresLessThanZero.length == 0) {
        const usedQuestionIds = Object.keys(userQuestionInfos);
        const remainingQuestions = questionPool.filter(question => !usedQuestionIds.includes(question.id));

        if (remainingQuestions.length > 0) {
            const newQuestion = remainingQuestions[Math.floor(remainingQuestions.length * Math.random())];
            const questionInfo = {
                score: -2,
                firstTime: true,
                lastSeenAt: usedQuestionIds.length
            };
            updateQuestionInfo(newQuestion.id, questionInfo);
            scoresLessThanZero.push(newQuestion.id);
        }
    }

    const circulatingQuestions = Object.keys(userQuestionInfos).map(id => {
        const question = structuredClone(questionPool.find(question => question.id == id) ?? _placeholderQuestion);
        question.userQuestionInfo = userQuestionInfos[id];
        return question;
    }).toSorted((a, b) => a.userQuestionInfo.score - b.userQuestionInfo.score);

    const shouldUseRandomQuestion = Math.random() >= .6;
    
    currentQuestion = structuredClone(circulatingQuestions[0]);

    if (shouldUseRandomQuestion) {
        const onlyAboveZeroQuestions = circulatingQuestions.filter(question => question.score >= 0);

        currentQuestion = structuredClone(onlyAboveZeroQuestions.length > 0 ? 
            onlyAboveZeroQuestions[Math.floor(Math.random() * onlyAboveZeroQuestions.length)]
            : circulatingQuestions[Math.floor(Math.random() * circulatingQuestions.length)])
    }
    
    const correctAnswer = currentQuestion.answers[currentQuestion.correct];
    
    shuffle(currentQuestion.answers);

    const newCorrectAnswerIndex = currentQuestion.answers.indexOf(correctAnswer);
    currentQuestion.correct = newCorrectAnswerIndex;
    currentQuestion.correct_letter = abcd[newCorrectAnswerIndex];

    if (currentQuestion.userQuestionInfo.firstTime) {
        newOrWeak.style.display = "block";
        newOrWeak.classList = "new";
        newOrWeak.innerText = "New";
    } else if (currentQuestion.userQuestionInfo.score < 0) {
        newOrWeak.style.display = "block";
        newOrWeak.classList = "weak";
        newOrWeak.innerText = "Weak";
    } else {
        
        newOrWeak.style.display = "none";
    }

    questionIdText.innerText = currentQuestion.id;
    questionIdExplanation.innerText = currentQuestion.id;
    
    questionText.innerText = currentQuestion.question;
    currentQuestion.answers.forEach((answer, i) => {
        answerTexts[i].innerText = answer;
    })

    if (currentQuestion.figure != "") {
        figure.src = `/assets/images/figures/${currentQuestion.figure}`;
        figure.style.display = "block";
    } else {
        figure.style.display = "none";
    }

    if (currentQuestion.explanation != null) {
        questionExplanationButton.style.display = "initial";
        questionExplanation.innerText = currentQuestion.explanation;
    } else {
        questionExplanationButton.style.display = "none";
        questionExplanation.innerText = "There is no explanation for this question yet.";
    }

    const amountTotalQuestions = questionPool.length;
    const amountQuestionsSeen = Object.keys(userQuestionInfos).length;
    quizProgressBar.max = amountTotalQuestions;
    quizProgressBar.value = amountQuestionsSeen;
    questionsSeen.innerText = amountQuestionsSeen;
    totalQuestions.innerText = amountTotalQuestions;

    if (amountTotalQuestions == amountQuestionsSeen && scoresLessThanZero.length == 0) {
        document.getElementById("someQuestionsSeen").style.display = "none";
        document.getElementById("allQuestionsSeen").style.display = "block";
    }
}

function submitAnswer() {
    answerSubmitted = true;
    submitButton.innerText = "Next question";
    
    const answer = parseInt(document.querySelector('input[name="answerRadio"]:checked')?.value ?? "0");

    answers[currentQuestion.correct].classList.add("correct");

    const info = userQuestionInfos[currentQuestion.id];
    info.firstTime = false;
    info.lastSeenAt = Object.keys(userQuestionInfos).length;
    
    if (answer == currentQuestion.correct) {
        correctBox.classList.remove("wrong");
        correctBox.classList.add("correct");
        correctBox.classList.add("visible");
        correctBoxTitle.innerText = "Correct!";
        correctBoxSubtitle.innerText = "That was the right answer.";

        info.score++;
    } else {
        correctBox.classList.remove("correct");
        correctBox.classList.add("wrong");
        correctBox.classList.add("visible");
        correctBoxTitle.innerText = "Wrong.";
        correctBoxSubtitle.innerText = `The right answer was ${currentQuestion.correct_letter}`;
        info.score--;
    }
    updateQuestionInfo(currentQuestion.id, info);

    correctBox.style.maxHeight = (correctBox.scrollHeight * 3) + 'px'
}

function updateQuestionInfo(key, value) {
    userQuestionInfos[key] = value;
    localStorage.setItem(`${studyClass}-pool`, JSON.stringify(userQuestionInfos));
}

nextQuestion();

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