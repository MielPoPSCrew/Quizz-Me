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
    res.render('games/games');
});


module.exports = router;
