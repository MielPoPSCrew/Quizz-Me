const router = require('express').Router();

router.use('/games', require('./games'));

router.use('/api', require('./api'));

function populate(games, length, it, cb){
    if(it == length)
        cb();
    else  {
        DB.get('quiz').find({_id: games[it].quiz}).then((q) => {
            games[it].quiz = {};
            games[it].quiz.id = q[0]._id;
            games[it].quiz.name = q[0].name;
            games[it].quiz.topic = q[0].topic;
            populate(games, length, it+1, cb);
        });
    }
}

router.get('/', function(req, res) {

    let username = req.cookies.username;

    // retrieve current user stats
    DB.get('users').find({username}, {fields:{"_id": 0}}).then( (u) => {
        if(u.length !== 1)
            res.status(500);
        else{
            let user = u[0];

            // retrieves the most recent games and populates the field "quiz" by quiz info
            DB.get('games').find({opened: true, private: false}, {sort : { created : 1}}).then((games) => {

                populate(games, games.length, 0, () =>{
                    console.log(games[0]);
                    // retrieves the most recent quizz
                    DB.get('quiz').find({}, { created: 1, limit : 10}).then( (quiz) => {
                        res.render('index', {user, games, quiz})
                    });
                });

            });


        }
    });
});

module.exports = router;
