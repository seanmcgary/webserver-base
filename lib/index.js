var _ = require('lodash');
var Promise = require('bluebird');

var logwrangler = require('logwrangler');
var expressWrangler = require('express-wrangler');
var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var compression = require('compression');
var cookieParser = require('cookie-parser');

/**
	config: {
		port: 9000,
		staticFiles: null
		bodyParser: {
			{ name: 'json' },
			{
				name: 'urlencoded',
				options: {
					extended: true
				}
			}
		}
	}
*/
function Webserver(config){
	var self = this;

	config = self.config = _.defaults(config || {}, {
		port: 9000,
		bodyParser: [{
			name: 'json',
			// options: {}
		}],
		lazyInit: false
	});
	console.log(config);
	self.initialized = false;
	self.beforeInitStack = [];

	var server = self.server = express();
	var logger = self.logger = logwrangler.create({
		logOptions: { ns: config.name || 'webserver' }
	}, true);

	_.each(config.bodyParser, function(parser){
		server.use(bodyParser[parser.name](parser.options || {}));
	});
	
	server.use(compression());
	server.use(cookieParser());

	if(config.staticFiles){
		var staticFiles;
		if(_.isString(serveStatic)){
			staticFiles = serveStatic(config.staticFiles);
		} else {
			// takes the same arguments as the serveStatic initialize
			staticFiles = serveStatic.apply(serveStatic, [config.staticFiles]);
		}
		server.use(staticFiles);
	}

	if(!config.lazyInit){
		self.initialize();
	}
}

Webserver.prototype.beforeInitialize = function(fn){
	var self = this;

	if(typeof fn === 'function'){
		self.beforeInitStack.push(fn);
	} else if(_.isArray(fn)){
		self.beforeInitStack.push.apply(self.beforeInitStack, fn);
	}
};

Webserver.prototype.initialize = function(){
	var self = this;
	
	if(self.initialized){
		return;
	}
	
	self.server.use(expressWrangler({ logger: self.logger }));

	_.each(self.beforeInitStack, function(fn){
		self.server.use(fn);
	});
	
	self.initialized = true;
};

Webserver.prototype.use = function(){
	var self = this;

	self.server.use.apply(self.server, _.values(arguments));
};

Webserver.prototype.listen = function(){
	var self = this;

	return new Promise(function(resolve, reject){
			
		try {
			self.initialize();

			self.server.listen(self.config.port, function(){
				self.logger.info({
					message: 'server listening on port ' + self.config.port
				});
				return resolve();
			});
		} catch(e){
			reject(e);
		}
	});
};


function Create(config){
	return new Webserver(config);
}

Create.express = express;

module.exports = Create;
