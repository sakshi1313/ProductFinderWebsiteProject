const Product = require('./models/products')
const ExpressError = require('./utils/ExpressError');
const { ProductSchema} = require('./schemas');



module.exports.validateProduct = (req,res,next) => {
    const {error} = ProductSchema.validate(req.body)
    if(error)
    {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
    
}