const CustomersSchema = require("../customers/models");
const Referrals = require("../referrals/handlers");
const Auth = require('../../libs/auth');
const config = require("../../init/init.json");
const MongoFunction = require("../../db/mongo");
const CommonFunction = require("../common/commonFunction");
const statusCodes = require('../../libs/statusCodes');

module.exports.createProfile = async (request, h) => {
	try {
		
		request.payload.isAmbassador = true;
		const userData = request.payload;

		let dataModel = new CustomersSchema(userData)
		let responseData = await MongoFunction.insert(dataModel);
		responseData = JSON.parse(JSON.stringify(responseData))
		
		if (request.payload.referralId) {
			await Referrals.addPayback(request.payload.referralId, config.joiningAmt);
		}

		let data = await Auth.getToken(userData);
		responseData.token = data.token;
		statusCodes.API_CREATED.data = responseData;
		return h.response(statusCodes.API_CREATED).code(statusCodes.API_CREATED.code)
	} catch (err) {
		return h.response(statusCodes.API_FAILURE).code(statusCodes.API_FAILURE.code)
	}
}

module.exports.showChildren = async (request, h) => {
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
			h.response(statusCodes.DATA_NOT_FOUND).code(statusCodes.DATA_NOT_FOUND.code)
		}
		
		const children = await CommonFunction.getAllChildren(profiles);
		statusCodes.API_SUCCESS.data = children;
		return h.response(statusCodes.API_SUCCESS).code(statusCodes.API_SUCCESS.code)
	} catch (err) {
		console.log("error is : ", err)
		return h.response(statusCodes.API_FAILURE).code(statusCodes.API_FAILURE.code)
	}
}

module.exports.showNthChildren = async (request, h) => {
	try {
		let profiles = [{ _id: parseInt(request.query.id, 10) }];
		const maxLevel = parseInt(request.query.level, 10);
		
		for (let level = 1; level <= maxLevel; level += 1) {
			profiles = await CommonFunction.getChildrenLevelWise(profiles);
			
			if (!profiles.length) {
				return h.response(statusCodes.DATA_NOT_FOUND).code(statusCodes.DATA_NOT_FOUND.code)
			}
			
			if (level === maxLevel) {
				status.API_SUCCESS.data = profiles
				return h.response(statusCodes.API_SUCCESS).code(statusCodes.API_SUCCESS.code)
			}
		}
		
		return h.response(statusCodes.DATA_NOT_FOUND).code(statusCodes.DATA_NOT_FOUND.code)
	} catch (err) {
		console.log("error is : ", err)
		return h.response(statusCodes.API_FAILURE).code(statusCodes.API_FAILURE.code)
	}
}