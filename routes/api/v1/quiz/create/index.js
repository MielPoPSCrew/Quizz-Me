const router = require('express').Router();
const _ = require('lodash');

// check if the quiz is well formed. Returns an error code if not.
function checkQuizIntegrity(quiz){

    let error = {};
    error.fields = [];

    // check if name exist and contains something
    if(_.isEmpty(quiz.name))
        error.fields.push('name');

    // check if theme exist and is valid
    if(_.isEmpty(quiz.theme)){
        error.fields.push('theme');
    }
    else{
        DB.get('themes').find({"name":quiz.theme}).then( (r) => {
           if(_.isEmpty(r))
               error.fields.push('theme');
        });
    }

    // check if the quiz contains a creation date (timestamp)
    if(_.isEmpty(quiz.created))
        error.fields.push('creation_date');

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

        if(_.isEmpty(question.question)){
            questionError.fields.push('question');
        }
        if(_.isEmpty(question.choices) || question.choices.length != 3 ){
            questionError.fields.push('choices');
        }
        question.choices.forEach( (choice) => {
            if(_.isEmpty(choice)){
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
    console.log(req.body);
    if(req.body == undefined){
        res.status(400);
        res.json({"error":"No data passed"});
    }
    else {
        let error = checkQuizIntegrity(req.body);
        if(error.fields.length != 0){
            console.log('error');
            res.status(400);
            res.json(error);
        }
        else{
            DB.get('quiz').insert(req.body, (err, res) => {
                // TODO will we do something with the id ?
            });
            res.redirect('/quiz');
        }
    }
});

module.exports = router;