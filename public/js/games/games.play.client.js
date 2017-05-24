$(document).ready(function() {

    var defaultTimer = 3;
    var questionTimer = 5;
    var timerStyle  = '-webkit-transition: width ' + questionTimer + 's linear; '
                    + '-moz-transition: width ' + questionTimer + 's linear; '
                    + '-ms-transition: width ' + questionTimer + 's linear; '
                    + '-o-transition: width ' + questionTimer + 's linear; '
                    + 'transition: width ' + questionTimer + 's linear;';

    var isQuestionTime = false;
    var firstSentence = 'Êtes vous prêt ?<br> Vous avez ' + questionTimer + ' secondes pour répondre à chaque question.';

    var questionSample = { label: 'Qu\'est-ce qui est rond et marron ?', nb_question: 1, answers: [{ id : 0, text: 'Un marron !' }, { id : 1, text: 'Euh, un rond marron ?' }, {id : 2, text: 'C\'est pas faux.' }] };
    var gameSample = { name : 'Ma première game', nb_players : 5, quiz : 'Vais-je avoir mon année ?', nbQuestions: 15 };
    var responseSample = { info: 'En effet vous êtes un gland...'};
    var playersSample = [{ name: "Léo", pts: 5 }, { name: "Thomas", pts: 3 }, { name: "Steve", pts: 2 }, { name: "Romain", pts: 1 }, { name: "Clément", pts: 0 }];

    // EVENTS
    $('.answers .ans1 .answer-content').on('click', function() { sendAnswer(1) });
    $('.answers .ans2 .answer-content').on('click', function() { sendAnswer(2) });
    $('.answers .ans3 .answer-content').on('click', function() { sendAnswer(3) });

    // INIT
    function init() {
        hideQuestion();
        hideLoading();
        hideTimer();
        hideAnswers();
        updateNumQuestion('-');
        setNumberOfQuestion('-');
        // launchTimer(questionTimer, hideTimer);
        // resetProgress();
        // setProgress(20);
        initScores(playersSample);
        initGame();
    }

    function initScores(players) {
        generateScoreTable(players);
        $('.players .players-table .player .position .editable').html(1);
        $('.players .players-table .player .points .editable').html('0 pt');
    }

    function initGame() {
        showQuestion(firstSentence);
        setNumberOfQuestion(gameSample.nbQuestions);
        setQuizName(gameSample.quiz);
        questionCycle(questionSample);
    }


    // CYCLES FUNCTIONS
    function questionCycle(question) {
        // TODO passer la question
        hideQuestion();
        hideResponse();
        hideAnswers();
        updateNbAnswers(gameSample.nb_players);
        updateNumQuestion(question.nb_question);
        resetProgress();

        showLoading();
        launchLoading(defaultTimer, cb);

        function cb() {
            isQuestionTime = true;

            hideLoading();
            showQuestion(question.label);
            showAnswers(question.answers);
            showTimer();
            launchTimer(questionTimer, cb2);

            function cb2() {
                isQuestionTime = false;

                hideTimer();
                hideAnswers();
                showResponse(1);
                showQuestion(responseSample.info);
                // Run en boucle TODO remove
                // setTimeout(questionCycle(questionSample), 1000);
            }
        }
    }

    function scoresCycle(scores) {
        // TODO scores
    }


    // COMMON FUNCTIONS
    function hideOrShowElement(element, action) {
        if (action === 'show') $(element).show();
        if (action === 'hide') $(element).hide();
    }


    // LOADING CIRCLE FUNCTIONS
    function launchLoading(timer, callback) {
        $('.question .loading .text-spinner .editable').html(timer--);

        var intervalId = setInterval (function() {
            $('.question .loading .text-spinner .editable').html(timer);

            if (timer < 0) {
                clearInterval(intervalId);
                if (callback) callback();
            }

            timer--;
        }, 1000);
    }

    function hideLoading() {
        hideOrShowElement('.question .loading', 'hide');
    }

    function showLoading() {
        hideOrShowElement('.question .loading', 'show');
    }


    // TIMER AND PROGRESS FUNCTIONS
    function hideTimer() {
        hideOrShowElement('.question .timer', 'hide');
    }

    function showTimer() {
        hideOrShowElement('.question .timer', 'show');
    }

    function resetProgress() {
        $('.question .progress .determinate').attr('style', 'width: 0%;');
    }

    function setProgress(prc) {
        $('.question .progress .determinate').attr('style', 'width: ' + prc +'%; ' + timerStyle);
    }

    function launchTimer(timer, callback) {
        resetProgress();
        $('.question .timer .editable').html(timer--);

        var intervalId = setInterval (function() {
            if (timer === questionTimer - 1) setProgress(100);

            $('.question .timer .editable').html(timer);

            if (timer < 0) {
                clearInterval(intervalId);
                if (callback) callback();
            }

            timer--;
        }, 1000);
    }


    // ANSWERS FUNCTIONS
    function hideAnswers() {
        hideOrShowElement('.answers .answer', 'hide');
        hideOrShowElement('.answers .answer .text.editable', 'hide');
        hideOrShowElement('.answers .nbAnswers .nbaContent', 'hide');
    }

    function showAnswers(answers) {
        hideOrShowElement('.answers .answer', 'show');
        hideOrShowElement('.answers .answer .text.editable', 'show');
        $('.answers .ans1 .answer-content .editable').html(answers[0].text);
        $('.answers .ans2 .answer-content .editable').html(answers[1].text);
        $('.answers .ans3 .answer-content .editable').html(answers[2].text);

        $('.response.res1 .response-content .editable').html(answers[0].text);
        $('.response.res2 .response-content .editable').html(answers[1].text);
        $('.response.res3 .response-content .editable').html(answers[2].text);

        hideOrShowElement('.answers .nbAnswers .nbaContent', 'show');
    }

    function sendAnswer(answerId) {
        // TODO send answerId to server
        if (isQuestionTime) {
            console.log('Send answer [id] : ', answerId);
        }
    }

    function updateNbAnswers(number) {
        var txt = number + ' ';
        number <= 1 ? txt += 'réponse' : txt += 'réponses';

        $('.answers .nbAnswers .editable').html(txt);
    }

    function hideNbAnswers() {
        hideOrShowElement('.answers .nbAnswers', 'hide');
    }

    function showNbAnswers() {
        hideOrShowElement('.answers .nbAnswers', 'show');
    }

    function showResponse(num) {
        hideOrShowElement('.answers .response', 'show');
        for (var i = 1 ; i < 4 ; i++) {
            if (num !== i-1) {
                $('.response.res' + i + ' .response-content').attr('style', 'opacity: 0.3');
            } else {
                $('.response.res' + i + ' .response-content').attr('style', 'opacity: 1;');
            }

            $('.response.res' + i + ' .response-content .editable').attr('style', 'opacity: 1;');
        }
    }

    function hideResponse() {
        hideOrShowElement('.answers .response', 'hide');
    }


    // QUESTIONS FUNCTIONS
    function waitForNextQuestion() {
        hideOrShowElement('.question .loading', 'show');
        launchLoading(defaultTimer, hideTimer);
    }

    function showQuestion(question) {
        hideOrShowElement('.question .question-text', 'show');
        $('.question .question-text .editable').html(question);
    }

    function hideQuestion() {
        hideOrShowElement('.question .question-text', 'hide');
    }

    function updateNumQuestion(nb) {
        $('.question .numQuestion-title .numQuestion.editable').html(nb);
    }

    function setNumberOfQuestion(nb) {
        $('.question .numQuestion-title .nbQuestions.editable').html(nb);
    }


    // SCORES AND PLAYERS
    function generateScoreTable(players) {
        var playerHtml = '';

        for(var i = 1 ; i <= players.length ; i++) {
          var p = players[i-1].pts <=1 ? 'pt' : 'pts';
          playerHtml +=  '<div class="col s12 player">' +
                            '<div class="col s2 position">' +
                              '<span class="editable circle">' + i + '</span>' +
                            '</div>' +
                            '<div class="col s6 name">' +
                                '<span class="editable">' + players[i-1].name + '</span>' +
                            '</div>' +
                            '<div class="col s2 points">' +
                                '<span class="editable">' + players[i-1].pts + ' ' + p + '</span>' +
                            '</div>' +
                            '<div class="col s2 played">' +
                                '<span class="editable">...</span>' +
                            '</div>' +
                          '</div>';
        }

        $('.players .players-table').html(playerHtml);
    }

    function updateScores(scores) {
        // TODO update scores ? Quel objet ?
    }


    // OTHERS
    function setQuizName(name) {
        $('.content-header .editable').html(name);
    }

    init();
})
