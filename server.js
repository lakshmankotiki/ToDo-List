const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const dateFormat = require(__dirname + '/date');
const app = express();

//values which were added by the user will be pushed to these arrays
const items = ['Go To Gym', 'Write Dialy Journal'];
const workItems = [];

//telling to the application to use ejs template
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//home route
app.get('/', function(req, res) {

    //getting the current date format from custom module
    const today = dateFormat();
    console.log("today is: ", today);
    res.render('index', { listTitle: today, newToDoItem: items, buttonValue: 'home' });
});

app.post('/', function(req, res) {
    const item = req.body.todoItem;
    console.log("work", req.body);
    console.log("buttonvalue: ", req.body.button);

    //pushing and redirecting depending on the button values
    if(req.body.button == "home") {
        items.push(item);
        res.redirect('/');
    } else {
        workItems.push(item);
        res.redirect('/work');
    }
});

app.get('/work', function(req,res) {
    res.render('index', { listTitle: 'Work ToDo List', newToDoItem: workItems, buttonValue: 'workList'});
});

app.post('/work', function(req,res) {
    console.log("work body", req.body.todoItem);
    const item = req.body.todoItem;
    workItems.push(item);
    res.redirect('/work');
});

app.get('/about', function(req,res) {
    res.render('about');
})

const port = 3000;
app.listen(port, function() {
    console.log(`application running on port: ${port}`);
});