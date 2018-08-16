const CustomError = require("../libs/customError")
const status = require('../libs/statusCodes');

module.exports.findOne = async (model, query, exclude = {}) => {
	try {
		return await model.findOne(query, exclude);
	} catch (err) {
		throw new CustomError(status.DATABASE_FAILURE, err.message);
	}
}

module.exports.findAll = async (model, query, exclude = {}, options = {}) => {
	try {
		return await model.find(query, exclude, options);
	} catch (err) {
		console.error("findAll : ", err)
		throw new CustomError(status.DATABASE_FAILURE, err.message);
	}
}

module.exports.count = async (model, query) => {
	try {
		return await model.countDocuments(query);
	} catch (err) {
		throw new CustomError(status.DATABASE_FAILURE, err.message);
	}
}

module.exports.findDistinct = async (schema, field) => {
	try {
		const model = this.db.model(schema.options.collection, schema);
		return await model.distinct(field);
	} catch (err) {
		throw new CustomError(status.DATABASE_FAILURE, err.message);
	}
}

module.exports.update = async (model, query, update, options = {}) => {
	try {
		return await model.update(query, update, options);
	} catch (err) {
		console.log("err : ", err)
		throw new CustomError(status.DATABASE_FAILURE, err.message);
	}
}

module.exports.insert = async (model) => {
	try {
		return await model.save()
	} catch (err) {
		throw new CustomError(status.DATABASE_FAILURE, err.message);
	}
}
