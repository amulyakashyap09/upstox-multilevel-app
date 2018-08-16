const jwt = require('jsonwebtoken');
const statusCodes = require('../libs/statusCodes');
const CustomError = require("../libs/customError");

function validateUser(id, tokenData) {
	if (!id) {
		return false;
	}
	
	if (id != tokenData._id) {
		return false;
	}
	return true;
}

function getUserId(data) {
	if (data.params && data.params.id) {
		return data.params.id;
	}
	
	if (data.query && data.query.id) {
		return data.query.id;
	}
	
	if (data.request.body && data.request.body.id) {
		return data.request.body.id;
	}
	
	return null;
}

async function getTokenData(headerToken) {
	try {
		const token = headerToken.substr(headerToken.indexOf(' ')).trim();
		return jwt.verify(token, process.env.secretKey);
	} catch (err) {
		throw err;
	}
}

async function generateToken(payload) {
	try {
		const token = jwt.sign(payload, process.env.secretKey, {
			expiresIn: '365d'
		});
		return {
			token,
			id: parseInt(payload._id, 10),
		};
	} catch (err) {
		throw new CustomError(statusCodes.INTERNAL_FAILURE);
	}
}


module.exports.getToken = async (params)=> {
	try {
		const token = await generateToken(params);
		return token
	} catch (err) {
		throw err;
	}
}

module.exports.validate = async (decoded, request, h) => {
	try {
		const user = await getTokenData(request.headers.authorization);
		if (!validateUser(decoded._id, user)) {
			return h.response(statusCodes.FORBIDDEN_ACCESS).code(statusCodes.FORBIDDEN_ACCESS.code);
		}else {
			return { isValid: true };
		}
	} catch (err) {
		return h.response(statusCodes.FORBIDDEN_ACCESS).code(statusCodes.FORBIDDEN_ACCESS.code)
	}
}
