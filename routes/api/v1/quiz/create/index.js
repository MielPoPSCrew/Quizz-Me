const router = require('express').Router();
const _ = require('lodash');
const monk = require('monk');

// check if the quiz is well formed. Returns an error code if not.
function checkQuizIntegrity(quiz){

    let error = {};
    error.fields = [];

    // check if name exist and contains something
    if(quiz.name === undefined || quiz.name === "")
        error.fields.push('name');

    // check if topic exist and is valid
    if(_.isEmpty(quiz.topic)){
        error.fields.push('topic');
    }
    else{
        quiz.topic = monk.id(quiz.topic);
        DB.get('topics').find({_id:quiz.topic}).then( (r) => {
           if(_.isEmpty(r))
               error.fields.push('topic');
        });
    }

    // check if the quiz contains an array of questions
    if(_.isEmpty(quiz.questions) || quiz.questions.length === 0)
        error.fields.push('questions');

    // check if each question is well formed
    let questionNb = 0;
    error.questions = [];
    quiz.questions.forEach( (question) => {

        let questionError = {};
        questionError.questionId = questionNb;
        questionError.fields = [];

        if(question.question === undefined || question.question === ""){
            questionError.fields.push('question');
        }
        if(_.isEmpty(question.choices) || question.choices.length != 3 ){
            questionError.fields.push('choices');
        }
        question.choices.forEach( (choice) => {
            if(choice === ""){
                questionError.fields.push('choices');
            }
        });
        if(question.answer === undefined || question.answer < 0 || question.answer > 2){
            console.log(_.isEmpty(question.answer));
            questionError.fields.push('answer');
        }

        if(questionError.fields.length != 0){
            error.fields.push('questions');
            error.questions.push(questionError);
        }
        questionNb ++;
    });
    return error;
}

router.post('/', (req, res) => {
    let data = req.body;
    console.log(data);
    if(data == undefined){
        res.status(400);
        res.json({"error":"No data passed"});
    }
    else {
        let error = checkQuizIntegrity(data);
        if(error.fields.length != 0){
            console.log('error');
            res.status(400);
            res.json(error);
        }
        else{
            DB.get('quiz').insert(data).then( (result) => {
                res.json({success: result._id});
            });
        }
    }
});

module.exports = router;