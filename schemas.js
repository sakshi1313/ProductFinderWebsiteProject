
const BaseJoi = require('joi');

const sanitizeHtml = require('sanitize-html');
const Joi = BaseJoi.extend(extension)

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});



module.exports.ProductSchema = Joi.object({
    product: Joi.object({
        name: Joi.string().required().escapeHTML(),
        price: Joi.string().required().escapeHTML(),
        // image: Joi.string().required(),
       
    }).required(),
});

