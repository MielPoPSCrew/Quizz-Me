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
let topics = ["Musique", "Cinéma", "Sciences / Technologies", "Littérature", "Culture Générale"];
topics.forEach( (topic) => {
    DB.get('topics').find({'name': topic}).then( (t) => {
        if(_.isEmpty(t))
            DB.get('topics').insert({"name": topic});
    })
});

// import test scripts if we're in debug
if(MODE == 'debug'){

}

/**
 * Set the user ID or renew it via cookie
 */
app.use((req, res, next) => {
    const hashids = new Hashids();
    let username;
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
                }).then((u)=>{

                    req.cookies.username = username;
                    res.cookie('username', username, { maxAge: 60 * 60 * 24 * 7 * 1000, httpOnly: true }); // One week time expiration
                    next();

                });
            }
        });
    } else {
        username = req.cookies.username;
        res.cookie('username', username, { maxAge: 60 * 60 * 24 * 7 * 1000, httpOnly: true }); // One week time expiration

        next();
    }


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

let server = require('http').Server(app);
let io = require('socket.io')(server);
require(__dirname + '/sockets/games/join')(io);

server.listen(8737);