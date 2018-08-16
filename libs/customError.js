class CustomError extends Error {
	constructor(params, extra) {
		super();

		Error.captureStackTrace(this, this.constructor);
		this.name = this.constructor.name;
		this.message = params.message;
		this.status = params.code;

		if (extra) {
			this.otherMessage = extra;
		}
	}
}

module.exports = CustomError;