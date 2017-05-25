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
              console.log('game : ', game);

              if (_.isEmpty(game)) {
                  throw new Error('This game does not exists.');
              }
              // Get answers
              DB.get('quiz')
                .findOne({"_id": game.quiz})
                .then((quiz) => {
                    console.log('quiz : ', quiz);
                    // Get users
                    DB.get('users')
                      .find({"_id": {"$in": _.concat([], game.creator, game.users, quiz.creator)}})
                      .then((users) => {
                          self.game.loadGameFromMongo(game, quiz, users);
                          self.initialized = true;
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
        console.log('userConnect');
        if (this.initialized) {
            console.log('userJoin');
            this.userJoin(socket, username);
        } else {
            console.log('init');
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

        // Alert users that the game is starting
        socket.broadcast.emit("gameStart");

        // Start the first round after 5 sec
        _.delay(this.startRound, 5000, socket);
    }

    /**
     * Update the round answer with the new answer recieved, call the next round if it was the last answer needed
     *
     * @param {Object} socket - User socket object
     * @param {string} username - The new user name
     * @param {number} answer - The user answer index
     *
     * @return {undefined}
     */
    recieveAnswer (socket, username, answer) {
        this.rounds[this.currentRound].push({username, answer, "time": new Date() - this.timer});
        this.scores[username] += _.size(this.users) - this.answered++;

        // Alert users that the user answer the question
        socket.broadcast.emit("userAnswer", {username});

        if (this.answered === _.size(this.users)) {
            // Alert users that the round is ended and share the scores
            clearTimeout(this.timeout);
            this.endRound(socket);
            // End of the game if this was the last question
            if (++this.currentRound === _.size(this.game.quiz.questions)) {
                socket.emit("gameEnd");
            } else {
                // Start the new round
                this.startRound(socket);
            }
        }
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
        console.log('function user join');
        console.log(username);
        const self = this;

        // Get the user information
        DB.get('users')
          .findOne({ username: username })
          .then((user) => {
              console.log('user : ', user);
              if (_.isEmpty(user)) {
                  throw new Error('User not found on the database');
              }

              if (!_.isUndefined(_.find(self.users, user))) {
                  throw new Error('User is already in the game');
              }

              // Add the user to the game session
              self.users.push(user);
              self.scores[username] = 0;

              // Send the event to all the users in the room
              socket.broadcast.emit("userEnterInTheGame", {"users": self.users});
              socket.emit("userEnterInTheGame", {"users": self.users});
              console.log('USER JOIN');
              // Send the game info to the user
              socket.emit("gameEnter", {
                  // eslint-disable-next-line no-underscore-dangle
                  "gameId"           : self.game._id,
                  "numberOfQuestions": _.size(self.game.quiz.questions),
                  "gameTitle"        : self.game.name
              });
          });
    }

    /**
     * Start a new round
     *
     * @param {Object} socket - User socket object
     *
     * @return {undefined}
     */
    startRound (socket) {
        const self = this;

        this.answered = 0;
        this.timer    = new Date();
        this.timeout  = _.delay(this.endRound, 10000, socket);

        socket.broadcast.emit("roundStart", {
            "roundNumber": self.currentRound,
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
    endRound (socket) {
        // Alert users that the round is ended and share the scores
        socket.broadcast.emit("roundEnd", {
            "scores"    : this.scores,
            "goodAnswer": this.game.quiz.questions[this.currentRound].answer,
            "answerInfo": this.game.quiz.questions[this.currentRound].info
        });
    }
}

module.exports = GameManagement;
