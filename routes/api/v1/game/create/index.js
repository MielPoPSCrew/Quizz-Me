const router  = require('express').Router();
const _       = require('lodash');
const Hashids = require('hashids');
const   async = require('async');

router.post('/', (req, res) => {

    let error   = {};
    let success = {};
    let game    = {};

    async.waterfall([

        // TODO : utiliser async ou mieux ?
        (callback) => {
            if(_.isEmpty(req.query.creator_name)){
                res.statusCode = 400;
                error.message = 'creator_name is missing or empty';
                res.json(error);
                return;
            }
        },
    ], res)

    // validation on creator
    /*if(_.isEmpty(req.query.creator_name)){
        res.statusCode = 400;
        error.message = 'creator_name is missing or empty';
        res.json(error);
        return;
    }*/

    // validation on quiz
    if(_.isEmpty(req.query.quiz_name)){
        res.statusCode = 400;
        error.message = 'quiz_name is missing or empty';
        res.json(error);
        return;
    }

    // validation on is_private
    if(_.isEmpty(req.query.is_private)){
        res.statusCode = 400;
        error.message = 'is_private is missing or empty';
        res.json(error);
        return;
    }

    // validation on nb max user
    if(_.isEmpty(req.query.nb_max_user)){
        res.statusCode = 400;
        error.message = 'nb_max_user is missing or empty';
        res.json(error);
        return;
    }

    if (req.is_private)

    // validation on name
    if(_.isEmpty(req.query.name)){
        res.statusCode = 400;
        error.message = 'name is missing or empty';
        res.json(error);
        return;
    }

    // creator exists ?
    DB.get('users').findOne({username: req.query.creator_name}).then((creator) => {
        if(creator.length === 0) {
            res.statusCode = 400;
            error.message = "creator_name does not exist";
            res.json(error);
            return;
        } else {
            game.users = [creator._id];
            game.creator = creator._id;
        }
    }).catch(console.error);

    // quiz exists ?
    DB.get('quiz').findOne({name: req.query.quiz_name}).then((quiz) => {
        if(quiz.length === 0) {
            res.statusCode = 400;
            error.message = "quiz_name does not exist";
            res.json(error);
            return;
        } else {
            game.id_quiz = quiz._id
        }
    }).catch(console.error);

    // name of game already exists ?
    DB.get('games').find({name: req.query.name}).then((game) => {
        if(game.length === 0) {
            let hashids = new Hashids("this is my salt");
            let h = hashids.encode(Date.now().valueOf());
            game.hash        = h;
            game.nb_max_user = _.toInteger(req.query.nb_max_user);
            game.name        = req.query.name;
            game.private     = req.is_private == 'true' ? true : false;
            game.started     = false;
            console.log(game);

            //DB.get('games').insert(game);
        } else {
            res.statusCode = 400;
            error.message = "game_name already exists";
            res.json(error);
            return;
        }
    }).catch(console.error);

    res.json(success);

});

module.exports = router;