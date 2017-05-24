// base modules to import
const MODE         = 'debug',
      express      = require('express'),
      fs           = require('fs'),
      bodyparser   = require('body-parser'),
      nunjucks     = require('nunjucks'),
      cookieParser = require('cookie-parser'),
      Hashids      = require('hashids'),
      _            = require('lodash');

let app = express();

app.use(cookieParser());

// setup MongoDB connection
global.DB = require('monk')('localhost/quizme');

// import default topics if they aren't in database
let topics = ["Musique", "Cinéma", "Sciences / Technologies", "Litérature", "Culture Générale"];
topics.forEach( (topic) => {
    DB.get('topics').find({'name': topic}).then( (t) => {
        if(_.isEmpty(t))
            DB.get('topics').insert({"name": topic});
    })
});

// import test scripts if we're in debug
if(MODE == 'debug'){

    // Remove previous fake data
    DB.get('games').remove({name:/Fake game/});
    DB.get('quiz').remove({name:/Fake quiz/});

    // Insert fake data
    let fake_users = ["fake_123456","fake_789456", "fake_456123", "fake_456789", "fake_789123", "fake_123789"];
    let fake_question = { question: "Where is the correct answer?", choices: ["Here", "I don't know", "I've got an idea, but can't say it..."], answer: 0};

    let number_quiz_to_generate = 7;
    for(let quizNb = 0; quizNb < number_quiz_to_generate; quizNb++){
        DB.get('quiz').insert({name:"Fake quiz #"+quizNb, created:Date.now().valueOf(), topic:"Culture Générale", questions:[fake_question]});
    }

    let number_games_to_generate = 5;
    for(let gameNb = 0; gameNb < number_games_to_generate; gameNb++){
        DB.get('quiz').find({name:"Fake quiz #"+Date.now().valueOf() % number_quiz_to_generate}).then( (q) => {
            if (q.length != 1){
                console.log(q);
                console.log("THERE WAS AN ISSUE WHILE GENERATING SAMPLE DATA. ABORTING.");
                process.exit(1);
            }
            else{
                let q_id = q[0]._id;
                let game_creator = fake_users[Date.now().valueOf() % fake_users.length];

                DB.get('games').insert({name:"Fake game #"+gameNb, creator: game_creator, created: Date.now().valueOf(), quiz: q_id, users: [], max_player: -1, nb_players: 0, opened: true, private: false});
            }
        });
    }

}

/**
 * Set the user ID or renew it via cookie
 */
app.use((req, res, next) => {
    const hashids = new Hashids();
    let username;
    console.log(req.cookies.username);
    if (_.isEmpty(req.cookies) || req.cookies.username === undefined) {
        username = 'guest_' + hashids.encode(Date.now().valueOf());

        DB.get('users').find({username}).then((user) => {
            if (_.isEmpty(user)) {
                DB.get('users').insert({
                   username,
                   "created": Date.now().valueOf(),
                   "statistics": {
                       "gamesTotal": 0,
                       "gamesWon": 0,
                       "goodAnswers": 0,
                       "quickAnswers": 0
                   }
                });
            }
        });
        req.cookies.username = username;
    } else {
        username = req.cookies.username;
    }

    res.cookie('username', username, { maxAge: 60 * 60 * 24 * 7 * 1000, httpOnly: true }); // One week time expiration

    next();
});

nunjucks.configure('views', {express: app});
app.set('view engine', 'njk');
app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(bodyparser.json({
    type: 'application/json'
}));
app.use(express.static('public'));
app.use(require('./routes'));

app.listen(8737);