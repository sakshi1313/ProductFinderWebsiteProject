

const {axios} = require("axios");

const express  =require('express')
const app = express()
const cors = require('cors');
app.use(cors())

const url = "http://api.scraperapi.com/structured/amazon/product?api_key=8bc7ce5b263e0c0e2d4b496f50299a8c&asin=B0BYPFNW6T&country=au&tld=com.au"
// axios.get("http://api.scraperapi.com/?api_key=8bc7ce5b263e0c0e2d4b496f50299a8c&url=https://apple.com&render=true")
const data = async(req,res) => {
    axios.get(url)
    .then((res) => {
    console.log("RESPONSE: ", res)
})    
    .catch((e) => {
        console.log("Error", e);
     
})
}

data()



