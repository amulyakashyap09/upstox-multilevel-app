const _ = require('lodash');
const MongoFunction = require("../../db/mongo")
const CustomersSchema = require("./models");
const CustomError = require("../../libs/customError");
const statusCodes = require('../../libs/statusCodes');
const Referrals = require("../referrals/handlers");
const Auth = require('../../libs/auth');
const CommonFunction = require("../common/commonFunction")
const config = require("../../init/init.json");

module.exports.validateReferral = async (params)=> {
	try {
		if (params.id === params.referralId) {
			throw new CustomError(statusCodes.VALIDATION_FAILURE);
		}
		
		const queryCust = {
			_id: parseInt(params.id, 10)
		};
		const queryRef = {
			_id: parseInt(params.referralId, 10)
		};
		const projections = {
			_id: 0,
			joiningDate: 1,
			referralId: 1
		};
		
		const custPromise = MongoFunction.findOne(CustomersSchema, queryCust, projections);
		const refPromise = MongoFunction.findOne(CustomersSchema, queryRef, projections);
		
		const [cust, ref] = await Promise.all([custPromise, refPromise]);
		
		if (_.isEmpty(ref) || cust.referralId || (new Date(cust.joiningDate) < new Date(ref.joiningDate))) {
			throw new CustomError(statusCodes.VALIDATION_FAILURE);
		}
		
		return true;
	} catch (err) {
		throw err;
	}
}

module.exports.addReferral =async (request, h)=> {
	try {
		const query = {
			_id: parseInt(request.payload.id, 10)
		};
		const update = {
			$set: {
				referralId: request.payload.referralId,
				lastUpdated: new Date()
			}
		};
		
		await MongoFunction.update(CustomersSchema, query, update);
		
		let result = await Referrals.addPayback(request.payload.referralId, config.joiningAmt);
		return h.response(result.meta).code(result.meta.code)
	} catch (err) {
		return h.response(statusCodes.API_FAILURE).code(statusCodes.API_FAILURE.code)
	}
}

module.exports.createProfile = async(request, h) => {
	try {
		const userData = request.payload;
		let dataModel = new CustomersSchema(userData)
		let responseData = await MongoFunction.insert(dataModel);
		responseData = JSON.parse(JSON.stringify(responseData))
		if (userData.referralId) {
			await Referrals.addPayback(userData.referralId, config.joiningAmt);
		}
		let data = await Auth.getToken(userData);
		responseData.token = data.token;
		statusCodes.API_CREATED.data = responseData;
		
		return h.response(statusCodes.API_CREATED).code(statusCodes.API_CREATED.code)
	} catch (err) {
		return h.response(statusCodes.API_FAILURE).code(statusCodes.API_FAILURE.code)
	}
}

module.exports.showAllProfiles = async(request, h)=> {
	try {
		const {
			order,
			field
		} = request.query;
		const projections = {
			// _id: 1
		};
		const profiles = await MongoFunction.findAll(CustomersSchema, {}, projections);
		if (!profiles || !profiles.length) {
			return h.response(statusCodes.DATA_NOT_FOUND).code(statusCodes.DATA_NOT_FOUND.code);
		}
		
		const allProfiles = [];
		await Promise.map(profiles, async (profile)=> {
			let value =  await CommonFunction.getReferralCount(profile);
			allProfiles.push({customerId:value.customerId, count:value.referrals, customer: value.customer})
		}, {concurrency:config.dbAsyncConcurrency}).then(function() {
			console.log("done");
		})
		statusCodes.API_SUCCESS.data = _.orderBy(allProfiles, [field], [order]);
		return h.response(statusCodes.API_SUCCESS).code(statusCodes.API_SUCCESS.code);
	} catch (err) {
		console.error(err)
		return h.response(statusCodes.API_FAILURE).code(statusCodes.API_FAILURE.code);
	}
}

module.exports.showProfile = async(request, h) => {
	try {
		const query = {
			_id: parseInt(request.params.id, 10)
		};
		const profile = await MongoFunction.findOne(CustomersSchema, query, {});
		
		if (!profile) {
			return h.response(statusCodes.DATA_NOT_FOUND).code(statusCodes.DATA_NOT_FOUND.code);
		} else {
			statusCodes.API_SUCCESS.data = profile;
			return h.response(statusCodes.API_SUCCESS).code(statusCodes.API_SUCCESS.code);
		}
		
	} catch (err) {
		return h.response(statusCodes.API_FAILURE).code(statusCodes.API_FAILURE.code);
	}
}

module.exports.showChildren = async(request, h) => {
	try {
		const query = {
			referralId: parseInt(request.params.id, 10)
		};
		const projections = {
			_id: 1,
			email: 1
		};
		
		const profiles = await MongoFunction.findAll(CustomersSchema, query, projections);
		
		if (!profiles || !profiles.length) {
			return h.response(statusCodes.DATA_NOT_FOUND).code(statusCodes.DATA_NOT_FOUND.code);
		}
		
		const children = await CommonFunction.getAllChildren(profiles);
		statusCodes.API_SUCCESS.data = children;
		return h.response(statusCodes.API_SUCCESS).code(statusCodes.API_SUCCESS.code);
	} catch (err) {
		console.log("error : ", err)
		return h.response(statusCodes.API_FAILURE).code(statusCodes.API_FAILURE.code);
	}
}

module.exports.makeAmbassador = async(request, h)=>{
	try {
		if (await Referrals.isAmbassador(request.params.id)) {
			return h.response(statusCodes.NOT_MODIFIED).code(statusCodes.NOT_MODIFIED.code);
		}
		const query = {
			_id: parseInt(request.params.id, 10)
		};
		const update = {
			$set: {
				isAmbassador: true,
				lastUpdated: new Date()
			}
		};
		let data = await MongoFunction.update(CustomersSchema, query, update);
		console.log("data : ", data)
		statusCodes.API_SUCCESS.data = data;
		return h.response(statusCodes.API_SUCCESS).code(statusCodes.API_SUCCESS.code);
	} catch (err) {
		console.log(err)
		return h.response(statusCodes.API_FAILURE).code(statusCodes.API_FAILURE.code);
	}
}
