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
      const { scrapePageBySourceId } = req.server.methods;
      const { config } = req.server.settings;
      const { scraper } = config.pmpScheduler;

      scrapePageBySourceId({
        options: scraper,
        pageNumber,
        sourceId
      }, (err, res) => {
        reindexImages(scraper);

        if (err) {
          reply(err).code(500);
          return;
        }

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
      const { scrapeSourceById } = req.server.methods;
      const { config } = req.server.settings;
      const { scraper } = config.pmpScheduler;

      scrapeSourceById({
        onScrapePage: (err, res) => {
          if (err) {
            req.server.log(['error', 'scrape-page'], err);
            return;
          }

          req.server.log(['info', 'scrape-page'], res);
        },
        options: scraper,
        sourceId
      }, (err, res) => {
        reindexImages(scraper);

        if (err) {
          req.server.log(['error', 'scrape-source-error'], err);
          return;
        }

        req.server.log(['info', 'scrape-source-done'], res);
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
