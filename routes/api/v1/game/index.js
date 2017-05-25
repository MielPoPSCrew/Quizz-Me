const router = require('express').Router();
const _      = require('lodash');
const population = require('../../../../utilities/population.js');


router.use('/create',require('./create'));

router.get('/:id', (req, res) => {
    let error   = {};
    DB.get('games').find({_id: req.params.id}).then((games) => {
        if (_.isEmpty(games)) {
            res.statusCode = 404;
            error.message = 'This game does not exist';
            res.json(error);
        } else {
            population.populateGamesWithQuiz(games, () => {
                res.json(games[0]);
            })
        }
    });
});

router.get('/', (req, res) => {

    DB.get('games').find({private:false, opened:true}).then((games) => {

        population.populateGamesWithQuiz(games, () => {
            res.json(games);
        });

    });
});

module.exports = router;