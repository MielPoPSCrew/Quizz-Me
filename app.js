const express = require('express');
const fs = require('fs');

var app = express();

global.DB = require('monk')('localhost/questions_game');

DB.get('questions').insert({'test':'test'});


app.listen(8737);
