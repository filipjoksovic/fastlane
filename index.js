const express = require("express")
const session = require("express-session")
const fs = require("fs");
const bodyparser = require("body-parser")
const bcrypt = require("bcrypt");
const multer = require("multer")
const path = require("path")

const app = express()

const uploader = multer({
    storage: multer.diskStorage(
        {
            destination: function (req, file, cb) {
                cb(null, 'public/media/');
            },
            filename: function (req, file, cb) {
                cb(
                    null,
                    new Date().valueOf() +
                    '_' +
                    file.originalname.replace(" ", "")
                );
            }
        }
    ),
})

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
app.use('/public', express.static(__dirname + "/public"));

function loggedInMiddleware(req, res, next) {
    if (typeof req.session.user == "undefined") {
        message = "You must be logged in to access this part of the site"
        res.redirect("/login")
        return
    }
    next()
}
function adminMiddleware(req, res, next) {
    if (typeof req.session.user == "undefined") {
        message = "You must be logged in to access this part of the site"
        res.redirect("/login")
        return
    }
    else if (req.session.user.role_id != 2) {
        message = "You must be an administrator to access this part of the site"
        res.redirect("back")
        return
    }
    next()
}

app.get("/", loggedInMiddleware, (req, res) => {
    console.log("index page")
    console.log(req.session)
    let categories = getCategories();
    let discounts = getUniqueDiscounts();
    let products = getProducts();
    console.log(products)
    res.render("index", { title: "Home", categories, discounts, products })
})
app.get("/login", (req, res) => {
    res.render("login", { title: "Login" })
})
app.post('/login', async (req, res) => {
    data = req.body
    let email = data.email
    let password = data.password;
    const salt = await bcrypt.genSalt(10)
    try {
        validateInput(data)
        if (data.email.length < 5 || data.email.length > 255) {
            message = "Email must be between 5 and 255 characters"
            res.redirect("/login")
            return
        }
    }
    catch (err) {
        message = err
        res.redirect("/login")
        return
    }
    let user = {
        "email": email,
    }
    console.log(user)
    let users = JSON.parse(fs.readFileSync('data/users.json'))


    let foundUser = null
    console.log(users)
    console.log("USERS")
    for (let i = 0; i < users.length; i++) {
        console.log(users[i])
        if (users[i].email == user.email) {
            foundUser = users[i];
            console.log("FOUND")
            break;
        }
    }
    console.log(foundUser)
    if (foundUser == null) {
        message = "User with given data does not exist. Check your data and try again"
        res.redirect("/login")
        return
    }
    let validPass = await bcrypt.compare(password, foundUser.password)

    if (validPass) {
        req.session.user = foundUser
        if (foundUser.role_id == 1) {
            res.redirect('/')
        }
        else {
            res.redirect("/admin")
        }
        return
    }
    else {
        message = "Password is not correct"
        res.redirect("/login")
        return
    }
})

app.get("/register", (req, res) => {
    res.render("register", { title: "Register" })
})

app.post("/register", async (req, res) => {
    data = req.body
    let email = data.email
    let password = data.password;
    let fname = data.fname;
    let lname = data.lname;
    let role_id = 1;
    try {
        validateInput(data)
    }
    catch (err) {
        message = err
        res.redirect("/register")
        return
    }
    if (data.hasOwnProperty("role_id")) {
        role_id = data.role_id
    }
    const salt = await bcrypt.genSalt(10)
    let hash = await bcrypt.hash(password, salt)
    let users = []
    try {
        users = JSON.parse(fs.readFileSync("./data/users.json"))
    }
    catch (err) {
        users = []
    }
    let max = 1;
    users.forEach(user => {
        if (user.id >= max) {
            max = user.id + 1
        }
    })
    let newUser = {
        "id": max,
        "email": email,
        "password": hash,
        'fname': fname,
        "lname": lname,
        'role_id': role_id
    }
    //validation
    if (newUser.email.length < 3) {
        message = "Email length must be longer than 3 characters"
        res.redirect("/register")
        return
    }
    if (newUser.fname.length < 3 || newUser.fname.length > 50) {
        message = "First name must be between 3 and 50 characters"
        res.redirect("/register")
        return
    }
    if (newUser.lname.length < 2 || newUser.fname.length > 50) {
        message = "Last name must be between 2 and 50 characters"
        res.redirect("/register")
        return
    }

    let foundUser = null
    for (let i = 0; i < users.length; i++) {
        if (users[i].email == newUser.email) {
            foundUser = users[i];
            message = "User with the given email already exists."
            res.redirect("/register")
            return
        }
    }
    users.push(newUser)
    try {
        fs.writeFile('data/users.json', JSON.stringify(users), (err, res) => {
            if (err) {
                message = "Error while writing to the document"
            }
            else {
                console.log("NO ERRORS")
            }
        })
        req.session.user = newUser;
    }
    catch (err) {
        message = "Error while writing to the document"
    }
    res.redirect("/")
    return

})
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/")
})

app.get("/admin", adminMiddleware, (req, res) => {

    res.render("admin", { title: "Admin" })
})

app.get("/getCategories", (req, res) => {
    let data = fs.readFile("./data/categories.json", (err, data) => {
        if (err) {
            res.status(500).send({ "categories": [], "error": err })
            return
        }
        else {
            res.status(200).send({ "categories": JSON.parse(data) })
            return
        }
    })
})
app.get('/getProducts', (req, res) => {
    let data = fs.readFile("./data/products.json", (err, data) => {
        let discounts = getDiscounts()
        if (err) {
            res.status(500).send({ "products": [], "error": err })
            return
        }
        else {
            let products = JSON.parse(data)
            categories = getCategories()
            products.forEach(product => {
                product.discounted_price = null
                categories.forEach(category => {
                    if (category.id == product.category) {
                        product.category_name = category.name
                    }
                })
                discounts.forEach(discount => {
                    if (discount.product_id == product.id && Date.parse(discount.date_end) > Date.now()) {
                        product.discounted_price = product.price - product.price / discount.discount
                        product.discount_ends = discount.date_end
                        product.discount_name = discount.name

                    }
                })
            })

            res.status(200).send({ "products": products })
            return
        }
    })
})
app.get("/getProductImage/:id", (req, res) => {
    let product_id = req.params.id
    let data = fs.readFile("./data/product_images.json", (err, data) => {
        if (err) {
            res.status(500).send({ "products": [], "error": err })
            return
        }
        else {
            let images = JSON.parse(data)
            let foundImage = null;
            images.forEach(image => {
                if (image.product_id == product_id) {
                    foundImage = image
                }
            })
            if (foundImage) {
                let fileName = foundImage.path.split("\\")[2]
                res.status(200).send({ "image": '/public/media/' + fileName })
                return
            }
            else {
                res.status(500).send({ "image": null })
                return
            }
        }
    })
})

app.post("/addProduct",adminMiddleware, uploader.single("image"), (req, res) => {
    data = req.body
    let product = {
        "id": null,
        "name": data.name,
        "price": data.price,
        "description": data.description,
        "category": data.category
    }
    try {
        validateInput(data)
    }
    catch (err) {
        message = err
        res.redirect("/admin")
        return
    }
    let products = []
    try {
        products = JSON.parse(fs.readFileSync("./data/products.json"))
    }
    catch (err) {
        products = []
    }
    let max = 1;
    products.forEach(product => {
        if (product.id >= max) {
            max = product.id + 1
        }
    })
    product.id = max
    products.push(product)
    try {
        console.log(req.file)
        let picture = {
            "product_id": product.id,
            "path": req.file.path
        }
        let pictures = []
        try {
            pictures = JSON.parse(fs.readFileSync("data/product_images.json"))
        }
        catch (err) {
            pictures = []
        }
        pictures.push(picture)
        fs.writeFileSync("data/product_images.json", JSON.stringify(pictures))

        fs.writeFileSync("data/products.json", JSON.stringify(products))

        success = "Successfully added a product to the store"
        res.redirect("/admin")
    }
    catch (err) {
        message = "Image for the product is required."
        res.redirect("/admin")
    }
})
app.get('/image/:filename', (req, res) => {
    const { filename } = req.params;
    const dirname = path.resolve();
    const fullfilepath = path.join(dirname, 'public/media/' + filename);
    return res.sendFile(fullfilepath);
});
app.post('/addDiscount',adminMiddleware, (req, res) => {
    let data = req.body;
    let discount = {
        "name": data.name,
        "discount": data.discount,
        "date_start": data.date_start,
        "date_end": data.date_end
    }
    let products = data.products.split(",")
    console.log("PRODUCTS")
    console.log(products)
    try {
        let existingDiscounts = JSON.parse(fs.readFileSync("data/discounts.json"))
        for (let i = 0; i < existingDiscounts.length; i++) {
            if (products.includes(existingDiscounts[i].product_id)) {
                existingDiscounts.splice(i, 1)
            }
        }
        for (let i = 0; i < products.length; i++) {
            let newDiscount = {
                ...discount
            }
            newDiscount.product_id = products[i]
            existingDiscounts.push(newDiscount)
        }
        fs.writeFileSync("data/discounts.json", JSON.stringify(existingDiscounts))
        res.redirect("/admin")
    }
    catch (err) {
        console.log("ERROR")
        console.log(err)
        res.redirect("/admin")
    }
})
app.get("/getDiscounts", (req, res) => {
    let data = fs.readFile("./data/discounts.json", (err, data) => {
        if (err) {
            res.status(500).send({ "discounts": [], "error": err })
            return
        }
        else {
            let discounts = JSON.parse(data)
            console.log("DISCOUNTS")
            console.log(discounts)
            // const unique = [...new Set(discounts.map(item => item.name))];
            res.status(200).send({ "discounts": discounts })
            return
        }
    })
})
app.get("/getUsers",adminMiddleware,(req,res)=>{
    let users = []
    try{
        users = JSON.parse(fs.readFileSync("./data/users.json"))
        for(let i = users.length - 1;i >= 0; i--){
            console.log(users[i])
            if(req.session.user.id == users[i].id){
                users.splice(i,1)
            }
        }
        res.send({"users":users})
    }
    catch(err){
        res.send({"error":err})
    }
})

app.get("/cart", loggedInMiddleware, (req, res) => {
    res.render("cart", { title: "Cart" })
})
app.post("/cart", loggedInMiddleware, (req, res) => {
    let data = req.body
    let items = data.cart_items.split(",")
    let user_id = req.session.user.id
    // let user_id = 1
    let fname = data.fname
    let lname = data.lname
    let address = data.address
    let phone = data.phone
    let email = data.email
    let country = data.country
    let zip = data.zip
    let cost = data.cart_sum

    let order = {
        "user_id": user_id,
        "fname": fname,
        "lname": lname,
        "address": address,
        "phone": phone,
        "email": email,
        "country": country,
        "zip": zip,
        "items": items,
        "cart_sum": cost
    }
    try {
        let orders = JSON.parse(fs.readFileSync("./data/orders.json"))
        orders.push(order)
        fs.writeFileSync('./data/orders.json', JSON.stringify(orders))
    }
    catch (err) {
        console.log("error while writing file")
    }
    success = "Successfully created an order"
    res.redirect("/cart")
})

function getCategories() {
    let categories = []
    try {
        categories = JSON.parse(fs.readFileSync("data/categories.json"))
    }
    catch (err) {
        categories = []
    }
    return categories
}
function getDiscounts() {
    let discounts = []
    try {
        discounts = JSON.parse(fs.readFileSync("data/discounts.json"))
    }
    catch (err) {
        discounts = []
    }
    return discounts
    // return [...new Set(discounts.map(item => item.name))]
}
function getUniqueDiscounts() {
    let discounts = []
    try {
        discounts = JSON.parse(fs.readFileSync("data/discounts.json"))
    }
    catch (err) {
        discounts = []
    }
    // return discounts
    return [...new Set(discounts.map(item => item.name))]
}
function getProducts() {
    let products = []
    try {
        products = JSON.parse(fs.readFileSync("data/products.json"))
        categories = getCategories()
        discounts = getDiscounts()
        products.forEach(product => {
            product.discounted_price = null
            categories.forEach(category => {
                if (category.id == product.category) {
                    product.category_name = category.name
                }
            })
            discounts.forEach(discount => {
                if (discount.product_id == product.id) {
                    product.discounted_price = discount.discount * product.price
                    product.discount_ends = discount.date_end
                    product.discount_name = discount.name
                }
            })
        })
    }
    catch (err) {
        products = []
    }
    // return products

    return products
}

function validateInput(data) {
    console.log(data)
    for (field in data) {
        if (data[field] == "") {
            throw "Not all fields are filled. Correct the data and try again"
        }
    }
}

console.log("Listening on port 3000")
app.listen(3000)