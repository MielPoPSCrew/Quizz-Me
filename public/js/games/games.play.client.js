$(document).ready(function() {

    // SOCKET
    var gameId = window.location.pathname.split('/')[2];
    var creator = $('#game-information').data('creator');
    var username = $('#game-information').data('player');
    console.log("creator=" + creator);
    console.log("username=" + username);
    var socket = io.connect('http://localhost:8737', { query : 'gameId=' + gameId + '&username=' + username });


    // DEFAULT VARS
    const defaultTimer = 3;
    const questionTimer = 7;
    const timerStyle  = '-webkit-transition: width ' + questionTimer + 's linear; '
                    + '-moz-transition: width ' + questionTimer + 's linear; '
                    + '-ms-transition: width ' + questionTimer + 's linear; '
                    + '-o-transition: width ' + questionTimer + 's linear; '
                    + 'transition: width ' + questionTimer + 's linear;';


    // SENTENCES
    const firstSentence = 'Êtes vous prêt ?<br> Vous avez ' + questionTimer + ' secondes pour répondre à chaque question.';
    const waitingSentence = 'En attente de connexion des autres joueurs...';
    const winnerSentence = 'Et le gagnant est...<br>';


    // SAMPLES
    // var questionSample = { label: 'Qu\'est-ce qui est rond et marron ?', nb_question: 1, answers: [{ id : 0, text: 'Un marron !' }, { id : 1, text: 'Euh, un rond marron ?' }, {id : 2, text: 'C\'est pas faux.' }] };
    // var gameSample = { name : 'Ma première game', nb_players : 5, quiz : 'Vais-je avoir mon année ?', nbQuestions: 15, gameId : 'YH25GI78'  };
    // var responseSample = { gagnant: "Clément", place: 2, info: 'En effet vous êtes un gland...'};
    // var playersSample = [{ name: "Léo", pts: 5 }, { name: "Thomas", pts: 3 }, { name: "Steve", pts: 2 }, { name: "Romain", pts: 1 }, { name: "Clément", pts: 0 }];


    // USEFUL VARS
    var isQuestionTime = false;
    var nbPlayers = 0;


    // EVENTS
    $('.answers .ans1 .answer-content').on('click', function() { sendAnswer(1) });
    $('.answers .ans2 .answer-content').on('click', function() { sendAnswer(2) });
    $('.answers .ans3 .answer-content').on('click', function() { sendAnswer(3) });

    $(document).on('keypress', function(e) {
        var key = (e.which-32);
        switch(key) {
            case 49: case 50: case 51: case 52: case 65: case 90: case 69: case 82: case 81: case 83: case 68: case 70: case 87: case 88: case 67: case 86: sendAnswer(1); break;
            case 53: case 54: case 55: case 56: case 84: case 89: case 85: case 75: case 71: case 72: case 74: case 75: case 66: case 78: case 188: case 190: sendAnswer(2); break;
            case 57: case 48: case 219: case 187: case 79: case 80: case 221: case 186: case 76: case 77: case 192: case 220: case 191: case 223: case 16: sendAnswer(3); break;
        }
    });

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

        $('.players .scores-title .game-name .editable').html(info.gameTitle + '<br><span class="game-id">#' + gameId + '</span>');
        showQuestion('Game #' + gameId + '<br>' + waitingSentence);

        showLaunchButton();
    }

    function initScores(players) {
        generateScoreTable(players);
        $('.players .players-table .player .position .editable').html(1);
        $('.players .players-table .player .points .editable').html('0 pt');
    }

    function initGame(obj) {
        setNbPlayers(obj.nbPlayers);
        hideLaunchButton();
        showQuestion(firstSentence);
    }


    // CYCLES FUNCTIONS
    function questionCycle(question) {
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
        // TODO place à chaque round
        // showQuestion(scores[0] + ' a été le plus rapide... Vous êtes ' + 2 + 'e.');
    }

    function endGameCycle(obj) {
        scoresCycle(obj.scores);

        if (obj.winner === username) showQuestion(winnerSentence + 'VOUS !<br> Bravo vous avez écrasé vos adversaires !');
        else showQuestion(winnerSentence + obj.winner + ' ! Vous êtes tout de même ' + _.find(obj.rank, function(r) { return r.username === username}).position + 'e... ce n\'est pas si mal. Entraînez-vous !');
    }


    // COMMON FUNCTIONS
    function hideOrShowElement(element, action) {
        if (action === 'show') $(element).show();
        if (action === 'hide') $(element).hide();
    }

    function launchGame() {
      if (isCreator()) {
        console.log("Send Launch game");
        socket.emit('launchGame', { username: username });
      }

      else console.log("You are not the creator tabarnak !");
    }

    function isCreator() {
        return creator === username;
    }

    function updateCreator(username) {
        creator = username;
        showLaunchButton();
    }

    function setNbPlayers(nbp) {
        nbPlayers = nbp;
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
        $('.answer.ans1 .answer-content').attr('style', 'background-color: #2E74B5; opacity: 0.9;');
        $('.answer.ans2 .answer-content').attr('style', 'background-color: #C45911; opacity: 0.9;');
        $('.answer.ans3 .answer-content').attr('style', 'background-color: #538135; opacity: 0.9;');

        $('.answers .ans1 .answer-content .editable').html(answers[0]);
        $('.answers .ans2 .answer-content .editable').html(answers[1]);
        $('.answers .ans3 .answer-content .editable').html(answers[2]);

        $('.response.res1 .response-content .editable').html(answers[0]);
        $('.response.res2 .response-content .editable').html(answers[1]);
        $('.response.res3 .response-content .editable').html(answers[2]);

        hideOrShowElement('.answers .nbAnswers .nbaContent', 'show');
    }

    function sendAnswer(answerId) {
        if (isQuestionTime) {
            var indexOfAnswer = (answerId-1);
            console.log('Send answer [id] : ', indexOfAnswer);
            socket.emit('sendAnswer', { myId: username, answerId: indexOfAnswer });

            lockAnswers(answerId);
            isQuestionTime = false;
        }
    }

    function lockAnswers(answerId) {
        console.log('lockAnswers');
        $('.answers .answer-content').attr('style', 'background-color: grey; opacity: 0.3;');
        $('.answer.ans' + answerId + ' .answer-content').attr('style', 'background-color: grey; opacity: 1;');
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
        $('.players .players-table .player .name .editable:contains("' + name + '")').parent().parent().find('.played .editable').html('PLAYED');
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
                              '<span class="editable circle">  -  </span>' +
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
          var p = players[i-1].score <= 1 ? 'point' : 'points';
          playerHtml +=  '<div class="col s12 player">' +
                            '<div class="col s2 position">' +
                              '<span class="editable circle">' + i + '</span>' +
                            '</div>' +
                            '<div class="col s6 name">' +
                                '<span class="editable">' + players[i-1].username + '</span>' +
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
        if (isCreator()) hideOrShowElement('.question .launch-button', 'show');
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
        generateScoreTable(res.users);
    });

    // When the game start
    socket.on('gameStart', function(nbPlayers) {
        console.log('gameStart');
        initGame(nbPlayers);
    });

    // When round start
    socket.on('roundStart', function(round) {
        console.log('roudStart');
        questionCycle(round);
    });

    socket.on('userAnswer', function(user) {
        console.log('userAnswer');
        updateNbAnswers(parseInt($('.answers .nbAnswers .editable').text())-1);
        togglePlayed(user.username);
    });

    socket.on('roundEnd', function(roundEndInfo) {
        console.log('roundEnd');
        scoresCycle(roundEndInfo.scores);
        responseCycle(roundEndInfo);
    });

    socket.on('gameEnd', function(gameEndInfo) {
        console.log('gameEnd');
        endGameCycle(gameEndInfo);
    });

    socket.on('newGameMaster', function(username) {
        updateCreator(username);
    });

    socket.on('playerLeave', function(res) {
        console.log('playerLeave');
        generateScoreTable(res.users);
    });

    socket.on('error', function(error) {
        console.log('[ERROR FROM SERVER] ' + error);
    });

})
