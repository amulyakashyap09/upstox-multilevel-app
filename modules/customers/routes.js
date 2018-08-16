const Joi = require("joi");
const CustomerController = require("./handlers");

module.exports = [
    { 
        method: 'POST', 
        path: '/v1/customer', 
        handler: CustomerController.createProfile,
        options: {
            auth: false,
            validate: {
                payload: {
                    _id: Joi.number().default(parseInt(Date.now(), 10)).required(),
                    isAmbassador: Joi.bool().default(false).required(),
                    email: Joi.string().email().required(),
                    joiningDate: Joi.date().default(new Date()).required(),
                    lastUpdated: Joi.date().default(new Date()).optional(),
                    referralId: Joi.string().optional()
                }
            },
            description: 'Adds customer to the database',
            tags: ['api', 'customer'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    { 
        method: 'GET', 
        path: '/v1/customers',
        options: {
            auth: 'jwt',
            validate: {
                headers: {
                    'authorization': Joi.string().regex(/^Bearer/gmi).required()
                },
                query: {
                    order: Joi.string().valid("asc", "dsc").required(),
                    field: Joi.string().required(),
                },
                options: {
                    allowUnknown: true
                },
            },
            description: 'fetches all customer from the database',
            tags: ['api', 'customer'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        },
        handler: CustomerController.showAllProfiles
    },
    { 
        method: 'GET', 
        path: '/v1/customer/{id}',
        handler: CustomerController.showProfile,
        options: {
            auth: 'jwt',
            validate: {
                headers: {
                    'authorization': Joi.string().required()
                },
                options: {
                    allowUnknown: true
                },
                params: {
                    id: Joi.string().required()
                },
                options: {
                    allowUnknown: true
                },
            },
            description: 'fetches customer by id from the database',
            tags: ['api', 'customer'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    { 
        method: 'GET', 
        path: '/v1/customer/children/{id}',
        handler: CustomerController.showChildren,
        options: {
            auth: 'jwt',
            validate: {
                headers: {
                    'authorization': Joi.string().required()
                },
                options: {
                    allowUnknown: true
                },
                params: {
                    id: Joi.string().required()
                },
                options: {
                    allowUnknown: true
                },
            },
            description: 'fetches customer childern from the database',
            tags: ['api', 'customer', 'children'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    { 
        method: 'PUT', 
        path: '/v1/customer/referral',
        handler: CustomerController.addReferral,
        options: {
            auth: 'jwt',
            validate: {
                headers: {
                    'authorization': Joi.string().required()
                },
                options: {
                    allowUnknown: true
                },
                payload: {
                    id: Joi.string().required(),
                    referralId: Joi.string().required(),
                },
                options: {
                    allowUnknown: true
                },
            },
            description: 'adds referral amount to the customer',
            tags: ['api', 'customer', 'referral'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    { 
        method: 'PUT', 
        path: '/v1/customer/ambassador/{id}',
        handler: CustomerController.makeAmbassador,
        options: {
            auth: 'jwt',
            validate: {
                headers: {
                    'authorization': Joi.string().required()
                },
                params: {
                    id: Joi.string().required(),
                },
                options: {
                    allowUnknown: true
                },
                failAction: async (request, h, err) => {
                    console.error('ValidationError:', err.message); // Better to use an actual logger here.
                    throw err;
                }
            },
            description: 'converts customer to ambassador',
            tags: ['api', 'customer', 'ambassador'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    }
];