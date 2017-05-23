const router = require('express').Router();
const _      = require('lodash');

router.get('/:id', (req, res) => {
    let error   = {};
    DB.get('games').findOne({_id: req.params.id}).then((existing_game) => {
        console.log(req.query.id);
        if (_.isEmpty(existing_game)) {
            res.statusCode = 404;
            error.message = 'This game does not exist';
            res.json(error);
        } else {
            res.json(existing_game);
        }
    });
});

router.get('/', (req, res) => {
    // retrieve a list of public and opened games
    DB.get('games').find({ "status": "opened", "privacy":"public"}).then((rawGames) => {

        // array of games that will be returned
        let games = [];

        // for each game in database (called rawGame)
        rawGames.forEach((rawGame) => {

            // the object that will be representing a game
            let game = {};

            // get the quiz linked to the game (called rawQuiz)
            DB.get('quiz').find({'_id':rawGame.game_id}).then( (rawQuiz) => {

                // create a new quiz object that will be returned to the caller
                let quiz = {};

                // extract useful information and add it to our new quiz
                quiz._id = rawQuiz._id;
                quiz.name = rawQuiz.name;
                quiz.topic = rawQuiz.topic;

            });
            game.name = rawGame.name;
            game.id = rawGame._id;
            game.quiz = quiz;
            game.pending_users = rawGame.pending_users;
            game.nb_max_user = rawGame.nb_max_user;

            games.push(game);
        });

        res.json(games);
    });
});

router.use('/create',require('./create'));

module.exports = router;