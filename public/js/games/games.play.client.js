$(document).ready(function() {

    var gameId = window.location.pathname.split('/')[2];
    var username = $('.username-hidden').html();
    var socket = io.connect('http://localhost:8737', { query : 'gameId=' + gameId + '&username=' + username });

    var isCreator = true;
    // TODO
    var nbPlayers = 0;

    var defaultTimer = 3;
    var questionTimer = 7;
    var timerStyle  = '-webkit-transition: width ' + questionTimer + 's linear; '
                    + '-moz-transition: width ' + questionTimer + 's linear; '
                    + '-ms-transition: width ' + questionTimer + 's linear; '
                    + '-o-transition: width ' + questionTimer + 's linear; '
                    + 'transition: width ' + questionTimer + 's linear;';

    var isQuestionTime = false;
    var firstSentence = 'Êtes vous prêt ?<br> Vous avez ' + questionTimer + ' secondes pour répondre à chaque question.';
    var waitingSentence = 'En attente de connexion des autres joueurs...';
    var winnerSentence = 'And the winner who winneud is...<br>';
    var questionSample = { label: 'Qu\'est-ce qui est rond et marron ?', nb_question: 1, answers: [{ id : 0, text: 'Un marron !' }, { id : 1, text: 'Euh, un rond marron ?' }, {id : 2, text: 'C\'est pas faux.' }] };
    var gameSample = { name : 'Ma première game', nb_players : 5, quiz : 'Vais-je avoir mon année ?', nbQuestions: 15, gameId : 'YH25GI78'  };
    var responseSample = { gagnant: "Clément", place: 2, info: 'En effet vous êtes un gland...'};
    var playersSample = [{ name: "Léo", pts: 5 }, { name: "Thomas", pts: 3 }, { name: "Steve", pts: 2 }, { name: "Romain", pts: 1 }, { name: "Clément", pts: 0 }];

    var game;

    // EVENTS
    $('.answers .ans1 .answer-content').on('click', function() { sendAnswer(1) });
    $('.answers .ans2 .answer-content').on('click', function() { sendAnswer(2) });
    $('.answers .ans3 .answer-content').on('click', function() { sendAnswer(3) });

    $('.question .launch-button').on('click', function() { launchGame() });


    // INIT
    function init() {
        // Hide elements
        hideQuestion();
        hideLoading();
        hideTimer();
        hideAnswers();
        hideResponse();
        hideLaunchButton();

        updateNumQuestion('-');
        setNumberOfQuestion('-');
    }

    function initWaitingRoom(info) {
        setNumberOfQuestion(info.numberOfQuestions);
        setQuizName(info.gameTitle);

        $('.players .scores-title .game-name .editable').html(info.gameTitle + '<br><span class="game-id">#' + info.gameId + '</span>');
        showQuestion('Game #' + info.gameId + '<br>' + waitingSentence);

        showLaunchButton();
    }

    function initScores(players) {
        generateScoreTable(players);
        $('.players .players-table .player .position .editable').html(1);
        $('.players .players-table .player .points .editable').html('0 pt');
    }

    function initGame() {
        hideLaunchButton();
        showQuestion(firstSentence);
    }


    // CYCLES FUNCTIONS
    function questionCycle(question) {
        // TODO passer la question
        hideQuestion();
        hideResponse();
        hideAnswers();
        resetPlayed();

        updateNbAnswers(nbPlayers);
        updateNumQuestion(question.roundNumber);
        resetProgress();

        showLoading();
        launchLoading(defaultTimer, cb);

        function cb() {
            isQuestionTime = true;

            hideLoading();
            showQuestion(question.question);
            showAnswers(question.choices);
            showTimer();
            launchTimer(questionTimer, cb2);

            function cb2() {
                isQuestionTime = false;

                hideTimer();
                hideAnswers();
            }
        }
    }

    function responseCycle(response) {
        showResponse(response.goodAnswer);
        showQuestion(response.answerInfo);
    }

    function scoresCycle(scores) {
        updateScoresTable(scores);

        // TODO PLACE AND NB POINTS
        showQuestion(scores[0].username + ' a été le plus rapide... Vous êtes ' + scores[0].place + 'e.');
    }


    // COMMON FUNCTIONS
    function hideOrShowElement(element, action) {
        if (action === 'show') $(element).show();
        if (action === 'hide') $(element).hide();
    }

    function launchGame() {
      // TODO
      if (isCreator) {
        console.log("Send Launch game");
        socket.emit('launchGame', { myId: cookie });
      }

      else console.log("You are not the creator tabarnak !");
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
            socket.emit('sendAnswer', { myId: cookie, answerId: answerId });
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

    function resetPlayed() {
        $('.players .players-table .player .played .editable').html('...');
    }

    function togglePlayed(name) {
        $('.players .players-table .player .name .editable:("' + name + '")').parent().parent().find('.played .editable').html('PLAYED');
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

        for (var i = 1 ; i <= players.length ; i++) {
          playerHtml +=  '<div class="col s12 player">' +
                            '<div class="col s2 position">' +
                              '<span class="editable circle"> - </span>' +
                            '</div>' +
                            '<div class="col s6 name">' +
                                '<span class="editable">' + players[i-1].username + '</span>' +
                            '</div>' +
                            '<div class="col s2 points">' +
                                '<span class="editable">0 point</span>' +
                            '</div>' +
                            '<div class="col s2 played">' +
                                '<span class="editable">...</span>' +
                            '</div>' +
                          '</div>';
        }

        $('.players .players-table').html(playerHtml);
    }

    function updateScoresTable(players) {
        var playerHtml = '';

        for (var i = 1 ; i <= players.length ; i++) {
          var p = players[i-1].score <= 1 ? 'pt' : 'pts';
          playerHtml +=  '<div class="col s12 player">' +
                            '<div class="col s2 position">' +
                              '<span class="editable circle">' + i + '</span>' +
                            '</div>' +
                            '<div class="col s6 name">' +
                                '<span class="editable">' + players[i-1].name + '</span>' +
                            '</div>' +
                            '<div class="col s2 points">' +
                                '<span class="editable">' + players[i-1].score + ' ' + p + '</span>' +
                            '</div>' +
                            '<div class="col s2 played">' +
                                '<span class="editable">...</span>' +
                            '</div>' +
                          '</div>';
        }

        $('.players .players-table').html(playerHtml);
    }

    // OTHERS
    function setQuizName(name) {
        $('.content-header .editable').html(name);
    }

    function hideLaunchButton() {
        hideOrShowElement('.question .launch-button', 'hide');
    }

    function showLaunchButton() {
        if (isCreator) hideOrShowElement('.question .launch-button', 'show');
    }

    init();


    // EVENTS RECEIVED
    // When enter in the room
    socket.on('gameEnter', function(info) {
        console.log('gameEnter');
        initWaitingRoom(info);
    });

    // When user enters in the game
    socket.on('userEnterInTheGame', function(res) {
        console.log('userEnterInTheGame');
        console.log('???', res);
        generateScoreTable(res.users);
    });

    // When the game start
    socket.on('gameStart', function() {
        console.log('gameStart');
        initGame();
    });

    // When round start
    socket.on('roundStart', function(round) {
        console.log('roudStart');
        questionCycle(round);
    });

    socket.on('userAnswer', function(user) {
        console.log('userAnswer');
        updateNbAnswers(parseInt($('.answers .nbAnswers .editable').text())-1);
        // TEST TODO
        togglePlayed(user.username);
    });

    socket.on('roundEnd', function(scores, answer) {
        console.log('roundEnd');
        scoresCycle(scores);
        responseCycle(answer);
    });

    socket.on('gameEnd', function(scores) {
        console.log('gameEnd');
        scoresCycle(scores);
        showQuestion(winnerSentence + scores[0].username + ' !');
    });

    socket.on('error', function(error) {
        console.log(error);
    });

})
