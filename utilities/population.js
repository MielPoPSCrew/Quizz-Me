/**
 *
 * This file includes functions used in order to populate fields returned by queries in the database
 *
 */

populateQuizWithTopics = function(quiz, callback){

    function privatePopulateQuizWithTopics(quiz, it, callback){
        if(it === quiz.length)
            callback();
        else  {
            DB.get('topics').find({_id: quiz[it].topic}).then((t) => {
                quiz[it].topic = {};
                quiz[it].topic.id = t[0]._id;
                quiz[it].topic.name = t[0].name;
                privatePopulateQuizWithTopics(quiz, it+1, callback);
            });
        }
    }

    privatePopulateQuizWithTopics(quiz, 0, callback);

};



populateGamesWithQuiz = function(games, callback){

    function privatePopulateGamesWithQuizTopics(games, it, callback){
        if(it === games.length) {
            callback();
        }
        else  {
            DB.get('quiz').find({_id: games[it].quiz}, {fields:{questions:0}}).then((q) => {
                if(q.length != 1){
                    throw new Error("Error in populateGamesWithQuizTopics : number of results for first query != 1");
                }
                else{
                    populateQuizWithTopics(q, ()=> {
                        games[it].quiz = q[0];
                        privatePopulateGamesWithQuizTopics(games, it+1, callback)
                    });
                }
            });
        }
    }

    privatePopulateGamesWithQuizTopics(games, 0, callback);

};


module.exports = {populateQuizWithTopics, populateGamesWithQuiz};