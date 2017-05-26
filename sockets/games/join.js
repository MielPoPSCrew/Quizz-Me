const GameManagement = require('../GameManagement');

module.exports = (io) => {
    var games = [];

    // On user connect
    io.on('connection', (socket) => {

        // Check if game management exit for this room

        var username = socket.handshake.query.username;
        var gameId = socket.handshake.query.gameId;
        var game = games[gameId];

        if(!game)
        {
            game = new GameManagement();
            games[gameId]  = game;
        }

        // Séparation des parties
        socket.join(gameId);

        try {
            game.userConnect(socket, socket.handshake.query.username, socket.handshake.query.gameId);
        } catch (e) {
            socket.emit("error", e);
        }

        socket.on('launchGame', (data) => {
            try {
                game.launchGame(socket, data.username);
            } catch (e) {
                socket.emit("error", e);
            }
        });

        socket.on('sendAnswer', (data) => {
            try {
                game.receiveAnswer(socket, data.myId, data.answerId);
            } catch (e) {
                socket.emit("error", e);
            }
        });

        socket.on('disconnect', function() {
            console.log('Got disconnect! ' + username);
            game.userLeave(socket, username);
        });

    });

    // @todo disconnect ?
};
