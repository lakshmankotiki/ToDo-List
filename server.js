const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const ejs = require('ejs');
const app = express();


//mongodb connection
mongoose.connect("mongodb+srv://admin-lakshman:Test123@cluster0-wlysr.mongodb.net/ToDoListDB", {
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
    //getting items from items schema to custom list schema
    items: [itemsSchema]
};

const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('Lists', customListSchema);

//creating default todo items for home and custom list
const item1 = new Item({
    name: 'Welcome to your todolist!'
});
const item2 = new Item({
    name: 'Hit the + button to add new item'
});
const item3 = new Item({
    name: '<-- Hit this to delete an item'
});
const item4 = new Item({
    name: 'Go to gym.'
});
const defaultItems = [item1, item2, item3, item4];

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
            //adding default todo items when items collection is empty
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
                res.render('index', { listTitle: "Today", newToDoItem: foundItems });
            }
        }
    });
});

//creating custom list collection whatever the user wants
app.get('/:customListName', function(req, res) {
    //using lodash function to capitilize the first letter to avoid duplicates
    var customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function(err, foundList) {
        if (!err) {
            //if list is not found then only create the new one
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
                res.render('list', { listTitle: customListName, newToDoItem: foundList.items });
            }
        }
    });
});

//adding items to the todo list based on list title name
app.post('/', function(req, res) {
    const itemName = req.body.todoItem;
    const listTitle = req.body.listTitle;

    var createItem = new Item({
        name: itemName
    });
    //if list title is today then it's an home route
    if (listTitle === "Today") {
        createItem.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listTitle }, function(err, foundItems) {
            if (!err) {
                //if existed list is found then push new todo item and save
                if (foundItems) {
                    foundItems.items.push(createItem);
                    foundItems.save();
                    //redirects to custom list page
                    res.redirect('/' + listTitle);
                }
            }
        });
    };
});

app.post('/delete', function(req, res) {
    debugger;
    const checkedItem = req.body.checkboxValue;
    const listItemName = req.body.listTitle;
    //delete the todo item based on list title either its a home or custom list
    if(listItemName === "Today") {
        Item.findByIdAndRemove(checkedItem, function(err, item) {
            if (err) {
                console.log("Issue in deleting completed todo Item");
            } else {
                console.log('Your completed todo deleted successfully!');
                res.redirect('/');
            }
        });
    } else {
        //if it's a list cllection then loop through the array of items using pull op
        List.findOneAndUpdate(
            {name: listItemName},
            {$pull: {items: {_id: checkedItem}}}, function(err, foundItem) {
                if(!err) {
                    console.log("item deleted succssfully");
                    res.redirect('/' + listItemName);
                }
            }
        );
    }

});

app.get('/about', function(req, res) {
    res.render('about');
});

//environment variables, because our application must listen on the specific port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
    console.log(`application running on port: ${port}`);
});