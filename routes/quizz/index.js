const router = require('express').Router();

router.get('/', function(req, res) {
    DB.get('quiz').find({}).then( (quiz) => {
        DB.get('topics').find({}).then( (topics) =>{
            topics.unshift({_id:-1, name: "Tous"});
            res.render('quizz/list', {quiz, topics});
        })
    });
});

router.get('/create', function(req, res, next) {
    res.render('quizz/create');
});

module.exports = router;
