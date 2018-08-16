let Mongoose = require('mongoose')
let Schema = Mongoose.Schema;

let customerModel = new Schema({
    _id: {
		type: Number,
	},
	email: {
		type: String,
	},
	referralId: {
		type: Number,
		default: null,
	},
	payback: {
		type: Number,
		default: 0,
	},
	isAmbassador: {
		type: Boolean,
		default: false,
	},
	joiningDate: {
		type: Date,
	},
	lastUpdated: {
		type: Date,
	},
}, { collection: 'customers' });

// module.exports.schema = customerSchema;
module.exports = Mongoose.model('customers', customerModel); 