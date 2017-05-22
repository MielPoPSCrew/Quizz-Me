const router = require('express').Router();

router.get('/', (req, res) => {

    // retrieve the list of available quiz
    DB.get('quiz').find().then((rawQuizz) => {

        let quizz = [];

        //foreach quiz we extract usefull information
        rawQuizz.forEach((rawQuiz) => {
            quizz.push({id: rawQuiz._id, name: rawQuiz.name});
        });

        res.json(quizz);
    });

});

module.exports = router;