var _ = require('lodash');
var assert = require('assert');

var Webserver = require('../');

describe('defaultServer', function(){
	
	it('should have default config', function(done){
		
		var server = Webserver();

		assert.equal(server.config.port, 9000);
		assert.deepEqual(server.config.bodyParser, {
			json: true
		});
		assert.equal(server.config.lazyInit, false);
		done();
	});

	it('should initialize by default', function(done){
		var server = Webserver();

		assert.ok(server.initialized);
		done();
	});

	it('should return an instance with set config values', function(done){
		var config = {
			lazyInit: true,
			port: 8000,
			staticFiles: false,
			bodyParser: {
				urlencoded: true
			}
		};

		var server = Webserver(config);

		assert.deepEqual(server.config, config);
		done();
	});
	
	it('should not be initialized when using lazyInit', function(done){
		var server = Webserver({
			lazyInit: true
		});

		assert.equal(server.initialized, false);
		done();
	});
});
