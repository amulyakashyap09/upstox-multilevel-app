const statusCodes = require('../../libs/statusCodes');
const MongoFunction = require("../../db/mongo")
const CustomersSchema = require("../customers/models");
const commonConf = require('../../init/init.json');

const getCurrentPayback = async (parentId) => {
	try {
		const query = { _id: parseInt(parentId, 10) };
		const projections = { _id: 0, payback: 1, referralId: 1 };
		
		return await MongoFunction.findOne(CustomersSchema, query, projections);
	} catch (err) {
		throw err;
	}
}

module.exports.isAmbassador = async(customerId)=> {
	try {
		if (!customerId) {
			return false;
		}
		
		const query = { _id: parseInt(customerId, 10) };
		const projections = { _id: 0, isAmbassador: 1 };
		
		const { isAmbassador } = await MongoFunction.findOne(CustomersSchema, query, projections);
		return isAmbassador;
	} catch (err) {
		throw err;
	}
}

module.exports.addAmbassadorPayback = async(ambassadorId, joiningAmt) => {
	try {
		const { payback: currentPayback } = await getCurrentPayback(ambassadorId);
		const updatedPayback = currentPayback + (commonConf.ambassadorPaybackPerc * joiningAmt);
		
		const query = { _id: parseInt(ambassadorId, 10) };
		const update = { $set: { payback: updatedPayback, lastUpdated: new Date() } };
		await this.db.update(CustomersSchema, query, update);
		
		return {
			meta: statusCodes.API_SUCCESS,
		};
	} catch (err) {
		throw err;
	}
}

module.exports.addPayback = async (parentId, joiningAmt) => {
	try {
		const { payback: currentPayback, referralId } = await getCurrentPayback(parentId);
		const updatedPayback = currentPayback + (commonConf.custPaybackPerc * joiningAmt);
		
		const query = { _id: parseInt(parentId, 10) };
		const update = { $set: { payback: updatedPayback, lastUpdated: new Date() } };
		await MongoFunction.update(CustomersSchema, query, update);
		
		if (await this.isAmbassador(referralId)) {
			return await this.addAmbassadorPayback(referralId, joiningAmt);
		}
		return {
			meta: statusCodes.API_SUCCESS,
		};
	} catch (err) {
		throw err;
	}
}