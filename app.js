const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require('mongoose');
//set up for ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}));

app.use(express.static("public"));

//list.ejs
app.get("/", function(req , res){
  var today = new Date();
  var dayOfWeek = today.getDay();//sunday - saturday (0-6)
  var day = "";
  //determining which day it is...

  if(dayOfWeek === 0){
    day ="Sunday";
  }else if(dayOfWeek === 1){
    day ="Monday";
  }else if(dayOfWeek === 2){
    day ="Tuesday";
  }else if(dayOfWeek === 3){
    day ="Wednesday";
  }else if(dayOfWeek === 4){
    day ="Thusday";
  }else if(dayOfWeek === 5){
    day ="Friday";
  }else{
    day ="Saturday";
  }

  //key-value pair... key nameOfDay is present in list.ejs and  value day is the variable in app.js file
  res.render("list", { nameOfDay : day } );
});

//list2.ejs
//two different templates

//var items=["Gaurab","Pradipta","Swagato"];

var workDone=[];

mongoose.connect('mongodb+srv://Admin-Gaurab:gaurab12345@cluster0-lx6tu.mongodb.net/toDoListDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = new mongoose.Schema({
  name: {
    type : String,
    required: true
  }
});




const Item = mongoose.model("Item", itemSchema);

var Gaurab = new Item({
  name: "Gaurab"
});

var Pradipta = new Item({
  name: "Pradipta"
});

var Swagato = new Item({
  name: "Swagato"
});

var itemsList1 = [Gaurab, Pradipta, Swagato];

var itemsList=[];
app.get("/list2" ,function(req,res){
  itemsList=[];
  var today1 = new Date();
  var options ={
    weekday : "long",
     day : "numeric",
     month : "long"
  }
  var day1 = today1.toLocaleDateString("en-US",options);

  Item.find({},function(err,docs){
    if(err){
      console.log(err);
    }else{
      if(docs.length === 0){
        Item.insertMany(itemsList1, function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Inserted Successfully");
          }
        });
        res.redirect("/list2");
      }else{
        docs.forEach(function(element){
          itemsList.push(element.name);
        });
        res.render("list2" , { templateHeader: day1 , listOfItems : itemsList});
      }
}
});
});


app.post("/list2",function(req,res){
  var input = req.body.inputitem;
  var requestedPage = req.body.list;
//checkig from which template the request is comming   work or date
  if(req.body.list === "Work"){
    workDone.push(input);
    res.redirect("/work");
  }else if(req.body.list === "school"){
      Subject.findOne({name : input}, function(err, docs){
        if(!err){
          if(!docs){
            var newSubject = new Subject({
              name: input
            });
            newSubject.save();

            res.redirect("/" + requestedPage);
          }else{
            res.redirect("/" + requestedPage);
          }
        }
      });
  }else{
  var newItem = new Item({
    name: input
  });
    newItem.save();
    res.redirect("/list2");
  }
});



//delete checked items from list2.js

app.post("/delete",function(req, res){
  var checkedItemName = req.body.checkbox;
  var index=0;
  workDone.forEach(function(element){
    if(element === checkedItemName){
      index++;

    }
  });
  if(index>0){
    workDone.pop(checkedItemName);
    res.redirect("/work");
  }else{
    Item.deleteOne({name: checkedItemName}, function(err){
      if(err){
        console.log(err);
      }else{
        res.redirect("/list2");
      }
    });
  }

});

// different template
app.get("/work",function(req, res){
  res.render("list2" , { templateHeader: "Work To Done" , listOfItems : workDone});
});


// different Layouts
app.get("/about", function(req, res){
  res.render("about");
});


const schoolsubjectSchema = new mongoose.Schema({
  name: {
    type : String,
    required: true
  }
});


const Subject = mongoose.model("subject", schoolsubjectSchema);
var Maths = new Subject({
  name: "Maths"
});

var Physics = new Subject({
  name: "Physics"
});
var Chemistry = new Subject({
  name: "Chemistry"
});
var subjectList = [Maths, Physics, Chemistry];

// Subject.insertMany(subjectList, function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Inserted Successfully");
//   }
// });
//different Schema
const schoolSchema = new mongoose.Schema({
  name: String,
  items : [schoolsubjectSchema]
});
//different collection lists
const List = mongoose.model("List", schoolSchema);




//express route params
app.get("/:customeListName", function(req,res){
  var customeListName = req.params.customeListName;


  List.findOne({name: customeListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        //create new list
        var list = new List({
          name : customeListName,
          items : subjectList
        });


        list.save();
        res.redirect("/" + customeListName);
      }else{
          //show an existing list

          res.render("list2", {templateHeader: foundList.name  , listOfItems : foundList.items});
      }
    }
  });

});





app.listen(process.env.PORT ||3500 , function(){
  console.log("Port  is listening successfully");
});
