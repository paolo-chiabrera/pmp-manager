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
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  loggly: {
    token: {
      doc: 'The Loggly token.',
      default: '',
      env: 'NODE_LOGGLY_TOKEN'
    },
    subdomain: {
      doc: 'The Loggly subdomain.',
      default: '',
      env: 'NODE_LOGGLY_SUBDOMAIN'
    },
    threshold: {
      doc: 'The Loggly threshold.',
      default: 10,
      env: 'NODE_LOGGLY_THRESHOLD'
    },
    timeout: {
      doc: 'The Loggly timeout.',
      default: 5000,
      env: 'NODE_LOGGLY_TIMEOUT'
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
    default: 8080,
    env: 'NODE_PORT'
  }
});

// Load environment dependent configuration
// const env = conf.get('env');
// conf.loadFile('./config/' + env + '.json');

// Perform validation
conf.validate({
  strict: true
});

module.exports = conf;
