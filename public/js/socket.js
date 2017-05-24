var socket = io.connect('http://localhost:8737', { query : 'TEST755457' });

// EVENTS RECEIVED
// When enter in the room
socket.on('gameEnter', function(info) {
    initWaitingRoom(info);
});

// When user enters in the game
socket.on('userEnterInTheGame', function(users) {
    updateScores(users);
});

// When the game start
socket.on('gameStart', function() {
    initGame();
});

// When round start
socket.on('roundStart', function(round) {
    questionCycle(round);
});

socket.on('userAnswer', function(user) {
    updateNbAnswers(parseInt($('.answers .nbAnswers .editable').text())-1);
    // TEST TODO
    togglePlayed(user.username);
});

socket.on('roundEnd', function(scores, answer) {
    scoresCycle(scores);
    responseCycle(answer);
});

socket.on('gameEnd', function(scores) {
    scoresCycle(scores);
    showQuestion(winnerSentence + scores[0].username + ' !');
});
