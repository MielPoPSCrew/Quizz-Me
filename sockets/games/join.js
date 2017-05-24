const _ = require('lodash');

// @todo timeout
// @todo reset answers and timer
// @todo refacto with functions

module.exports = (io) => {
    // Game info
    let currentRound = 0,
        answered     = 0,
        timeout      = 10000, // 10 sec
        timer        = new Date(),
        scores       = {},
        dataGame     = {
            "game": null,
            "users": [],
            "rounds": []
        };

    // On connection event
    io.on('connection', (socket) => {
        "use strict";

        let gameId   = socket.handshake.query.gameid,
            username = '';

        // Check room ID
        if (_.isUndefined(gameId)) {
            // TODO : gérer les erreurs
            console.log('No game ID in parameter');
        }

        // Get the username from cookie
        _.forEach(_.split(socket.handshake.headers.cookie, ';'), (v) => {
            let tmp = _.split(v, '=');

            if (tmp[0] == 'username') {
                username = tmp[1];
            }
        });

        if (username === '') {
            console.log('username not found in cookie');
        }

        // Get game info
        DB.get('games').findOne({ "_id": gameId}).then((game) => {
            if (!(game)) {
                console.log('game error');
            } else {
                // Add the game info to the game session
                dataGame.game = game;

                // Get user info
                DB.get('users').findOne({ "username" : username}).then((user) => {
                    if (!(user)) {
                        console.log('user error');
                    } else {
                        if (!_.isUndefined(_.find(dataGame.users, user))) {
                            console.log('ERROR: user already in the game');
                        }

                        // Add the user to the game session
                        dataGame.users.push(user);

                        // Get answers
                        DB.get('quizz').findOne({ "_id" : dataGame.game.quiz}).then((quiz) => {
                            dataGame.game.quiz = quiz;

                            // Send the event to all the users in the room
                            socket.broadcast.emit("userEnterInTheGame", {"users": dataGame.users});

                            // Send the game info to the user
                            socket.emit("gameEnter", {
                                "gameId"           : gameId,
                                "numberOfQuestions": _.size(dataGame.game.quiz.questions),
                                "gameTitle"        : dataGame.game.name
                            });
                        });
                    }
                });
            }
        });
    });

    // On admin launch game
    io.on('launchGame', (socket) => {
        "use strict";

        let username = socket.handshake.username;

        if (username !== _.find(dataGame.users._id, dataGame.game.creator).username) {
            console.log('Your are not the admin of the game');
            // @todo throw exception
        }

        // Alert users that the game is starting
        socket.broadcast.emit("gameStart");

        // Send the first question to all users after 5 sec
        setTimeout(() => {
            socket.broadcast.emit("roundStart", {
                "roundNumber": currentRound,
                "question"   : dataGame.game.quiz.questions[currentRound],
                "choices"    : dataGame.game.quiz.questions[currentRound].choices
            });
        }, 5000);
    });

    // On user send answer
    io.on('sendAnswser', (socket) => {
        "use strict";

        const answer = {
            "username": socket.handshake.username,
            "answer"  : _.parseInt(socket.handshake.answer),
            "time"    : new Date() - timer
        };

        dataGame.rounds[currentRound].push(answer);
        scores[socket.handshake.username] += _.size(dataGame.game.quiz.questions) - answered++;

        if (answered === dataGame.users.length) {
            // @todo update scores tableau d'objets {username, score}
            socket.broadcast.emit("roundEnd", {
                "scores"    : scores,
                "goodAnswer": dataGame.game.quiz.questions[currentRound].answer,
                "answerInfo": dataGame.game.quiz.questions[currentRound].info
            });
            // Alert users that the game is starting
            socket.broadcast.emit("roundStart", {
                "roundNumber": ++currentRound,
                "question"   : dataGame.game.quiz.questions[currentRound].question,
                "choices"    : dataGame.game.quiz.questions[currentRound].choices
            });
            // End of the game if this was the last question
            if (currentRound === _.size(dataGame.game.quiz.questions)) {
                socket.emit("gameEnd");
            }
        }

        // Alert users that the user answer the question
        socket.broadcast.emit("userAnswer", {"username": socket.handshake.username});
    });

    // @todo disconnect ?
}
