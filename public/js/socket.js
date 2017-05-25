var gameId = window.location.pathname.split('/')[2];
console.log(gameId);

var socket = io.connect('http://localhost:8737', { query : 'gameId=' + gameId });

// EVENTS RECEIVED
// When enter in the room
socket.on('gameEnter', function(info) {
    console.log('gameEnter');
    initWaitingRoom(info);
});

// When user enters in the game
socket.on('userEnterInTheGame', function(users) {
    console.log('userEnterInTheGame');
    updateScores(users);
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
