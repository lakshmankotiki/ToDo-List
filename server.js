const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const dateFormat = require(__dirname + '/date');
const app = express();


//mongodb connection
mongoose.connect("mongodb://localhost:27017/ToDoListDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
var db = mongoose.connection;
db.on('error', function(error) {
    console.log("connection error");
});
db.on('open', function() {
    console.log('successfully connected...!')
});

//creating schemas
const itemsSchema = {
    name: String
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: 'Go To Gym'
});

const item2 = new Item({
    name: 'Write Daily Jornal'
});

const item3 = new Item({
    name: 'Eat Healthy Food'
});

const items = [item1, item2, item3];

Item.insertMany(items, function(err, items) {
    if(err) {
        console.log("Issue in inserting documents into an todo collection")
    } else {
        console.log("successfully inserted items");
    }
});

//telling to the application to use ejs template
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//home route
app.get('/', function(req, res) {

    var finalItems = [];
    //getting the current date format from custom module
    const today = dateFormat();
    console.log("today is: ", today);

    Item.find(function(err, items) {
        if(err) {
            console.log("Issue in getting todo listitems");
        } else {
            items.forEach(function(item) {
                finalItems.push(item.name);
            })
            console.log("items are: ", finalItems);
            res.render('index', { listTitle: today, newToDoItem: finalItems, buttonValue: 'home' });
        }
    })
});

app.post('/', function(req, res) {
    const itemName = req.body.todoItem;
    console.log("work", req.body);
    console.log("buttonvalue: ", req.body.button);

    //pushing and redirecting depending on the button values
    if(req.body.button == "home") {
        // items.push(item);
        Item.save(itemName, function(err, item) {
            if(err) {
                console.log("Issue in creating toDo. Please contact developer...!");
            } else {
                console.log('Todo inserted successfully');
            }
        })
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