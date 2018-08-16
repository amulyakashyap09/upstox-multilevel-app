const Joi = require("joi");
const AmbassadorController = require("./handlers");

module.exports = [
    { 
        method: 'POST', 
        path: '/v1/ambassador', 
        handler: AmbassadorController.createProfile,
        options: {
            auth: false,
            validate: {
                payload: {
                    _id: Joi.number().default(parseInt(Date.now(), 10)).required(),
                    isAmbassador: Joi.bool().default(true).required(),
                    email: Joi.string().email().required(),
                    joiningDate: Joi.date().default(new Date()).required(),
                    lastUpdated: Joi.date().default(new Date()).required(),
                    referralId: Joi.string().optional()
                }
            },
            description: 'adds ambassador to the database',
            tags: ['api', 'ambassador'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    { 
        method: 'GET', 
        path: '/v1/ambassador/children/{id}', 
        handler: AmbassadorController.showChildren,
        options: {
            auth: 'jwt',
            validate: {
                headers: {
                    'authorization': Joi.string().regex(/^Bearer/gmi).required()
                },
                params: {
                    id: Joi.number().required(),
                },
                options: {
                    allowUnknown: true
                },
            },
            description: 'gets ambassador children from the database',
            tags: ['api', 'ambassador'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    { 
        method: 'GET', 
        path: '/v1/ambassador/level/children', 
        handler: AmbassadorController.showNthChildren,
        options: {
            auth: 'jwt',
            validate: {
                headers: {
                    'authorization': Joi.string().regex(/^Bearer/gmi).required()
                },
                query: {
                    id: Joi.number().required(),
                    level: Joi.number().required(),
                },
                options: {
                    allowUnknown: true
                },
            },
            description: 'gets ambassador nth level children from the database',
            tags: ['api', 'ambassador'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    }
];