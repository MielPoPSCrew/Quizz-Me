const router = require('express').Router();
const population = require('../../utilities/population');

router.get('/', function(req, res) {
    DB.get('quiz').find({},{fields:{questions:0}}).then( (quiz) => {
        population.populateQuizWithTopics(quiz, () =>{
            DB.get('topics').find({}).then( (topics) =>{
                topics.unshift({_id:-1, name: "Tous"});
                res.render('quizz/list', {quiz, topics});
            });
        });
    });
});

router.get('/create', function(req, res, next) {
    DB.get('topics').find({}).then( (topics) => {
        res.render('quizz/create', {topics});
    });
});

module.exports = router;
