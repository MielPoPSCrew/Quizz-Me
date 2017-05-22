const router = require('express').Router();

router.post('/', (req, res) => {

    let error = {};

    // validation on creator
    if(!req.query.creator_name){
        res.statusCode = 400;
        error.message = 'creator_name is missing or empty';
        res.json(error);
        return;
    }

    // validation on quiz
    if(!req.query.quiz_name){
        res.statusCode = 400;
        error.message = 'quiz_name is missing or empty';
        res.json(error);
        return;
    }

    // validation on is private
    if(!req.query.is_private){
        res.statusCode = 400;
        error.message = 'is_private is missing or empty';
        res.json(error);
        return;
    }

    // validation on is private
    if(!req.query.nb_max_user){
        res.statusCode = 400;
        error.message = 'nb_max_user is missing or empty';
        res.json(error);
        return;
    }

    // creator exists ?
    DB.get('user').find({username: req.query.creator_name}).then((creator) => {
        if(creator.length === 0) {
            res.statusCode = 400;
            error.message = "creator_name does not exist";
            res.json(error);
            return;
        }
    }).catch(console.error);

    // quiz exists ?
    DB.get('quiz').find({name: req.query.quiz_name}).then((quiz) => {
        if(quiz.length === 0) {
            res.statusCode = 400;
            error.message = "quiz_name does not exist";
            res.json(error);
            return;
        }
    }).catch(console.error);

    /*DB.get('user').find({name: rock_script_name}).then((script) => {
        if(script.length === 0){
            DB.get('quiz').insert(rock_script);
        }
    }).catch(console.error);*/



    // retrieve the list of available quiz
    /*DB.get('quiz').find().then((rawQuizz) => {

        let game = [];

        //foreach quiz we extract usefull information
        rawQuizz.forEach((rawQuiz) => {
            quizz.push({id: rawQuiz._id, name: rawQuiz.name});
        });

        res.json(quizz);
    });*/

    //res.json('toto');

});

module.exports = router;