const Product = require('./models/products')
const ExpressError = require('./utils/ExpressError');
// const { ProductSchema} = require('./schemas');


module.exports.isLoggedIn = (req,res, next) => {
    if(!req.isAuthenticated())
    {
        // store the URL they are requesting
        req.session.returnTo = req.originalUrl;
        req.flash("error", "you must be signed in");
        return res.redirect('/login')
    }
    next();
}
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}





// module.exports.validateProduct = (req,res,next) => {
//     const {error} = ProductSchema.validate(req.body)
//     if(error)
//     {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     }
//     else{
//         next();
//     }
    
// }