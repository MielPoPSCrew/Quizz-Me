/* global DB */

const Game = require('./Game'),
      _    = require('lodash');

/**
 * Game session handle
 */
class GameManagement {
    constructor () {
        this.game         = new Game();
        this.initialized  = false;
        this.currentRound = 0;
        this.scores       = {};
        this.users        = [];
        this.rounds       = [];
        this.started      = false;
        this.goodAnswer   = [];
    }

    /**
     * Initialize the game session with game information from DB and connect the user to the game then
     *
     * @param {Object} socket - User socket object
     * @param {string} username - The new user name
     * @param {string} gameId - The game ID
     *
     * @throws {Error} If the game is not found
     *
     * @return {undefined}
     */
    init (socket, username, gameId) {

        const self = this;

        /**
         * @var {GameMongoLike} game
         * @var {QuizMongoLike} quiz
         */
        DB.get('games')
          .findOne({"_id": gameId})
          .then((game) => {
              if (_.isEmpty(game)) {
                  throw new Error('This game does not exists.');
              }

              // Get answers
              DB.get('quiz')
                .findOne({"_id": game.quiz})
                .then((quiz) => {
                    // Get users
                    DB.get('users')
                      .find({"_id": {"$in": _.concat([], game.creator, game.users, quiz.creator)}})
                      .then((users) => {
                          self.game.loadGameFromMongo(game, quiz, users);
                          self.initialized = true;
                          console.log('[' + self.game._id+ '] : initialized');
                          this.userJoin(socket, username);
                      });
                });
          });
    }

    /*******************
     * Callable events *
     *******************/

    /**
     * Initialize the game session if it is not already done and add the user to the game session
     *
     * @param {Object} socket - User socket object
     * @param {string} username - The new user name
     * @param {string} gameId - The game ID
     *
     * @return {undefined}
     */
    userConnect (socket, username, gameId) {
        if (this.initialized) {
            this.userJoin(socket, username);
        } else {
            // console.log('init userConnect');
            this.init(socket, username, gameId);
        }
    }

    /**
     * Launch the game by the game admin
     *
     * @param {Object} socket - User socket object
     * @param {string} username - The new user name
     *
     * @throws {Error} If the user is not the game admin
     *
     * @return {undefined}
     */
    launchGame (socket, username) {

        if (username !== this.game.creator.username) {
            throw new Error('Your are not the admin of the game');
        }

        console.log('[' + this.game._id+ '] : game begin');

        this.started = true;

        // Alert users that the game is starting
        socket.in(this.game._id).emit('gameStart', {nbPlayers:_.size(this.users)});
        socket.emit('gameStart', {nbPlayers:_.size(this.users)});

        // Start the first round after 5 sec
        _.delay(this.startRound, 5000, socket, this, username);
    }

    /**
     * Update the round answer with the new answer received, call the next round if it was the last answer needed
     *
     * @param {Object} socket - User socket object
     * @param {string} username - The new user name
     * @param {number} answer - The user answer index
     * @param {number} answer - The user answer index
     *
     * @return {undefined}
     */
    receiveAnswer (socket, gameManager, username, answer) {

        const self = gameManager;

        // Ajout de la réponse
        self.rounds[self.currentRound].push({username, answer, "time": new Date() - self.timer});


        // Calcul des points
        var goodAnswer = self.game.quiz.questions[self.currentRound].answer;

        // Bonne réponse
        if(answer == goodAnswer)
        {
            self.scores[username]++;
            var quickest = false;

            if(!self.goodAnswer[self.currentRound])
            {
                self.goodAnswer[self.currentRound] = true;
                self.scores[username]++;
                quickest = true;
            }

            DB.get('users').findOne({username:username}).then(function (findPlayer) {
                console.log(findPlayer)
                findPlayer.statistics.goodAnswers++;

                if(quickest)
                {
                    findPlayer.statistics.quickAnswers++;
                }

                console.log(findPlayer)

                DB.get('users').update(findPlayer._id, findPlayer);
            });
        }

        console.log('[' + self.game._id+ '] : received answer from' + username + ' : ' + answer);

        // Alert users that the user answer the question
        socket.in(self.game._id).emit("userAnswer", {username});
        socket.emit("userAnswer", {username});
    }

    /*********************
     * Utilities methods *
     *********************/

    /**
     * Add a user in the game and warn the others users
     *
     * @param {Object} socket - User socket object
     * @param {string} username - The new user name
     *
     * @throws {Error} If the user is not found in the DB
     * @throws {Error} If the user is already in the game
     *
     * @return {undefined}
     */
    userJoin (socket, username) {
        const self = this;

        // Get the user information
        DB.get('users')
          .findOne({ username: username })
          .then((user) => {
              if (_.isEmpty(user)) {
                  throw new Error('User not found on the database');
              }

              // console.log(this.users);
              // console.log(user);
              if (!_.isUndefined(_.find(this.users, user))) {
                  console.log('[' + this.game._id+ '] : ' + username + ' was already in');
              }
              else {

              // Add the user to the game session
              self.users.push(user);
              self.scores[username] = 0;

              DB.get('games').findOne({_id: self.game._id}).then( (gameInfo) => {
                  gameInfo.users.push(username);

                  DB.get('games').update(self.game._id, gameInfo);
              });


              // Send the event to all the users in the room

                console.log('[' + this.game._id+ '] : ' + username + ' join the game');
              }

              socket.in(this.game._id).emit("userEnterInTheGame", {"users": self.users});
              socket.emit("userEnterInTheGame", {"users": self.users});

              // Send the game info to the user
              socket.emit("gameEnter", {
                  // eslint-disable-next-line no-underscore-dangle
                  "gameId"           : self.game._id,
                  "numberOfQuestions": _.size(self.game.quiz.questions),
                  "gameTitle"        : self.game.name
              });
          });
    }

    userLeave (socket, username) {
        const self = this;

        _.remove(this.users, function(un) {
            return un.username === username;
        });

        delete this.scores[username];

        DB.get('games').findOne({_id: self.game._id}).then( (gameInfo) => {
            _.remove(gameInfo.users, function(un) {
                return un === username;
            });

            DB.get('games').update(self.game._id, gameInfo);
        });

        // console.log(this.scores);

        socket.in(this.game._id).emit('playerLeave', {'users': this.users});
    }

    /**
     * Start a new round
     *
     * @param {Object} socket - User socket object
     *
     * @return {undefined}
     */
    startRound (socket, gameManager, username) {
        const self = gameManager;

        //console.log(this);

        self.answered = 0;
        self.timer    = new Date();
        self.timeout  = _.delay(self.endRound, 13000, socket, self, username);
        self.rounds[self.currentRound] = [];

        console.log('[' + self.game._id+ '] : starting round ' + (self.currentRound + 1));

        socket.in(self.game._id).emit("roundStart", {
            "roundNumber": (self.currentRound + 1),
            "question"   : self.game.quiz.questions[self.currentRound].question,
            "choices"    : self.game.quiz.questions[self.currentRound].choices
        });
        socket.emit("roundStart", {
            "roundNumber": (self.currentRound + 1),
            "question"   : self.game.quiz.questions[self.currentRound].question,
            "choices"    : self.game.quiz.questions[self.currentRound].choices
        });
    }

    /**
     * End the current round
     *
     * @param {Object} socket - User socket object
     *
     * @return {undefined}
     */
    endRound (socket, gameManagement, username) {
        const self = gameManagement;
        console.log('[' + self.game._id+ '] : ending round ' + (self.currentRound + 1));

        // Alert users that the round is ended and share the scores

        var cleanScore = [];
        _.forEach(self.scores, function(value, key) {
            cleanScore.push({
                username: key,
                score : value
            })
        });

        console.log(cleanScore);

        socket.in(self.game._id).emit("roundEnd", {
            "scores"    : cleanScore,
            "goodAnswer": self.game.quiz.questions[self.currentRound].answer,
            "answerInfo": self.game.quiz.questions[self.currentRound].info
        });
        socket.emit("roundEnd", {
            "scores"    : cleanScore,
            "goodAnswer": self.game.quiz.questions[self.currentRound].answer,
            "answerInfo": self.game.quiz.questions[self.currentRound].info
        });

        self.currentRound++;

        if ((self.currentRound) >= _.size(self.game.quiz.questions)) {
            console.log('[' + self.game._id+ '] : game end');

            _.sortBy(cleanScore, 'score');

            var rank = [];
            var i = 0;
            _.each(cleanScore, function(value) {
                rank.push({
                    username: value.username,
                    position : ++i
                })
            });

            var winner = cleanScore[0].username;

            DB.get('users').findOne({username:username}).then(function (findPlayer) {
                console.log(findPlayer)
                findPlayer.statistics.gamesTotal++;
                if(username == winner)
                    findPlayer.statistics.gamesWon++;


                DB.get('users').update(findPlayer._id, findPlayer);
            });

            console.log(cleanScore);
            console.log(rank);
            console.log(winner);
            socket.in(self.game._id).emit("gameEnd", {scores:cleanScore, rank:rank, winner:winner});
            socket.emit("gameEnd", {scores:cleanScore});
        } else {
            // Start the new round
            console.log('[' + self.game._id+ '] : new round');
            _.delay(self.startRound, 5000, socket, self, username);
        }
    }
}

module.exports = GameManagement;
