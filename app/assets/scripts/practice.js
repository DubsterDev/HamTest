const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const finishButton = document.getElementById("finishButton");

const quizProgressBar = document.getElementById("quizProgress");
const questionsRemaining = document.getElementById("questionsRemaining");

const questionIdText = document.getElementById("questionId");
const newOrWeak = document.getElementById("newOrWeak");

const questionText = document.getElementById("questionText");

const answers = [...document.querySelectorAll(".answer")];
const answerRadios = [...document.querySelectorAll('input[name="answerRadio"]')];
const answerTexts = [...document.querySelectorAll(".answerText")];

const questionExplanationDialog = document.getElementById("questionExplanationDialog");
const questionExplanationButton = document.getElementById("questionExplanationButton");
const questionIdExplanation = document.getElementById("questionIdExplanation");
const questionExplanation = document.getElementById("questionExplanation");

const figure = document.getElementById("figure");

const correctBox = document.getElementById("correctBox");
const correctBoxTitle = document.getElementById("correctBoxTitle");
const correctBoxSubtitle = document.getElementById("correctBoxSubtitle");

questionExplanationButton.addEventListener("click", () => questionExplanationDialog.showModal());
document.getElementById("explanationGotItButton").addEventListener("click", () => questionExplanationDialog.close())

previousButton.addEventListener("click", () => {
    changeQuestion(-1);
})

nextButton.addEventListener("click", () => {
    changeQuestion(1);
})

finishButton.addEventListener("click", () => {
    finishQuiz();
})

document.getElementById("reviewQuestions").addEventListener("click", () => {
    document.getElementById("practiceTestFinishedDialog").close();
})

document.getElementById("openFinishedDialog").addEventListener("click", () => {
    document.getElementById("practiceTestFinishedDialog").showModal();
})

answerRadios.forEach((radio, index) => {
    radio.addEventListener("change", () => {
        if (radio.checked) {
            quiz[currentQuestion].selected_answer = index;
        }
    })
})

const quiz = [];

let currentQuestion = 0;

let quizFinished = false;

const abcd = ["A", "B", "C", "D"];
function generateQuiz() {
    const splitQuestions = {};

    questionPool.forEach(question => {
        const element = question.id.substring(0, 3);
        if (element in splitQuestions) {
            splitQuestions[element].push(question);
        } else {
            splitQuestions[element] = [question];
        }
    });

    Object.keys(splitQuestions).forEach(element => {
        const questions = splitQuestions[element];
        const question = structuredClone(questions[Math.floor(questions.length * Math.random())]);

        const correctAnswer = question.answers[question.correct];
        
        shuffle(question.answers);

        const newCorrectAnswerIndex = question.answers.indexOf(correctAnswer);
        question.correct = newCorrectAnswerIndex;
        question.correct_letter = abcd[newCorrectAnswerIndex];

        question.selected_answer = -1;
        
        quiz.push(question);
    })

    shuffle(quiz);
}

function changeQuestion(by) {
    currentQuestion += by;
    
    previousButton.disabled = false;
    nextButton.disabled = false;
    
    finishButton.style.display = "none";
    nextButton.style.display = "flex";
    
    if (currentQuestion == 0) {
        previousButton.disabled = true;
    } else if (currentQuestion == quiz.length - 1) {
        nextButton.disabled = true;
        finishButton.style.display = "flex";
        nextButton.style.display = "none";
    }

    const checkedRadio = document.querySelector('input[name="answerRadio"]:checked');
    if (checkedRadio) checkedRadio.checked = false;

    if (quiz[currentQuestion].selected_answer >= 0) {
        answerRadios[quiz[currentQuestion].selected_answer].checked = true;
    }

    questionIdText.innerText = quiz[currentQuestion].id;
    questionIdExplanation.innerText = quiz[currentQuestion].id;
    
    questionText.innerText = quiz[currentQuestion].question;
    quiz[currentQuestion].answers.forEach((answer, i) => {
        answerTexts[i].innerText = answer;
    })

    if (quiz[currentQuestion].figure != "") {
        figure.src = `/assets/images/figures/${quiz[currentQuestion].figure}`;
        figure.style.display = "block";
    } else {
        figure.style.display = "none";
    }

    if (quiz[currentQuestion].explanation != null) {
        questionExplanationButton.style.display = "initial";
        questionExplanation.innerText = quiz[currentQuestion].explanation;
    } else {
        questionExplanationButton.style.display = "none";
        questionExplanation.innerText = "There is no explanation for this question yet.";
    }

    if (quizFinished) {
        document.querySelector(".infoRow").style.display = "flex";

        correctBox.style.maxHeight = (correctBox.scrollHeight * 3) + 'px'
        document.querySelector(".answer.correct")?.classList?.remove("correct");

        answers[quiz[currentQuestion].correct].classList.add("correct");

        const correct = quiz[currentQuestion].selected_answer == quiz[currentQuestion].correct;
        correctBox.classList.remove(correct ? "wrong" : "correct");
        correctBox.classList.add(correct ? "correct" : "wrong");
        correctBox.classList.add("visible");
        correctBoxTitle.innerText = correct
            ? "Correct!"
            : "Wrong.";
        correctBoxSubtitle.innerText = correct
            ? "That was the right answer."
            : `The right answer was ${quiz[currentQuestion].correct_letter}`;
    }

    const questionsToGo = quiz.filter(question => question.selected_answer < 0).length
    questionsRemaining.innerText = questionsToGo;
    quizProgressBar.value = quiz.length - questionsToGo;
    quizProgressBar.max = quiz.length;
}

function finishQuiz() {
    quizFinished = true;
    finishButton.disabled = true;
    answerRadios.forEach(radio => radio.disabled = true);

    let correctQuestions = 0;
    const userQuestionInfos = JSON.parse(localStorage.getItem(`${studyClass}-pool`) ?? "{}");
    quiz.forEach(question => {
        if (question.selected_answer == question.correct) correctQuestions++;
        else {
            if (question.id in userQuestionInfos) {
                userQuestionInfos[question.id]["score"] = -2;
            }
        }
    })
    localStorage.setItem(`${studyClass}-pool`, JSON.stringify(userQuestionInfos));

    const score = Math.floor((correctQuestions / quiz.length) * 100);

    const dialog = document.getElementById("practiceTestFinishedDialog");
    const passedText = document.getElementById("passedText");
    const passedText2 = document.getElementById("passOrFail");
    const scoreText = document.getElementById("score");
    const passedTestBox = document.getElementById("passedTest");

    scoreText.innerText = score;
    document.getElementById("practiceTestProgress").style.display = "none";

    if (score >= 74) {
        passedText.innerText = "You passed!";
        passedText2.innerText = "You passed!";
        passedTestBox.style.display = "flex";
        document.getElementById("practiceTestPassedCheck").style.display = "block";
    } else {
        passedText.innerText = "You failed.";
        passedText2.innerText = "You failed.";
        document.getElementById("practiceTestFailedX").style.display = "block";
    }

    dialog.showModal();
    document.getElementById("smallPracticeTestFinished").style.display = "flex";

    changeQuestion(0);
}

generateQuiz();
changeQuestion(0);

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