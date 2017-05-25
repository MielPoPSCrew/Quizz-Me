const router = require('express').Router();
const population = require('../../utilities/population');

router.get('/', function(req, res, next) {
    DB.get('games').find({opened: true, private: false}, {sort : { created : 1}}).then((games) => {
        population.populateGamesWithQuiz(games,  () => {
            DB.get('topics').find({}).then((topics)=>{
                topics.unshift({_id:-1, name: "Tous"});
                res.render('games/join', {games, topics});
            });
        });
    });
});

router.get('/create', function(req, res) {
    let quizId = req.query.quiz ;

    // Retrieved information on selected quiz
    DB.get('quiz').findOne({_id: quizId}).then((quizResult) => {
        let selected_quiz;
        if (quizResult && quizResult.length !== 0) {
            selected_quiz = {
                _id : quizResult._id,
                name : quizResult.name
            }
        }

        // Retrieved existing quizz
        DB.get('quiz').find({},{fields:{questions:0}}).then( (quiz) => {
            population.populateQuizWithTopics(quiz, () =>{
                DB.get('topics').find({}).then( (topics) =>{
                    topics.unshift({_id:-1, name: "Tous"});
                    res.render('games/create', {quizz:quiz, topics, selected_quiz});
                });
            });
        });
    });
});

router.get('/:id', function(req, res, next) {
    console.log
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        DB.get('games').findOne({_id: req.params.id}).then( (gameInfo) => {
            if (!gameInfo || gameInfo.length === 0) {
                res.render('error', {error:"Cette partie " + req.params.id + " n'existe pas."})
            } else if(!gameInfo.opened) {
                res.render('error', {error:"Cette partie n'est pas ouverte ou est terminée."})
            } else {
                DB.get('users').findOne({_id:gameInfo.creator}).then( (creatorInfo) => {
                    console.log("creator=" + creatorInfo);
                    console.log(creatorInfo);
                    res.render('games/games', { username: req.cookies.username, creator: creatorInfo.username });
                });
            }
        });

    } else {
        res.render('error', {error:"Cette partie n'existe pas."})
    }

});



// Todo : supprimer (test socket)
router.get('/test/socket', function(req, res, next) {
    res.render('test_socket');
});

module.exports = router;
