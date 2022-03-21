const express = require("express")
const session = require("express-session")
const fs = require("fs");
const bodyparser = require("body-parser")
const bcrypt = require("bcrypt");
const { application } = require("express");

const app = express()

let loggedInUser = null
const oneDay = 1000 * 60 * 60 * 24;

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: "filip joksovic",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
});
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

app.get("/", (req, res) => {
    console.log("index page")
    console.log(req.session)
    res.render("index", { text: "HelloWorld" })
})
app.get("/login", (req, res) => {
    res.render("login")
})
app.post('/login', async (req, res) => {
    data = req.body
    let email = data.email
    let password = data.password;
    let hash = await bcrypt.hash(password, 10)
    // console.log(hash)
    let user = {
        "email": email,
        "password": hash
    }
    console.log(user)
    let users = JSON.parse(fs.readFileSync('data/users.json'))
    // console.log(user);
    // console.log(users);

    let foundUser = null
    for (let i = 0; i < users.length; i++) {
        if (users[i].email == user.email) {
            foundUser = users[i];
            console.log("FOUND")
            break;
        }
    }
    console.log(foundUser)
    let validPass = await bcrypt.compare(foundUser.password, user.password)
    if (foundUser == null) {
        res.send({ "res": "User doesnt exist" })
        return
    }
    if (validPass) {
        req.session.user = foundUser
        res.redirect('/')
        return
    }
    else {
        res.send({ "fail": "Fail" })
        return
    }
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.post("/register", (req, res) => {

})
app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/")
})

console.log("Listening on port 3000")
app.listen(3000)