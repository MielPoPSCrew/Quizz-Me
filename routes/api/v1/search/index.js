const router = require('express').Router();
const _ = require('lodash');

router.get('/game', (req, res) => {
    let query = {};

    let params = req.query;

    for(let param in params){
        switch(param){
            case "creator":
                query.creator = params[creator];
                break;
            case "opened":
                query.opened = params[opened];
                break;
            case "name":
                query.name = params[name];
                break;
            case "createdBefore":
                query.created = { $lt : params[createdBefore]};
                break;
            case "createdAfter":
                if(query.created === undefined)
                    query.created = { $gt : params[createdAfter]};
                else
                    query.created.$gt = params[createdAfter];
                break;
            case "quizId":
                query.quiz = params[quizId];
                break;
            case "quizName":
                DB.get('quiz').find({"name" : params[quizName]}).then( (quizz) => {
                    query.quiz = { $in: []};
                    quizz.forEach((quiz) => {
                        query.quiz.$in.push(quiz._id);
                    });
                });
                break;
            case "quizTopic":
                DB.get('quiz').find({"theme" : params[quizTopic]}).then( (quizz) => {
                    query.quiz = { $in: []};
                    quizz.forEach((quiz) => {
                        query.quiz.$in.push(quiz._id);
                    });
                });
        }
    }
    DB.get('game').find(query, {'_id':false}).then( (res) => {
        res.json(res);
        res.status(200);
    })
});


router.get('/quiz', (req, res) => {
    let query = {};

    let params = req.query;

    for(let param in params){
        switch(param){
            case "creator":
                query.creator = params[creator];
                break;
            case "minQuestionNb":
                query.questions = { $size : { $gt : params[minQuestionNb]}};
                break;
            case "maxQuestionNb":
                if(query.questions === undefined)
                    query.questions = { $size : { $lt : params[maxQuestionNb]}};
                else
                    query.questions.size.$gt = params[maxQuestionNb];
                break;
            case "name":
                query.name = params[name];
                break;
            case "createdBefore":
                query.created = { $lt : params[createdBefore]};
                break;
            case "createdAfter":
                if(query.created === undefined)
                    query.created = { $gt : params[createdAfter]};
                else
                    query.created.$gt = params[createdAfter];
                break;
            case "topic":
                query.topic = topic;
                break;
        }
    }
    DB.get('quiz').find(query, {'_id':false}).then( (res) => {
        res.json(res);
        res.status(200);
    })
});

module.exports = router;