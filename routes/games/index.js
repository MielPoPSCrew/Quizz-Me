const router = require('express').Router();

function populateQuiz(quiz, length, it, cb){
    if(it == length)
        cb();
    else  {
        DB.get('topics').find({_id: quiz[it].topic}).then((t) => {
            quiz[it].topic = {};
            quiz[it].topic.id = t[0]._id;
            quiz[it].topic.name = t[0].name;
            populateQuiz(quiz, length, it+1, cb);
        });
    }
}

router.get('/', function(req, res, next) {
    res.render('games/join');
});

router.get('/create', function(req, res) {
    DB.get('quiz').find({},{fields:{questions:0}}).then( (quiz) => {
        populateQuiz(quiz, quiz.length, 0, () =>{
            DB.get('topics').find({}).then( (topics) =>{
                topics.unshift({_id:-1, name: "Tous"});
                res.render('games/create', {quizz:quiz, topics});
            });
        });
    });
});

/*
 * Get the list of available games
 */
router.get('/:id', function(req, res, next) {
    res.render('games/games');
});



module.exports = router;
