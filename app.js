if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}
const express            =require('express')
const app                = express()
const path               = require('path')
const mongoose           = require('mongoose');

const catchAsync         = require('./utils/catchAsync')
const ExpressError       = require('./utils/ExpressError')

const ejsMate            = require('ejs-mate');
const { default: axios } = require('axios');
app.engine('ejs',ejsMate);
const cors = require('cors');
// to be moved to controller ---------------------------------
const Product            = require('./models/products')
const User               = require('./models/users');


//--------------------- sessions----------------------
const session           = require("express-session")
const flash             = require("connect-flash")
const methodOverride    = require('method-override');

const {isLoggedIn} = require("./middleware");
const { storeReturnTo } = require('./middleware');



const sessionConfig = {
    name: "mycookie",
    secret: 'shhhhhhhhhhhhhhhhhhh',
    resave: false,
    saveUninitialized: true,
    //store: mongo /// storing data to cloud....restore the data even if we stop the server
    cookie: {
        httpOnly: true, // only accessible over http not js
        // secure: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());


const api_key=process.env.API_KEY


// ----------------ADDING VIEWS DIRECTORY-------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// ---------------------------------------------------------


//--------------------------------------------------------------
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// app.use(express.json())


mongoose.connect("mongodb://localhost:27017/product-data", { 
})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })


//------------------------------AUTHENTICATION------------------------------
const passport = require('passport')
const LocalStrategy = require('passport-local'); // authentication

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





// axios ------------------------
// flash------------------------------------
app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});


const data = async(url) => {
    try{
    const res = await axios.get(url)
    return res.data.results;
    }catch(e)
    {
        console.log("Error in api",e)
    }

}


// ---------------------------------------------------------------------



// ------------- searching on a product form ------------------
app.get('/searchproducts', (req,res) => {
    // console.log("search for a product")
    // res.send("search for a product")
    res.render("searchPage/search")
})

// app.post('/products', (req,res) => {
//     // console.log("search for a product")
//     // res.send("search for a product")
//     // res.render("searchPage/search")
//     // const data = req.body;
//     res.send(req.body)
//     // res.redirect(`/products?data=${data}`)

// })

app.post('/products' , catchAsync(async(req,res) => {
    const name = req.body.product.productname;
    const url = `https://api.scraperapi.com/structured/amazon/search?api_key=${api_key}&query=${name}&country=in&tld=in`
       
    const pd = await data(url)
    if(!pd) throw new ExpressError('Retry...API failed to load', 400)
    // console.log(pd)
    // res.json(products)
    // req.flash("success", "Successfully added product to bag")
    res.render("searchPage/showproduct", {pd})
    
}))


// ---------------------------------------------------------------
// ---------------------------adding "ADD TO BAG" form
// const productsInBag = [];

app.get('/bag', isLoggedIn,async(req,res) => {
    const products = await Product.find();
    // console.log(products)
    res.render('users/bag',{products});
})

app.post('/products/bag' , isLoggedIn, catchAsync(async(req,res) => {
    // res.send(req.body.productData)
    const productData = JSON.parse(req.body.productData);
    const{name,price,image} = productData
    const value = {name,price,image}
    // JSON string ko object me c][onvert krne ke liye
    const newP = new Product(value);
    await newP.save();
    // res.send(newP)

    // console.log(productData);
    
    req.flash("success", "Successfully added product to bag")
    res.redirect('/bag')
    // res.render('users/bag',{products:productsInBag})
    // res.redirect('/bag')

    // res.send(productData)   
}))


//------------------------------- DELETING PRODUCT----------------

app.delete('/bag', isLoggedIn, async(req,res)=>{ 
        // res.send(req.params.id)
        const id = req.body.id;
        await Product.findByIdAndDelete(id)
        req.flash("error","Deleted a product")
        res.redirect('/bag')
})


// ------------------------------------------------------ USERS --------------------------------------------

app.get('/signup',(req,res) => {
    res.render('users/signup');
})

app.post('/signup',catchAsync(async(req,res) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username})
        const registeredUser = await User.register(user, password);
        req.login(registeredUser,err => {
            if(err) return next(err);
            req.flash('success','Welcome to yourFinder');
            res.redirect('/searchproducts')
        })
    } catch(e){
        req.flash("error", e.message);
        res.redirect('/signup')
    }
    
    // res.send(registeredUser);  
}))

app.get('/login',(req,res) => {
    res.render('users/login');
})

app.post('/login',storeReturnTo,passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),(req,res) => {
    req.flash('success', 'welcome back!')
    // console.log(res.locals.returnTo)
    const redirectUrl = res.locals.returnTo || '/searchproducts'; 
    res.redirect(redirectUrl);
})


app.get('/logout',(req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/searchproducts');
    });
})




















//------------------- ERROR HANDELING---------------------------------

// app.all('*',(req,res,next) => {
//     next(new ExpressError("Page not found", 404))
// })
app.use((err,req,res,next) => {
    const {statusCode = 500, message = "Something went wrong"} = err;
    if(!err.message) err.message='Oh no something went wrong'
    res.status(statusCode).render('error',{err});
    res.send('something went wrong');
})


app.listen(8080, () => {
    console.log("APP IS LISTENING ON PORT 8080!")
})

