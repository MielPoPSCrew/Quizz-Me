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

function populateGame(games, length, it, cb){
    if(it == length)
        cb();
    else  {
        DB.get('quiz').find({_id: games[it].quiz}).then((q) => {
            games[it].quiz = {};
            games[it].quiz.id = q[0]._id;
            games[it].quiz.name = q[0].name;
            games[it].quiz.topic = q[0].topic;
            DB.get('topics').find({_id: q[0].topic}).then( (t) =>{
                games[it].quiz.topic = t[0].name;
                populateGame(games, length, it+1, cb);
            })
        });
    }
}


router.get('/', function(req, res, next) {
    DB.get('games').find({opened: true, private: false}, {sort : { created : 1}}).then((games) => {
        populateGame(games, games.length, 0, () => {
            DB.get('topics').find({}).then((topics)=>{
                topics.unshift({_id:-1, name: "Tous"});
                res.render('games/join', {games, topics});
            });
        });
    });
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



// Todo : supprimer (test socket)
router.get('/test/socket', function(req, res, next) {
    res.render('test_socket');
});

module.exports = router;
