const _ = require('lodash');
const MongoFunction = require("../../db/mongo")
const CustomersSchema = require("../customers/models");

const config = require("../../init/init.json");


module.exports.nonEmptyResult = (result)=>{
	return !_.isEmpty(result);
}

module.exports.getReferralCount = async (profile) => {
	try {
		if (profile._id) {
			const query = {
				referralId: parseInt(profile._id, 10)
			};
			const count = await MongoFunction.count(CustomersSchema, query);
			
			return {
				customerId: profile._id,
				customer: profile,
				referrals: count,
			};
		}else{
			return {
				customerId: profile._id,
				referrals: 0,
			};
		}
		
	} catch (err) {
		console.log("asdgjhasgdjhagshjdgahjsdgjhasgd : ", err)
		throw err;
	}
}

module.exports.getChildrenLevelWise = async (profiles) => {
	try {
		const res = []
		await Promise.map(profiles, async (profile)=> {
			if (profile._id){
				let value =  await module.exports.getReferralCount(profile);
				res.push({customerId:value.customerId, count:value.referrals})
			}
		}, {concurrency:config.dbAsyncConcurrency})
		.filter(module.exports.nonEmptyResult, { concurrency:config.dbAsyncConcurrency });
		return [].concat.apply([], res); // eslint-disable-line prefer-spread
	} catch (err) {
		throw err;
	}
}

module.exports.getAllChildren = async (profiles) => {
	try {
		const children = {
			1: profiles,
		};
		
		let arrProfiles = profiles;
		const userCount = await MongoFunction.count(CustomersSchema, {});
		
		for (let level = 2; level <= userCount; level += 1) {
			
			arrProfiles = await	module.exports.getChildrenLevelWise(arrProfiles);
			
			if (!arrProfiles.length) {
				break;
			}
			children[level] = arrProfiles;
		}
		
		return children;
	} catch (err) {
		throw err;
	}
}

module.exports.getChildren = async (profile) => {
	try {
		const query = { referralId: parseInt(profile._id, 10) };
		const projections = { _id: 1, email: 1 };
		return await MongoFunction.findAll(CustomersSchema, query, projections);
	} catch (err) {
		throw err;
	}
}