'use strict';

const ENVS = {
  PROD: 'production',
  DEV: 'development',
  TEST: 'test'
};

/*
* force exit
*/
process.on('SIGINT', function() {
  process.exit();
});
/*
* load config
*/
const config = require('./config/config.js').get();
/*
* define app
*/
const Hapi = require('hapi');
const Good = require('good');
const Pack = require('./package');
/*
* define logger
*/
const winston = require('winston');
const logger = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.Console)({
      colorize: true
    })
  ]
});

if (config.env !== ENVS.TEST) {
  logger.add(winston.transports.File, {
    filename: config.winston.file.filename,
    logstash: true,
    maxFiles: 10,
    maxsize: 2 * 1024 * 1024,
    tailable: true,
    zippedArchive: true
  });
}

const server = new Hapi.Server();

server.settings.config = config;

server.connection({
  port: config.port
});

/*
* routes
*/
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply({
      message: 'Welcome to PMP Manager.',
      version: Pack.version
    });
  }
});

/*
* register plugins
*/
const reporters = {
  winston: [
    {
      module: 'good-squeeze',
      name: 'Squeeze',
      args: config.squeeze.args
    }, {
      module: 'good-winston-object',
      args: [logger]
    }]
};

server.register([{
  register: Good,
  options: {
    ops: {
      interval: 900000 // 15 mins
    },
    reporters
  }
}, {
  register: require('./plugins/scraper/scraper.plugin.js')
}, {
  register: require('blipp'),
  options: {
    showAuth: true,
    showStart: true
  }
}, {
  register: require('inert')
}, {
  register: require('vision')
}, {
  register: require('hapi-swagger'),
  options: {
    schemes: ['http'],
    auth: false,
    host: config.host + (config.env === ENVS.PROD ? '' : ':' + config.port), // fix swagger issue with port and urls
    documentationPage: true,
    swaggerUI: true,
    documentationPath: '/docs',
    info: {
      title: 'Picmeplease Scraper API Documentation',
      version: Pack.version
    }
  }
}], (err) => {
  server.log(['info', 'config'], config);

  if (err) {
    throw err; // something bad happened loading the plugin
  }

  server.start((err) => {
    if (err) {
      throw err;
    }

    server.log(['info'], 'Server running at: ' + server.info.uri);
  });
});

module.exports = server;
