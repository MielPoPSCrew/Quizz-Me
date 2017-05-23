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

// import test scripts if we're in debug
if(MODE == 'debug'){
    let rock_script = JSON.parse(fs.readFileSync('samples/rock_sample.json','utf-8'));
    let rock_script_name = rock_script.name;

    DB.get('quiz').find({name: rock_script_name}).then((script) => {
        if(script.length === 0){
            DB.get('quiz').insert(rock_script);
        }
    }).catch(console.error);
}
/**
 * Set the user ID or renew it via cookie
 */
app.use((req, res, next) => {
    const hashids = new Hashids();
    let username;

    if (_.isEmpty(req.cookies) || _.isEmpty(req.cookies.username)) {
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
app.use(express.static('public'));
app.use(require('./routes'));

app.listen(8737);