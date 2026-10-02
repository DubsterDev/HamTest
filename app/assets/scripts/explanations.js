const techPool = await (
    await fetch("https://raw.githubusercontent.com/DubsterDev/HamTestQuestionPools/refs/heads/main/technician.json", {
      cache: 'no-store'
    })
).json();
const generalPool = await (
    await fetch("https://raw.githubusercontent.com/DubsterDev/HamTestQuestionPools/refs/heads/main/general.json", {
      cache: 'no-store'
    })
).json();
const extraPool = await (
    await fetch("https://raw.githubusercontent.com/DubsterDev/HamTestQuestionPools/refs/heads/main/extra.json", {
      cache: 'no-store'
    })
).json();

document.getElementById("loadingExplanations").style.display = "none";

const explanations = document.getElementById("explanations");

function insertQuestions(question) {
    const hasExplanation = (question.explanation ?? "").trim() != "";
    const details = document.createElement("details");

    const summary = document.createElement("summary");
    summary.innerText = `${question.id}. ${question.question}`;
    if (hasExplanation) summary.classList.add("hasExplanation");
    details.appendChild(summary);

    question.answers.forEach((answer, i) => {
        const answerP = document.createElement("p");
        answerP.classList.add("answer");
        if (i == question.correct) {
            answerP.classList.add("correct");
        }

        const letter = ["A", "B", "C", "D"][i]

        answerP.innerText = `${letter}. ${answer}`;

        details.appendChild(answerP)
    })

    if (hasExplanation) {
        const explanationP = document.createElement("p");
        explanationP.innerText = question.explanation;
        explanationP.classList.add("explanation");
        details.appendChild(explanationP);
    } else {
        const explanationTextArea = document.createElement("textarea");
        explanationTextArea.name = question.id;
        explanationTextArea.placeholder = "Add an explanation...";
        explanationTextArea.classList.add("explanation");
        details.appendChild(explanationTextArea);
    }

    explanations.appendChild(details);
}

async function submitForm() {
    document.getElementById("submittingChanges").showModal();
    const formData = new FormData(explanations);
    const allExplanations = Object.fromEntries(formData);

    const [tech, general, extra] = [{}, {}, {}];

    Object.entries(allExplanations).forEach(([key, value]) => {
        if (value.trim() == "") return;
        switch (key.substring(0, 1)) {
            case "T": 
                tech[key] = value
                break
            case "G":
                general[key] = value
                break
            case "E":
                extra[key] = value
                break
        }
    })

    const body = {
        technician: tech,
        general,
        extra
    }

    if (Object.keys(tech).length == 0) {
        delete body.technician;
    }

    if (Object.keys(general).length == 0) {
        delete body.general;
    }

    if (Object.keys(extra).length == 0) {
        delete body.extra;
    }

    const result = await fetch("https://dubster.hazelhope.com/api/hamtest/suggest.py", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    document.getElementById("submittingChanges").close();
    if (result.status == 200) {
        document.getElementById("error").close();
        const ghLink = (await result.json()).url;
        document.getElementById("githubLink").href = ghLink;
        document.getElementById("success").showModal();
    } else {
        if (result.status == 429) {
            document.getElementById("rateLimited").style.display = "block";
            document.getElementById("internalServerError").style.display = "none";
        } else {
            document.getElementById("rateLimited").style.display = "none";
            document.getElementById("internalServerError").style.display = "block";
        }
        document.getElementById("error").showModal();
    }
}

techPool.forEach(insertQuestions)
generalPool.forEach(insertQuestions)
extraPool.forEach(insertQuestions)

explanations.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    submitForm();
})

document.getElementById("retry").addEventListener("click", submitForm)

document.getElementById("closeSuccess").addEventListener("click", () => {
    document.querySelectorAll("textarea").forEach((textarea) => {
        textarea.value = "";
    })

    document.getElementById("success").close();
})

window.onbeforeunload = () => true