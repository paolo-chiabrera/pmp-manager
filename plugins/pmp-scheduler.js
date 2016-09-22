const PmpScheduler = require('pmp-scheduler');

exports.register = function (server, options, next) {
  const pmpScheduler = new PmpScheduler(options);

  pmpScheduler.on('error', err => server.log(['error'], err));

  pmpScheduler.on('sources', data => server.log(['info', 'sources'], data));

  pmpScheduler.on('jobs', data => server.log(['info', 'jobs'], data));

  pmpScheduler.on('job-start', sourceId => server.log(['info', 'job-start', sourceId]));

  pmpScheduler.on('job-end', (sourceId, code) => server.log(['info', 'job-end', sourceId], {code}));

  pmpScheduler.on('job-message', (sourceId, msg) => {
    switch (msg.type) {
      case 'error':
        server.log(['error', 'job-message', sourceId, msg.name], {
          [msg.name]: msg.data
        });
        break;
      default:
        server.log(['info', 'job-message', sourceId, msg.name], {
          [msg.name]: msg.data
        });
    }
  });

  pmpScheduler.init();

  next();
};

exports.register.attributes = {
  name: 'pmp-scheduler'
};
