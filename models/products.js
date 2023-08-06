const mongoose = require('mongoose');

const SearchSchema = new mongoose.Schema({
    productname: String
})

module.exports  = mongoose.model('Products',SearchSchema);

