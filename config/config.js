'use strict';

const convict = require('convict');

// Define a schema
const conf = convict({
  app: {
    name: {
      doc: 'The applicaton name.',
      default: 'pmp-manager',
      env: 'NODE_APP_NAME'
    }
  },
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test', 'local'],
    default: 'development',
    env: 'NODE_ENV'
  },
  host: {
    doc: 'The applicaton host.',
    default: 'localhost',
    env: 'VIRTUAL_HOST'
  },
  squeeze: {
    args: {
      doc: 'The applicaton environment.',
      default: [{
        error: '*',
        log: '*',
        ops: '*',
        response: '*'
      }]
    }
  },
  pmpScheduler: {
    scheduler: {
      refreshInterval: {
        doc: 'The scheduler refresh interval.',
        default: 30000,
        env: 'NODE_SCHEDULER_REFRESH_INTERVAL'
      }
    },
    scraper: {
      folderPath: {
        doc: 'The images destination folder.',
        default: './images',
        env: 'NODE_SCRAPER_FOLDER'
      },
      pmpApiUrl: {
        doc: 'The pmpApi endpoint.',
        default: 'http://api.dev.picmeplease.eu',
        env: 'NODE_PMP_API_URL'
      },
      request: {
        headers: {
          Authorization: {
            doc: 'The auth token.',
            default: '',
            env: 'NODE_PMP_API_AUTH'
          }
        }
      }
    }
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8081,
    env: 'NODE_PORT'
  },
  trace: {
    doc: 'The flag to enable Trace.',
    default: false,
    env: 'NODE_TRACE'
	},
  winston: {
    file: {
      filename: {
        doc: 'The log filename.',
        default: './logs/pmp_manager.log',
        env: 'NODE_WINSTON_FILENAME'
      }
    }
  }
});

// Load environment dependent configuration
const env = conf.get('env');
conf.loadFile('./config/' + env + '.json');

// Perform validation
conf.validate({
  strict: true
});

module.exports = conf;
