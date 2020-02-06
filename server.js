var express = require('express');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var app = express();

var items = [];
//telling to the application to use ejs template
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

//home route
app.get('/', function(req, res) {
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    var language = process.LANG;
    var currDate = new Date();
    var today = currDate.toLocaleDateString(language, options);
    console.log("today:", today);
    res.render('index', { day: today, newToDoItem: items });
});

app.post('/', function(req, res) {
    var item = req.body.todoItem;
    items.push(item);
    // res.render('index', { newToDoItem: item });
    res.redirect('/');
});

var port = 3000;
app.listen(port, function() {
    console.log(`application running on port: ${port}`);
});