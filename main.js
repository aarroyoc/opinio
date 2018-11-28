const PORT = 9999;
const express = require("express");
const db = require("./models/db");
const User = require("./models/user");
const Poll = require("./models/poll");
const Option = require("./models/option");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const uuid = require('uuid/v4');
let app = express();

app.set("view engine","ejs");
app.set("views","views");

app.use("/static",express.static("static"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(session({
    genid: (req) => {
      return uuid() // use UUIDs for session IDs
    },
    secret: 'lorem ipsum',
    resave: false,
    saveUninitialized: true
}));

let users = new Map();
let auth = (req,res,next) => {
    if(users.has(req.session.id)){
        next();
    }else{
        res.redirect("/error");
    }
};

app.get("/",async function(req,res){
    res.render("index",{date: new Date().toUTCString()});
});

app.post("/login",async function(req,res){
    console.log(req.body);
    let username = req.body.username;
    let password = req.body.password;
    User.findOne({where: {username: username}}).then((user)=>{
        if(user.password == password){
            users.set(req.session.id,username);
            res.redirect("/personal");
        }else{
            res.redirect("/");
        }
    })
    .catch(()=>{
        res.redirect("/");
    })
});

app.get("/register",async function(req,res){
    res.render("register");
});

app.post("/register",async function(req,res){
    let username = req.body.username;
    let password = req.body.password;
    await User.create({
        username: username,
        password: password
    });
    res.redirect("/");
});

app.get("/personal",auth,async function(req,res){
    let username = users.get(req.session.id);
    let polls = await Poll.findAll({
        where: {
            user_id: username
        }
    });
    res.render("personal",{polls: polls});
});

app.post("/poll",auth,async function(req,res){
    let username = users.get(req.session.id);
    await Poll.create({
        title: req.body.title,
        description: req.body.description,
        publicVote: req.body.publicVote === "on",
        user_id: username
    });
    res.redirect("/personal");
});

app.get("/poll/:id",async function(req,res){
    let poll = await Poll.findOne({
        where: {
            id: req.params.id
        },
        include: [
            {model: Option}
        ]
    });
    let options = await poll.getOptions();
    if(users.has(req.session.id)){
        let username = users.get(req.session.id);
        if(poll.user_id === username){
            res.render("poll",{owner: true,poll: poll, options: options});
        }else{
            res.render("poll",{owner: false,poll: poll, options: options});
        }
    }else{
        if(poll.publicVote){
            res.render("poll",{owner: false, poll: poll, options: options});
        }else{
            res.redirect("/error");
        }
    }
    
});

app.post("/option",auth,async function(req,res){
    let username = users.get(req.session.id);
    let text = req.body.text;
    let poll_id = req.body.poll_id;

    let poll = await Poll.findOne({
	where: {
        	id: poll_id
   	}
    });
    if(poll.user_id === username){
        await Option.create({
            text: text,
            poll_id: poll_id,
            votes: 0
        });
    }
    res.redirect("/poll/"+poll_id);
});

app.get("/vote/:poll_id/:option_id",async function(req,res){
    let poll = await Poll.findOne({
        where: {
            id: req.params.poll_id
        }
    });
    if(users.has(req.session.id) || poll.publicVote){
        let option = await Option.findOne({
            where: {
                id: req.params.option_id,
                poll_id: req.params.poll_id
            }
        });
        option.votes++;
        await option.save();

    }
    res.redirect("/poll/"+req.params.poll_id);
});

db.sync()
.then(function(){
    app.listen(PORT,function(){
        console.log("Opinio ha arrancado en el puerto "+PORT);
    });
})
