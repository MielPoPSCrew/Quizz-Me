const GameManagement = require('../GameManagement');

function getUsernameFromSocket(socket) {
    let username = '';
    
    _.forEach(_.split(socket.handshake.headers.cookie, ';'), (v) => {
        let tmp = _.split(v, '=');
        if (tmp[0] == 'username') {
            username = tmp[1];
        }
    });
    
    return username;
}

module.exports = (io) => {
    const gameManagement = new GameManagement();

    // On user connect
    io.on('connection', (socket) => {
        try {
            gameManagement.userConnect(socket, getUsernameFromSocket(socket), socket.handshake.query.gameId);
        } catch (e) {
            socket.emit("error", e);
        }
    });
    // On admin launch game
    io.on('launchGame', (socket) => {
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
