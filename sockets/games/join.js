const _ = require('lodash');

module.exports = (io) => {

    let dataGame = {};

    //io.of('/games/join').use(function(socket, next){
    io.on('connection', (socket) => {

        let gameId = socket.handshake.query.gameid;
        let username;

        // Check room ID
        if(_.isUndefined(gameId)) {
            // TODO : gérer les erreurs
            console.log('No game ID in parameter');
        }

        let cookie = _.split(socket.handshake.headers.cookie, ';');

        _.forEach(cookie, (v) => {
            let tmp = _.split(v, '=');
            if (tmp[0] == 'username') {
                username = tmp[1];
            }
        });

        // get game
        DB.get('games').findOne({ "_id": gameId}).then((game) => {
            if (!(game)) {
                console.log('game error');
                /*res.statusCode = 404;
                error.message = 'This game does not exist';
                res.json(error);*/
            } else {
                console.log('game ok');
                //res.json(existing_game);
            }
        });

        // get user
        DB.get('users').findOne({ "username" : username}).then((user) => {
            if (!(user)) {
                console.log('user error');
            } else {
                console.log('user ok');
            }
        });











        socket.emit('news', { hello: 'world' });
        socket.on('my other event', function (data) {
            console.log('event recu');
            console.log(data);
        });
    });

}