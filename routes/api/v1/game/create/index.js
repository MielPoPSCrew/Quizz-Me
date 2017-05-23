const router  = require('express').Router();
const _       = require('lodash');
const Hashids = require('hashids');
const   async = require('async');

router.post('/', (req, res) => {

    let error   = {};
    let success;
    let game    = {};

    async.waterfall([

        // validation on creator_name
        (callback) => {
            if(_.isEmpty(req.query.creator_name)){
                error.message = 'creator_name is missing or empty';
                callback(error);
            } else {
                callback(null);
            }
        },

        // validation on quiz
        (callback) => {
            if(_.isEmpty(req.query.quiz_name)){
                error.message = 'quiz_name is missing or empty';
                callback(error);
            } else {
                callback(null);
            }
        },

        // validation on is_private
        (callback) => {
            if(_.isEmpty(req.query.is_private)){
                error.message = 'is_private is missing or empty';
                callback(error);
            } else {
                callback(null);
            }
        },

        // validation on nb max user
        (callback) => {
            if(_.isEmpty(req.query.nb_max_user)){
                error.message = 'nb_max_user is missing or empty';
                callback(error);
            } else {
                callback(null);
            }
        },

        // validation on name
        (callback) => {
            if(_.isEmpty(req.query.name)){
                error.message = 'name is missing or empty';
                callback(error);
            } else {
                callback(null);
            }
        },

        // creator exists ?
        (callback) => {
            DB.get('users').findOne({username: req.query.creator_name}).then((creator) => {
                if(creator.length === 0) {
                    error.message = "creator_name does not exist";
                    callback(error);
                } else {
                    game.users = [creator._id];
                    game.creator = creator._id;
                    callback(null);
                }
            }).catch(console.error);
        },

        // quiz exists ?
        (callback) => {
            DB.get('quiz').findOne({name: req.query.quiz_name}).then((quiz) => {
                if(quiz.length === 0) {
                    error.message = "quiz_name does not exist";
                    callback(error);
                } else {
                    game.id_quiz = quiz._id
                    callback(null);
                }
            }).catch(console.error);
        },

        // name of game already exists ?
        (callback) => {
            DB.get('games').findOne({name: req.query.name}).then((existing_game) => {
                if(_.isEmpty(existing_game) || existing_game.length === 0) {
                    let hashids = new Hashids("this is my salt");
                    let h = hashids.encode(Date.now().valueOf());
                    game.hash        = h;
                    game.nb_max_user = _.toInteger(req.query.nb_max_user);
                    game.name        = req.query.name;
                    game.private     = req.query.is_private == 'true' ? true : false;
                    game.started     = false;
                    DB.get('games').insert(game).then((game_created) => {
                        success = game_created._id;
                        callback(null);
                    }).catch(console.error);
                } else {
                    error.message = "game_name already exists";
                    callback(error);
                }
            }).catch(console.error);
        },

        (callback) => {
            res.json(success);
        }

    ], function(error) {
        console.log('ERROR: ' + error.message);
        res.statusCode = _.isEmpty(error.statusCode) ? 400 : error.statusCode;
        res.json(error);
    })
});

module.exports = router;