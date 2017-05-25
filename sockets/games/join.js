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
    //
    // console.log('IIIIIIIIIIIIIIIIIIIIIIIIII : ', socket.handshake.query.username);
    return socket.handshake.query.username;
}

module.exports = (io) => {
    const gameManagement = new GameManagement();

    // On user connect
    io.on('connection', (socket) => {
        console.log('connection gameId : ', socket.handshake.query.gameId);
        try {
            gameManagement.userConnect(socket, getUsernameFromSocket(socket), socket.handshake.query.gameId);
        } catch (e) {
            socket.emit("error", e);
        }
    });
    // On admin launch game
    io.on('launchGame', (socket) => {
        console.log("launch");
        try {
            gameManagement.launchGame(socket, getUsernameFromSocket(socket));
        } catch (e) {
            socket.emit("error", e);
        }
    });
    // On user send answer
    io.on('sendAnswser', (socket) => {
        try {
            gameManagement.recieveAnswer(socket, getUsernameFromSocket(socket), socket.handshake.query.answer);
        } catch (e) {
            socket.emit("error", e);
        }
    });
    // @todo disconnect ?
};
