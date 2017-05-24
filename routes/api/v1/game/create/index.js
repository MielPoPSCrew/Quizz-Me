const router  = require('express').Router();
const _       = require('lodash');
const   monk  = require('monk');

function checkField(field, message, error){
    if(_.isEmpty(field)){
        error.push(message);
        return false;
    }
    return true;
}

router.post('/', (req, res) => {

    let error = {messages: []};
    let success;

    let data = req.body;

    let allOk = true;

    allOk &= checkField(data.name, "No name specified", error.messages);
    allOk &= checkField(data.quiz_id, "No quiz specified", error.messages);
    allOk &= checkField(data.is_private, "No privacy specified", error.messages);

    if (data.nb_max_user === undefined || data.nb_max_user < -1) {
        data.nb_max_user = -1;
    }

    if (!allOk) {
        res.statusCode = 400;
        res.json(error);
    }
    else {
        DB.get('quiz').find({_id: data.quiz_id}).then((quiz) => {
            if (quiz.length === 0) {
                error.messages.push("Quiz does not exist");
                res.json(error);
            } else {
                let game = {
                    name: data.name,
                    max_player: data.nb_max_user,
                    private: data.is_private === 'true',
                    opened: true,
                    quiz: req.body.quiz_id,
                    users: [],
                    creator: req.cookies.username
                };

                DB.get('games').insert(game).then((game_created) => {
                    success = game_created._id;
                    res.json(success);
                }).catch(console.error);
            }
        })
    }
});

module.exports = router;