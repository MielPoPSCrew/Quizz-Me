const GameManagement = require('../GameManagement');

module.exports = (io) => {
    const gameManagement = new GameManagement();

    // On user connect
    io.on('connection', (socket) => {
        try {
            gameManagement.userConnect(socket, socket.handshake.username, socket.handshake.gameId);
        } catch (e) {
            socket.emit("error", e);
        }
    });
    // On admin launch game
    io.on('launchGame', (socket) => {
        try {
            gameManagement.launchGame(socket, socket.handshake.username);
        } catch (e) {
            socket.emit("error", e);
        }
    });
    // On user send answer
    io.on('sendAnswser', (socket) => {
        try {
            gameManagement.recieveAnswer(socket, socket.handshake.username, socket.handshake.answer);
        } catch (e) {
            socket.emit("error", e);
        }
    });
    // @todo disconnect ?
};
