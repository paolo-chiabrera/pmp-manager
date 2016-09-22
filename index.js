/*
* load config
*/
const config = require('./config/config.js').get();

/*
* define app
*/
const Hapi = require('hapi');
const Good = require('good');

const server = new Hapi.Server();

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
    reply({message: 'Welcome to PMP Manager.'});
  }
});

/*
* register plugins
*/
const reporters = {
  console: [
    {
      module: 'good-squeeze',
      name: 'Squeeze',
      args: config.squeeze.args
    }, {
      module: 'good-console'
    },
    'stdout'
  ]
};

if (config.env === 'production') {
  reporters.loggly = [{
    module: 'good-squeeze',
    name: 'Squeeze',
    args: config.squeeze.args
  }, {
    module: 'good-loggly',
    args: [{
      token: config.loggly.token,
      subdomain: config.loggly.subdomain,
      tags: ['pmp-manager'],
      name: 'pmp-manager',
      hostname: 'manager.picmeplease.eu',
      threshold: config.loggly.threshold,
      maxDelay: config.loggly.timeout
    }]
  }]
}

server.register([{
  register: Good,
  options: {
    ops: {
      interval: 900000 // 15 mins
    },
    reporters
  }
}, {
  register: require('./plugins/pmp-scheduler'),
  options: config.pmpScheduler
}], (err) => {

  server.log(['info', 'reporters'], {
    reporters: Object.keys(reporters)
  });
  
  server.log(['info', 'config'], config);

  if (err) {
    throw err; // something bad happened loading the plugin
  }

  server.start((err) => {
    if (err) {
      throw err;
    }

    server.log('info', 'Server running at: ' + server.info.uri);
  });
});

module.exports = server;
