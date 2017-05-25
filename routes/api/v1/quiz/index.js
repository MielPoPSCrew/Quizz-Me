const router = require('express').Router();
const population = require('../../../../utilities/population.js');

router.use('/create',require('./create'));

router.get('/', (req, res) => {

    // retrieve the list of available quiz
    DB.get('quiz').find({},{fields:{questions:0}}).then((quiz) => {

        population.populateQuizWithTopics(quiz, () => {
            res.json(quiz);
        });
    });

});

module.exports = router;