let questions = [];
let options = [];
let correctAnswers = [];
let score = { correct: 0, wrong: 0 };
let nowQuestion = 0;
let answeredQuestions = [];

document.getElementById('reload').addEventListener('click', nextQuestion);
document.getElementById('restart').addEventListener('click', resetQuiz);
document.getElementById('closeModal').addEventListener('click', () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById('resultModal'));
    modal.hide();
});

async function translateText(text) {
    const translatedText = await fetch(`https://api.mymemory.translated.net/get?q=${text}&langpair=en|pt`)
        .then(response => response.json())
        .then(data => data.responseData.translatedText);
    return translatedText;
}

const apiUrl = 'https://opentdb.com/api.php?amount=4&category=23&difficulty=easy&type=multiple&encode=url3986';

async function fetchQuizData() {
    document.getElementById('question').innerHTML = "Carregando perguntas...";

    const response = await fetch(apiUrl);
    const data = await response.json();

    for (const item of data.results) {
        const translatedQuestion = await translateText(decodeURIComponent(item.question));
        questions.push(translatedQuestion);
        
        let optionsArray = [];
        for (let incAnswer of item.incorrect_answers) {
            const translatedIncorrect = await translateText(decodeURIComponent(incAnswer));
            optionsArray.push(translatedIncorrect);
        }

        const correctAnswer = await translateText(decodeURIComponent(item.correct_answer));
        optionsArray.splice(Math.floor(Math.random() * 4), 0, correctAnswer);
        
        options.push(optionsArray);
        correctAnswers.push(optionsArray.indexOf(correctAnswer));
    }

    generateQuestion();
}

function generateQuestion() {
    document.getElementById("statusAnswer").innerHTML = "";
    document.getElementById('reload').style.display = 'none';

    if (answeredQuestions.length === questions.length) {
        // Exibe modal com pontuação final
        document.getElementById('modalCorrectCount').innerText = score.correct;
        document.getElementById('modalWrongCount').innerText = score.wrong;
        const modal = new bootstrap.Modal(document.getElementById('resultModal'));
        modal.show();
        document.getElementById('restart').style.display = 'inline-block'; // Mostra o botão de reinício
        return;
    }

    do {
        nowQuestion = Math.floor(Math.random() * questions.length);
    } while (answeredQuestions.includes(nowQuestion));

    answeredQuestions.push(nowQuestion);

    document.getElementById("question").innerHTML = questions[nowQuestion];

    const optionsContainer = document.querySelectorAll('.alternative');
    optionsContainer.forEach((button, index) => {
        button.textContent = options[nowQuestion][index];
        button.disabled = false;
    });
}

function checkAnswer(answer) {
    const statusAnswer = document.getElementById("statusAnswer");
    const correctAnswerIndex = correctAnswers[nowQuestion];
    const correctAnswerText = options[nowQuestion][correctAnswerIndex];

    if (parseInt(answer) === correctAnswerIndex) {
        statusAnswer.innerHTML = "ACERTOU!!!";
        score.correct++;
    } else {
        statusAnswer.innerHTML = `Você errou. A resposta certa é: ${correctAnswerText}`;
        score.wrong++;
    }

    document.querySelectorAll('.alternative').forEach(button => button.disabled = true);

    document.getElementById('reload').style.display = 'inline-block';

    document.getElementById('correctCount').innerText = score.correct;
    document.getElementById('wrongCount').innerText = score.wrong;
}

function nextQuestion() {
    generateQuestion();
}

function resetQuiz() {
    score = { correct: 0, wrong: 0 };
    answeredQuestions = [];
    document.getElementById('correctCount').innerText = score.correct;
    document.getElementById('wrongCount').innerText = score.wrong;
    document.getElementById('restart').style.display = 'none'; // Esconde o botão de reinício
    fetchQuizData(); // Reinicia o quiz com novas perguntas
}

// Adiciona evento de clique aos botões de opções
document.querySelectorAll('.alternative').forEach(button => {
    button.addEventListener('click', (event) => {
        const answer = event.target.value;
        checkAnswer(answer);
    });
});

// Chama a função para buscar dados da API e iniciar o quiz
fetchQuizData();
