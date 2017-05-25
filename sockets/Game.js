const _ = require('lodash');

/**
 * @typedef {Object} Game
 * @property {string} _id - The game ID
 * @property {string} name - The game name
 * @property {UserMongoLike} creator - The game creator
 * @property {number} created - The game creation timestamp
 * @property {QuizMongoLike} quiz - The game quiz
 * @property {UserMongoLike[]} users - The game users
 * @property {boolean} opened - If the game is opened
 * @property {boolean} private - If the game is private
 */

/**
 * @typedef {Object} GameMongoLike
 * @property {string} _id - The game ID
 * @property {string} name - The game name
 * @property {string} creator - The game creator ID
 * @property {number} created - The game creation timestamp
 * @property {string} quiz - The game quiz ID
 * @property {string[]} users - The game users ID
 * @property {boolean} opened - If the game is opened
 * @property {boolean} private - If the game is private
 */

/**
 * @typedef {Object} QuizMongoLike
 * @property {string} _id - The quiz ID
 * @property {string} name - The quiz name
 * @property {string} creator - The quiz creator ID
 * @property {number} created - The quiz creation timestamp
 * @property {QuizMongoLikeQuestion[]} questions - The quiz questions
 */

/**
 * @typedef {Object} QuizMongoLikeQuestion
 * @property {string} question - The question name
 * @property {string[]} choices - The quiz answer choice
 * @property {number} answer - The quiz answer key in choices array
 * @property {string} info - Additional information about the question
 */

/**
 * @typedef {Object} UserMongoLike
 * @property {string} _id - The user ID
 * @property {string} username - The user name
 * @property {number} created - The user creation timestamp
 * @property {UserMongoLikeStatistics} statistics - The user statistics
 */

/**
 * @typedef {Object} UserMongoLikeStatistics
 * @property {number} gamesTotal - The total number of games played
 * @property {number} gamesWon - The total number of games won
 * @property {number} goodAnswers - The total number of good answers
 * @property {number} quickAnswers - The total number of quick answers
 */

/**
 * Game object containing all the game information
 */
class Game {
    /**
     * Constructor
     */
    constructor () {
        this._id    = '';
        this.name    = '';
        this.creator = {};
        this.created = 0;
        this.quiz    = {};
        this.users   = [];
        this.opened  = false;
        this.private = false;
    }

    /**
     * Load game information from mongo like objects
     *
     * @param {GameMongoLike} gameMongoLike - Game mongo like object
     * @param {QuizMongoLike} quizMongoLike - Quiz mongo like object
     * @param {UserMongoLike[]} usersMongoLike - Users mongo like object
     *
     * @return {undefined}
     */
    loadGameFromMongo (gameMongoLike, quizMongoLike, usersMongoLike) {
        const self = this;
        this._id           = gameMongoLike._id;
        this.name         = gameMongoLike.name;
        this.creator      = _.find(usersMongoLike, {"_id": gameMongoLike.creator});
        this.created      = gameMongoLike.created;
        this.quiz         = quizMongoLike;
        this.quiz.creator = _.find(usersMongoLike, {"_id": quizMongoLike.creator});
        this.users        = [];
        this.opened       = gameMongoLike.opened;
        this.private      = gameMongoLike.private;

        _.forEach(gameMongoLike.users, (id) => {
            const user = _.find(usersMongoLike, {"_id": id});

            if (_.isUndefined(user)) {
                throw new Error(`The user with ID = ${id} was not on the users mongo array.`);
            }

            self.users.push(user);
        });

        if (_.isUndefined(this.creator)) {
            throw new Error('Game creator was not on the users mongo array.');
        }

        if (_.isUndefined(this.quiz.creator)) {
            throw new Error('Quiz creator was not on the users mongo array.');
        }
    }
}

module.exports = Game;
