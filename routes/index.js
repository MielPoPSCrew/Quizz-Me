const router = require('express').Router();
const population = require('../utilities/population');

router.use('/games', require('./games'));

router.use('/quizz', require('./quizz'));

router.use('/api', require('./api'));


router.get('/', function(req, res) {

    let username = req.cookies.username;

    // retrieve current user stats
    DB.get('users').find({username}, {fields:{"_id": 0}}).then( (u) => {
        if (u.length !== 1){
            res.statusCode = 500;
            res.text("ERROR");
        }
        else{
            let user = u[0];

            // retrieves the most recent games and populates the field "quiz" by quiz info
            DB.get('games').find({opened: true, private: false}, {sort : { created : 1}}).then((games) => {

                population.populateGamesWithQuiz(games, () =>{
                    // retrieves the most recent quizz
                    DB.get('quiz').find({}, { created: 1, limit : 10, fields:{questions:0}}).then( (quiz) => {
                        population.populateQuizWithTopics(quiz, ()=>{
                            res.render('index', {user, games, quiz})
                        });
                    });
                });

            });


        }
    });
});

module.exports = router;
