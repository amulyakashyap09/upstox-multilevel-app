require("./init");
const Hapi = require("hapi");
const HapiAuthJWT = require('hapi-auth-jwt2');
const modules = require("./modules");
const promise = require("bluebird");
global.Promise = promise;
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
global.Mongoose = mongoose;
const HapiSwagger = require('hapi-swagger');
const Inert = require("inert");
const Vision = require("vision");
const Pack = require('./package.json');
const Auth = require("./libs/auth");

// define some constants to make life easier
const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = 3000;
const RADIX = 10;

const init = async() => {
	
	try {
		const server = new Hapi.Server({ 
			host: process.env.HOST || DEFAULT_HOST,
			port: parseInt(process.env.PORT, RADIX) || DEFAULT_PORT,
		});
		
		const swaggerOptions = {
			info: {
				title: 'API Documentation',
				version: Pack.version,
			},
			pathPrefixSize: 2
		};
		
		await server.register([
			Inert,
			Vision,
			{
				plugin: HapiSwagger,
				options: swaggerOptions
			}
		]);
		
		await server.register(HapiAuthJWT);
		
		server.auth.strategy('jwt', 'jwt',
		{ key: process.env.secretKey,
			validate:Auth.validate,
			verifyOptions: { ignoreExpiration: true }
		});
		
		server.auth.default('jwt');
		await server.register(modules);
		await server.start();
		Mongoose.connect(process.env.MONGODB, { useNewUrlParser: true }).then(() => { console.log(`Connected to Mongo server`) }, err => { console.log(err) });
		Mongoose.set('debug', true)
		return server;
	} catch (err) {
		console.log("Hapi error starting server", err);
	}
};

init().then(server => {
	console.log('Server running at:', server.info.uri);
}).catch(err => {
	console.log(err);
});