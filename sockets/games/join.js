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
        console.log("JOIN=" + gameId)
        socket.join(gameId);

        console.log(getUsernameFromSocket(socket) + ' connected');
        try {
            game.userConnect(socket, getUsernameFromSocket(socket), socket.handshake.query.gameId);
        } catch (e) {
            socket.emit("error", e);
        }

        socket.on('launchGame', (data) => {
            console.log("launchGame");
            try {
                game.launchGame(socket, data.username);
            } catch (e) {
                socket.emit("error", e);
            }
        });

        socket.on('sendAnswser', (data) => {
            try {
                game.receiveAnswer(socket, data.username, data.answer);
            } catch (e) {
                socket.emit("error", e);
            }
        });

    });

    // @todo disconnect ?
};
