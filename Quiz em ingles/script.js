let questions = [];
let options = [];
let correctAnswers = [];
let score = { correct: 0, wrong: 0 };
let nowQuestion = 0;
let answeredQuestions = [];

document.getElementById('reload').addEventListener('click', nextQuestion);
document.getElementById('restart').addEventListener('click', resetQuiz);

const apiUrl = 'https://opentdb.com/api.php?amount=4&category=23&difficulty=easy&type=multiple&encode=url3986';

async function fetchQuizData() {
    
    document.getElementById('question').innerHTML = "Carregando perguntas...em até 15 segundos...";
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    questions = []; // Reinicia as perguntas
    options = [];
    correctAnswers = [];
    
    for (const item of data.results) {
        // Armazenar a pergunta e respostas diretamente, sem traduzir
        const question = decodeURIComponent(item.question);
        questions.push(question);
        
        let optionsArray = [];
        for (let incAnswer of item.incorrect_answers) {
            const incorrectAnswer = decodeURIComponent(incAnswer);
            optionsArray.push(incorrectAnswer);
        }

        const correctAnswer = decodeURIComponent(item.correct_answer);
        optionsArray.splice(Math.floor(Math.random() * 4), 0, correctAnswer);
        
        options.push(optionsArray);
        correctAnswers.push(optionsArray.indexOf(correctAnswer));
    }
    
    generateQuestion();
}

function generateQuestion() {
    document.getElementById("statusAnswer").innerHTML = "";
    document.getElementById('reload').style.display = 'none';

    // Checa se todas as perguntas foram respondidas
    if (answeredQuestions.length === questions.length) {
        // Exibe modal com pontuação final
        document.getElementById('modalCorrectCount').innerText = score.correct;
        document.getElementById('modalWrongCount').innerText = score.wrong;
        let resultModal = new bootstrap.Modal(document.getElementById('resultModal')); // Corrigir chamada do modal
        resultModal.show(); // Exibe o modal de resultado
        document.getElementById('restart').style.display = 'inline-block'; // Mostra o botão de reinício
        return;
    }

    // Seleciona uma nova pergunta que ainda não foi respondida
    do {
        nowQuestion = Math.floor(Math.random() * questions.length);
    } while (answeredQuestions.includes(nowQuestion));

    answeredQuestions.push(nowQuestion);

    // Exibe a pergunta atual
    document.getElementById("question").innerHTML = questions[nowQuestion];

    // Exibe as opções
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

    // Verifica se a resposta está correta
    if (parseInt(answer) === correctAnswerIndex) {
        statusAnswer.innerHTML = "ACERTOU!!!";
        score.correct++;
    } else {
        statusAnswer.innerHTML = `Você errou. A resposta certa é: ${correctAnswerText}`;
        score.wrong++;
    }

    // Desabilita os botões para evitar novas respostas
    document.querySelectorAll('.alternative').forEach(button => button.disabled = true);

    document.getElementById('reload').style.display = 'inline-block'; // Exibe o botão "Próxima Pergunta"

    // Atualiza a pontuação
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
