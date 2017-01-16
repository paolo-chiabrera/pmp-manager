'use strict';

const Joi = require('joi');
const Wreck = require('wreck');

function reindexImages (args = {}, done = () => {}) {
  const { pmpApiUrl, request } = args;

  const options = {
    baseUrl: pmpApiUrl,
    headers: request.headers
  };

  Wreck.request('post', '/images/reindex', options, done);
}

/* routes */

module.exports.scrapePageBySourceId = {
  method: 'POST',
  path: '/scrape/source/{sourceId}/page/{pageNumber}',
  config: {
    handler: (req, reply) => {
      const { pageNumber, sourceId } = req.params;
      const { server } = req;
      const { scrapePageBySourceId } = server.methods;
      const { config } = server.settings;
      const { scraper } = config.pmpScheduler;

      scrapePageBySourceId({
        options: scraper,
        pageNumber,
        sourceId
      }, (err, res) => {
        if (err) {
          server.log(['error', 'scrape-page-error'], err);
          reply(err);
          return;
        }

        reindexImages(scraper);

        reply(res);
      });
    },
    tags: ['api', 'scrapePageBySourceId'],
    description: 'scrapePageBySourceId',
    notes: 'Returns the report',
    validate: {
      params: {
        pageNumber: Joi.number().required().description('pageNumber'),
        sourceId: Joi.string().min(1).required().description('sourceId')
      }
    }
  }
};

module.exports.scrapeSourceById = {
  method: 'POST',
  path: '/scrape/source/{sourceId}',
  config: {
    handler: (req, reply) => {
      const { sourceId } = req.params;
      const { server } = req;
      const { scrapeSourceById } = server.methods;
      const { config } = server.settings;
      const { scraper } = config.pmpScheduler;

      scrapeSourceById({
        onScrapePage: (err, res) => {
          if (err) {
            server.log(['error', 'scrape-page'], err);
            return;
          }

          server.log(['info', 'scrape-page'], res);
        },
        options: scraper,
        sourceId
      }, (err, res) => {
        if (err) {
          server.log(['error', 'scrape-source-error'], err);
          return;
        }

        reindexImages(scraper);

        server.log(['info', 'scrape-source-done'], res);
      });

      reply('started scraping: ' + sourceId);
    },
    tags: ['api', 'scrapeSourceById'],
    description: 'scrapeSourceById',
    notes: 'Returns the report',
    validate: {
      params: {
        sourceId: Joi.string().min(1).required().description('sourceId')
      }
    }
  }
};
