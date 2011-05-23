/*!
 * Ext JS Connect
 * Copyright(c) 2010 Antono Vasiljev
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var url = require('url');
var maxAge = 86400; //1 day

/**
 * Setups access for CORS requests.
 * http://www.w3.org/TR/cors/
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

/*
 * The resource sharing policy described by w3c specification is bound to a particular resource.
 * Each resource is bound to the following:
 *
 * - A list of origins consisting of zero or more origins that are allowed access to the resource.
 * - A list of methods consisting of zero or more methods that are supported by the resource.
 * - A list of headers consisting of zero or more header field names that are supported by the resource.
 * - A supports credentials flag that indicates whether the resource supports user credentials
 *   in the request. It is true when the resource does and false otherwise.
 */
// corsOptions = {
//     '/resource': {
//         origins: ['http://w3.org', ...],
//         methods: ['GET', 'POST', 'PUT', ...],
//         headers: ['X-Header-For', ...],
//         credentails: true,
//     },
//     '/resource2': { ... },
// }
module.exports = function corsSetup(options) {
  var corsConfig = options || [];

  return function corsHandle(req, res, next) {
    // none cross origin request
    if (!req.headers.origin) {
      return next();
    }

    var origin = req.headers.origin,
    resource = url.parse(req.url).pathname,
    resourceConfig = corsConfig[resource];

    if (resourceConfig) {
      // wrap writeHead
      var writeHead = res.writeHead;
      res.writeHead = function(status, headers) {
        headers = headers || {};
        if (resourceConfig.origins && resourceConfig.origins.indexOf(origin) !== -1) {
          headers['Access-Control-Allow-Origin'] = origin;
          if (resourceConfig.credentails) {
            headers['Access-Control-Allow-Credentials'] = true;
          }
          // preflight
          if (req.method === 'OPTIONS') {
            headers['Access-Control-Max-Age'] = maxAge;

            if (req.headers['Access-Control-Request-Method'] && resourceConfig.methods.indexOf(req.headers['Access-Control-Request-Method']) !== -1) {
              headers['Access-Control-Allow-Methods'] = req.headers['Access-Control-Request-Method'];
            }

            if (req.headers['Access-Control-Request-Headers'] && resourceConfig.headers.indexOf(req.headers['Access-Control-Request-Headers']) !== -1) {
              headers['Access-Control-Allow-Headers'] = req.headers['Access-Control-Request-Headers'];
            }
          }
        }
        res.writeHead = writeHead;
        return res.writeHead(status, headers);
      }
      next();
    } else {
      next();
    }
  };
};
