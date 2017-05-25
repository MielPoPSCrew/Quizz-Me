const router = require('express').Router();
const _ = require('lodash');
const monk = require('monk');

function populateQuiz(quizz, length, it, cb){
    if(it == length)
        cb();
    else  {
        DB.get('topics').find({_id: quizz[it].topic}).then((t) => {
            quizz[it].topic = {};
            quizz[it].topic.id = t[0]._id;
            quizz[it].topic.name = t[0].name;
            populateQuiz(quizz, length, it+1, cb);
        });
    }
}

function manageQueryCreation(params, keys, it, query, cb){
    if(it === keys.length)
        cb(query);
    else{
        console.log(keys[it]);
        switch(keys[it]){
            case "creator":
                query.creator = params["creator"];
                manageQueryCreation(params, keys, it+1, query,  cb);
                break;
            case "opened":
                query.opened = params["opened"];
                manageQueryCreation(params, keys, it+1, query,  cb);
                break;
            case "name":
                if(params["name"] !== "")
                    query.name = new RegExp(params["name"], "i");
                manageQueryCreation(params, keys, it+1, query,  cb);
                break;
            case "createdBefore":
                query.created = { $lt : params["createdBefore"]};
                manageQueryCreation(params, keys, it+1, query,  cb);
                break;
            case "createdAfter":
                if(query.created === undefined)
                    query.created = { $gt : params["createdAfter"]};
                else
                    query.created.$gt = params["createdAfter"];
                manageQueryCreation(params, keys, it+1, query,  cb);
                break;
            case "quizId":
                query.quiz = params["quizId"];
                manageQueryCreation(params, keys, it+1, query,  cb);
                break;
            case "quizName":
                DB.get('quiz').find({"name" : params["quizName"]}).then( (quizz) => {
                    query.quiz = { $in: []};
                    quizz.forEach((quiz) => {
                        query.quiz.$in.push(quiz._id);
                    });
                    manageQueryCreation(params, keys, it+1, query,  cb);
                });
                break;
            case "quizTopic":
                DB.get('quiz').find({"topic" : monk.id(params["quizTopic"])}).then( (quizz) => {
                    query.quiz = { $in: []};
                    quizz.forEach((quiz) => {
                        query.quiz.$in.push(quiz._id);
                    });
                    manageQueryCreation(params, keys, it+1, query,  cb);
                });
                break;
            default:
                console.log("lkc vbhsemlkje " + params[it]);
        }
    }

}

router.get('/game', (req, res) => {
    let query = {};

    let params = req.query;

    let keys = _.keys(params);

    manageQueryCreation(params, keys, 0, query, () => {
        console.log(query);
        DB.get('game').find(query).then( (resu) => {
            res.json(resu);
            res.status(200);
        });
    })
});


router.get('/quiz', (req, res) => {
    let query = {};

    let params = req.query;

    for(let param in params){
        switch(param){
            case "creator":
                query.creator = params["creator"];
                break;
            case "minQuestionNb":
                query.questions = { $size : { $gt : params["minQuestionNb"]}};
                break;
            case "maxQuestionNb":
                if(query.questions === undefined)
                    query.questions = { $size : { $lt : params["maxQuestionNb"]}};
                else
                    query.questions.size.$gt = params["maxQuestionNb"];
                break;
            case "name":
                if(params["name"] !== "")
                    query.name = new RegExp(params["name"], "i");
                break;
            case "createdBefore":
                query.created = { $lt : params["createdBefore"]};
                break;
            case "createdAfter":
                if(query.created === undefined)
                    query.created = { $gt : params["createdAfter"]};
                else
                    query.created.$gt = params["createdAfter"];
                break;
            case "topic":
                if(params["topic"] != -1)
                    query.topic = monk.id(params["topic"]);
                break;
        }
    }
    console.log(query);
    DB.get('quiz').find(query, {fields:{questions:0}}).then( (result) => {
        populateQuiz(result, result.length, 0, ()=>{
            res.json(result);
            res.status(200);
        });
    })
});

module.exports = router;