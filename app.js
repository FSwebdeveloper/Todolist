//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://fswebdeveloper:fswebdeveloper247@cluster0.mlikrlt.mongodb.net/todolistDB');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const itemsSchema = {
 name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name:"Hit the + add the new item."
});

const item3 = new Item ({
  name: "Check to the delete item."
});

const defaultItems = [item1, item2, item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({})
  .then(function(foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems)
      .then(function(){
        console.log("Save items to todolistDB");
      })
      .catch(function(err) {
       console.log(err)
      });
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  })
  .catch(function(err){
    console.log(err)
  });

  

});


app.get("/:customeListName", function(req, res){
  const customeListName = _.capitalize(req.params.customeListName);

  List.findOne({name:customeListName})
  .then(function(foundList){
    if(!foundList){
      const list = new List ({
        name : customeListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customeListName);
    } else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch(function(err){
    console.log(err);
  });

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item ({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name:listName})
    .then(function(foundList){
     foundList.items.push(item);
     foundList.save();
     res.redirect("/" + listName);
    })
    .catch(function(err){
    console.log(err);
    });
  }
  
  
  

});

app.post("/delete", function(req, res){
 const checkedItemId = req.body.checkbox;
 const listName = req.body.listName;

 if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId)
  .then(function(){
    console.log("Succesfully delete checked item");
  })
  .catch(function(err){
    console.log(err);
  });
  res.redirect("/");
 } else {
   List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}})
   .then(function (foundList){
    res.redirect("/" + listName);
   })
   .catch(function(err){
    console.log(err);
   });

 }



});


app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
