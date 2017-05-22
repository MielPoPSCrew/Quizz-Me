const router = require('express').Router();

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