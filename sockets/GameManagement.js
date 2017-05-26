/* global DB */
/* eslint-disable no-underscore-dangle */

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
        this.timer        = 0;
        this.scores       = {};
        this.users        = [];
        this.rounds       = [];
        this.started      = false;
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
                          console.log(`[${self.game._id}] : initialized`);
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

        console.log(`[${this.game._id}] : game begin`);

        this.started     = true;
        this.game.opened = false;

        DB.get('games').update(
            {"_id": this.game._id},
            {"$set": {"opened": false}}
        );

        // Alert users that the game is starting
        socket.in(this.game._id).emit('gameStart', {"nbPlayers": _.size(this.users)});
        socket.emit('gameStart', {"nbPlayers": _.size(this.users)});

        // Start the first round after 5 sec
        _.delay(this.startRound, 5000, socket, username);
    }

    /**
     * Update the round answer with the new answer received, call the next round if it was the last answer needed
     *
     * @param {Object} socket - User socket object
     * @param {string} username - The new user name
     * @param {number} answer - The user answer index
     *
     * @return {undefined}
     */
    receiveAnswer (socket, username, answer) {
        const self = this,
              user = _.find(self.users, {username});

        // Add the answer to the round
        this.rounds[this.currentRound].push({username, answer, "time": new Date() - this.timer});

        // Process points
        if (_.parseInt(answer) === _.parseInt(this.game.quiz.questions[this.currentRound].answer)) {
            this.scores[username]++;
            user.statistics.goodAnswers++;

            if (_.isUndefined(_.find(
                this.rounds[this.currentRound],
                {"answer": this.game.quiz.questions[this.currentRound].answer}
            ))) {
                this.scores[username]++;
                user.statistics.quickAnswers++;
            }

            DB.get('users').update(
                {"username": user.username},
                {"$set": {"statistics": user.statistics}}
            );
        }

        console.log(`[${self.game._id}] : received answer from${username} : ${answer}`);

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
          .findOne({username})
          .then((user) => {
              if (_.isEmpty(user)) {
                  throw new Error('User not found on the database');
              }

              if (!_.isUndefined(_.find(self.users, user))) {
                  console.log(`[${self.game._id}] : ${username} was already in`);
                  throw new Error('User is already in the game');
              }

              // Add the user to the game session
              self.users.push(user);
              self.game.users.push(user._id);
              self.scores[username] = 0;

              console.log(`[${self.game._id}] : ${username} join the game`);

              DB.get('games').update(
                  {"_id": self.game._id},
                  {"$set": {"users": self.game.users}}
              );

              // Send the event to all the users in the room
              socket.in(self.game._id).emit("userEnterInTheGame", {"users": self.users});
              socket.emit("userEnterInTheGame", {"users": self.users});

              // Send the game info to the user
              socket.emit("gameEnter", {
                  "gameId"           : self.game._id,
                  "numberOfQuestions": _.size(self.game.quiz.questions),
                  "gameTitle"        : self.game.name
              });
          });
    }

    userLeave (socket, username) {
        const user = _.find(this.users, {username});

        _.remove(this.users, (elem) => elem.username === username);
        _.remove(this.game.users, (elem) => elem._id === user._id);
        delete this.scores[username];

        DB.get('games').update(
            {"_id": this.game._id},
            {"$set": {"users": this.game.users}}
        );

        socket.in(this.game._id).emit('playerLeave', {'users': this.users});

        if (_.isEmpty(this.users)) {
            // Close room
            this.game.opened = false;

            console.log(`[${this.game._id}] : game closed`);

            DB.get('games').update(
                {"_id": this.game._id},
                {"$set": {"opened": false}}
            );
        } else if (!this.started && username === this.game.creator.username) {
            this.game.creator = this.users[0];

            console.log(`[${this.game._id}] : game master changed =${this.game.creator.username}`);

            socket.in(this.game._id).emit("gameMasterChange", {"username": this.game.creator.username});
        }
    }

    /**
     * Start a new round
     *
     * @param {Object} socket - User socket object
     * @param {string} username - The new user name
     *
     * @return {undefined}
     */
    startRound (socket, username) {
        // Kill the game
        if (_.size(this.users) <= 1)        {
            console.log(`[${this.game._id}] : game killed`);
            throw new Error('You are alone in the game');
        }

        this.timer                     = new Date();
        this.timeout                   = _.delay(this.endRound, 13000, socket, username);
        this.rounds[this.currentRound] = [];

        console.log(`[${this.game._id}] : starting round ${this.currentRound + 1}`);

        socket.in(this.game._id).emit("roundStart", {
            "roundNumber": this.currentRound + 1,
            "question"   : this.game.quiz.questions[this.currentRound].question,
            "choices"    : this.game.quiz.questions[this.currentRound].choices
        });

        socket.emit("roundStart", {
            "roundNumber": this.currentRound + 1,
            "question"   : this.game.quiz.questions[this.currentRound].question,
            "choices"    : this.game.quiz.questions[this.currentRound].choices
        });
    }

    /**
     * End the current round
     *
     * @param {Object} socket - User socket object
     * @param {string} username - The new user name
     *
     * @return {undefined}
     */
    endRound (socket, username) {
        const user = _.find(this.users, {username});

        console.log(`[${this.game._id}] : ending round ${this.currentRound + 1}`);

        // Alert users that the round is ended and share the scores

        let cleanScore = [];

        _.forEach(this.scores, (value, key) => {
            cleanScore.push({
                "username": key,
                "score"   : value
            });
        });

        cleanScore = _.sortBy(cleanScore, ['score']);

        socket.in(this.game._id).emit("roundEnd", {
            "scores"    : cleanScore,
            "goodAnswer": this.game.quiz.questions[this.currentRound].answer,
            "answerInfo": this.game.quiz.questions[this.currentRound].info
        });

        socket.emit("roundEnd", {
            "scores"    : cleanScore,
            "goodAnswer": this.game.quiz.questions[this.currentRound].answer,
            "answerInfo": this.game.quiz.questions[this.currentRound].info
        });

        this.currentRound++;

        // End of the game
        if (this.currentRound >= _.size(this.game.quiz.questions)) {
            console.log(`[${this.game._id}] : game end`);

            const rank = [],
                  winner = cleanScore[0].username;

            let i = 0;

            _.forEach(cleanScore, (value) => {
                rank.push({
                    "username": value.username,
                    "position": ++i
                });
            });

            user.statistics.gamesTotal++;

            if (username === winner) {
                user.statistics.gamesWon++;
            }

            DB.get('users').update(
                {"username": user.username},
                {"$set": {"statistics": user.statistics}}
            );

            socket.in(this.game._id).emit("gameEnd", {"scores": cleanScore, rank, winner});
            socket.emit("gameEnd", {"scores": cleanScore, rank, winner});
        } else {
            // Start the new round
            console.log(`[${this.game._id}] : new round`);
            _.delay(this.startRound, 5000, socket, username);
        }
    }
}

module.exports = GameManagement;
