'use strict';
const _ = require('lodash');
const pmpScraper = require('pmp-scraper');

const routes = require('./scraper.routes');

exports.register = function (server, options, next) {
  const keys = _.keys(pmpScraper);

  _.each(keys, (method) => {
    server.method({
      name: method,
      method: pmpScraper[method]
    });
  });

  // add all the routes exposed by the plugin
  _.each(routes, route => server.route(route));

  next();
};

exports.register.attributes = {
  name: 'pmp-scraper'
};
