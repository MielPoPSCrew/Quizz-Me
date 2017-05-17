// set execution mode
const MODE = "debug";

// base modules to import
const express = require('express');
const fs = require('fs');
const bodyparser = require('body-parser');
const nunjucks = require('nunjucks');

let app = express();

// setup MongoDB connection
global.DB = require('monk')('localhost/questions_game');

// import test scripts if we're in debug
if(MODE == 'debug'){
    let rock_script = JSON.parse(fs.readFileSync('samples/rock_sample.json','utf-8'));
    let rock_script_name = rock_script.name;

    DB.get('questions').find({name: rock_script_name}).then((script) => {
        if(script.length === 0){
            DB.get('questions').insert(rock_script);
        }
    }).catch(console.error);
}

nunjucks.configure('views', {express: app});
app.set('view engine', 'njk');
app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(express.static('public'));
app.use(require('./routes/'));

app.listen(8737);
