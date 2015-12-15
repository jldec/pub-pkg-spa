/*
 * pub pkg-spa.js generator-plugin
 *
 * client-side router (visionmedia/page) plugin for pub-generator
 * translates click events for intra-site links to generator.nav events
 * generator.nav events are then handled by jqueryview
 *
 * initialize by calling pager = generator.initPager();
 * pager.page will be set to the current page object, maintained after each nav
 *
 * NOTE: uses history.pushState, which doesn't work in older browers
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 *
*/
var debug = require('debug')('pub:spa');
var qs = require('querystring');

module.exports = function(generator) {

  // mixin
  generator.initPager = function initPager() {

    var u = generator.util;
    var opts = generator.opts;
    var log = opts.log;

    // bind jqueryview
    var jqv = require('./jqueryview')(generator);
    jqv.start();

    // https://github.com/visionmedia/page.js
    var pager = require('page');

    // initialize with current page
    var href = u.get(pubRef, 'href', location.pathname)
    pager.page = generator.page$[href];
    debug('init ' + decodeURI(location) + (pager.page ? ' (ok)' : ' (undefined page)'));

    pager('*', function(ctx, next) {
      var path = ctx.path;

      // strip origin from fq urls
      path = u.unPrefix(path, opts.appUrl);

      // strip static root (see /server/client/init-opts.js)
      path = u.unPrefix(path, opts.staticRoot);

      var page = generator.findPage(path);

      if (!page) {
        log('pager miss', path);
        return next();
      }

      pager.page = page;

      // simulate server-side request
      generator.req = { query: u.parseUrlParams('?' + ctx.querystring) };

      // update view in DOM
      log('nav ' + decodeURI(path));
      generator.emit('nav', page);
    });

    // start pager
    pager( { decodeURLComponents:false, dispatch:false } ); // auto-dispatch loses hash.

    return pager;
  };
}
