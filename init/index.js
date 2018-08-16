const debug = require('debug');
const packageJson = require('../package.json');

(function init() {
	process.env.PORT = process.env.PORT || 7000;
	process.env.HOST = process.env.HOST || 'localhost';
	process.env.MONGODB = process.env.MONGODB || 'mongodb://localhost:27017/upstox'
	process.env.NODE_ENV = process.env.NODE_ENV || 'development';
	process.env.VERSION = packageJson.version || '1.0.0';
	process.env.secretKey = 'aMuLYa@SecretIsSalt';
	if (process.env.NODE_ENV === 'development') {
		process.env.DEBUG = process.env.DEBUG || '*';
	}
	debug(`environment: ${process.env.NODE_ENV}`);
	debug(`version: ${process.env.VERSION}`);
}());