const router = require('express').Router();

router.use('/games', require('./games'));

router.use('/api', require('./api'));

router.get('/', function(req, res) {

    let username = req.cookies.username;

    // retrieve current user stats
    DB.get('users').find({username}, {fields:{"_id": 0}}).then( (u) => {
        if(u.length !== 1)
            res.status(500);
        else{
            let user = u[0];

            // retrieves the most recent games and populates the field "quiz" by quiz info
            DB.get('games').find({status: 'oppened'}, {fields:{_id: 0}, sort : { creation : 1}}).then( (games) => {
                games.forEach((game) => {
                    DB.get('quiz').find({_id:game.quiz}).then( (q) => {
                        game.quiz = {};
                        game.quiz.id = q._id;
                        game.quiz.name = q.name;
                        game.quiz.topic = q.topic;
                    });
                });

                // retrieves the most recent quizz
                DB.get('quiz').find({}, { creation: 1, limit : 10}).then( (quiz) => {
                    res.render('index', {user, games, quiz})
                });

            });

        }
    });
});

module.exports = router;
