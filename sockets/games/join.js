const GameManagement = require('../GameManagement');
const _ = require('lodash');

function getUsernameFromSocket(socket) {
    // let username = '';
    // console.log(socket.handshake.query);
    // _.forEach(_.split(socket.handshake.query.username, ';'), (v) => {
    //     let tmp = _.split(v, '=');
    //     if (tmp[0] == 'username') {
    //         username = tmp[1];
    //     }
    // });
    return socket.handshake.query.username;
}

module.exports = (io) => {
    var games = [];

    // On user connect
    io.on('connection', (socket) => {

        // Check if game management exit for this room
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
            game.userConnect(socket, getUsernameFromSocket(socket), socket.handshake.query.gameId);
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
                game.receiveAnswer(socket, game, data.answerId, data.answerId );
            } catch (e) {
                socket.emit("error", e);
            }
        });

    });

    // @todo disconnect ?
};
