if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}
const express  =require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose');

const ejsMate = require('ejs-mate');
const { default: axios } = require('axios');
app.engine('ejs',ejsMate);
const cors = require('cors');

const api_key=process.env.API_KEY


// ----------------ADDING VIEWS DIRECTORY-------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// ---------------------------------------------------------

// to be moved to controller ---------------------------------
const Product = require('./models/products')

//--------------------------------------------------------------
app.use(cors())
app.use(express.urlencoded({ extended: true }));
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

// axios ------------------------

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

app.post('/products' , async(req,res) => {
    const name = req.body.product.productname;
    const url = `https://api.scraperapi.com/structured/amazon/search?api_key=${api_key}&query=${name}&country=in&tld=in`
    
    const newP = new Product(req.body.product);
    await newP.save();
    const pd = await data(url)
    res.send(req.body.product)
    
    if(pd){
        // console.log(pd)
        // res.json(products)
        res.render("searchPage/showproduct", {pd})
    }
   
    

    // res.send(url)
    
})

// https://api.scraperapi.com/structured/amazon/search?api_key=8bc7ce5b263e0c0e2d4b496f50299a8c&query=earphones&country=in&tld=in
// const url = `https://api.scraperapi.com/structured/amazon/product?api_key=${api_key}&asin=B01CCGW4OE&country=in&tld=in`
// axios.get("http://api.scraperapi.com/?api_key=8bc7ce5b263e0c0e2d4b496f50299a8c&url=https://apple.com&render=true")



// ---------------------------------------------------------------


app.use('/',(req,res) => {
    // console.log("here")
    res.render("searchPage/home")
})
app.listen(8080, () => {
    console.log("APP IS LISTENING ON PORT 8080!")
})

