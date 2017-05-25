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
    const gameManagement = new GameManagement();
    // On user connect
    io.on('connection', (socket) => {

        console.log(getUsernameFromSocket(socket) + ' connected');
        try {
            gameManagement.userConnect(socket, getUsernameFromSocket(socket), socket.handshake.query.gameId);
        } catch (e) {
            socket.emit("error", e);
        }

        socket.on('launchGame', (data) => {
            console.log("launchGame");
            try {
                gameManagement.launchGame(socket, data.username);
            } catch (e) {
                socket.emit("error", e);
            }
        });

        socket.on('sendAnswser', (data) => {
            try {
                gameManagement.receiveAnswer(socket, data.username, data.answer);
            } catch (e) {
                socket.emit("error", e);
            }
        });

    });

    // @todo disconnect ?
};
