const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const dateFormat = require(__dirname + '/date');
const app = express();


//mongodb connection
mongoose.connect("mongodb://localhost:27017/ToDoListDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
var db = mongoose.connection;
db.on('error', function(error) {
    console.log("connection error");
});
db.on('open', function() {
    console.log('successfully connected...!');
});

//creating schemas
const itemsSchema = {
    name: String
};

const customListSchema = {
    name: String,
    items: [itemsSchema]
};

const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('Lists', customListSchema);

//creating default todo items
const item1 = new Item({
    name: 'Welcome to your todolist!'
});
const item2 = new Item({
    name: 'Hit the + button to add new item'
});
const item3 = new Item({
    name: '<-- Hit this to delete an item'
});
const defaultItems = [item1, item2, item3];

//telling to the application to use ejs template
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//home route
app.get('/', function(req, res) {

    Item.find(function(err, foundItems) {
        if (err) {
            console.log("Issue in getting todo listitems");
        } else {
            //adding default items when collection is empty
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems, function(err, items) {
                    if (err) {
                        console.log("Issue in inserting documents into an todo collection")
                    } else {
                        console.log("successfully inserted items");
                    }
                });
                res.redirect('/');
            } else {
                // console.log("foundItems are: ", foundItems);
                res.render('index', { listTitle: "Today", newToDoItem: foundItems });
            }
        }
    });
});

app.get('/:customListName', function(req, res) {
    debugger;
    var customListName = req.params.customListName;
    List.findOne({ name: customListName }, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                //create new list
                var createCustomList = new List({
                    name: customListName,
                    items: defaultItems
                });
                createCustomList.save();
                res.redirect('/' + customListName);
            } else {
                //show existed list
                console.log("exists:", foundList);
                res.render('list', { listTitle: customListName, newToDoItem: foundList.items });
            }
        }
    });
});

app.post('/', function(req, res) {
    debugger;
    const itemName = req.body.todoItem;
    const listTitle = req.body.listTitle;

    var createItem = new Item({
        name: itemName
    });
    if (listTitle === "Today") {
        createItem.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listTitle }, function(err, foundItems) {
            if (!err) {
                if (foundItems) {
                    foundItems.items.push(createItem);
                    foundItems.save();
                    res.redirect('/' + listTitle);
                }
            }
        });
    };
});

app.post('/delete', function(req, res) {
    const checkedItem = req.body.checkboxValue;
    // console.log("man:", req.body.checkboxValue);
    Item.findByIdAndRemove(checkedItem, function(err, item) {
        if (err) {
            console.log("Issue in deleting completed todo Item");
        } else {
            console.log('Your completed todo deleted successfully!');
            res.redirect('/')
        }
    })

})

app.get('/work', function(req, res) {
    res.render('index', { listTitle: 'Work ToDo List', newToDoItem: workItems, buttonValue: 'workList' });
});

app.post('/work', function(req, res) {
    console.log("work body", req.body.todoItem);
    const item = req.body.todoItem;
    workItems.push(item);
    res.redirect('/work');
});

app.get('/about', function(req, res) {
    res.render('about');
});

const port = 3000;
app.listen(port, function() {
    console.log(`application running on port: ${port}`);
});