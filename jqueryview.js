/**
 * jqueryview.js
 *
 * pub-pkg-spa nav handler for jquery single-page-app views
 * listens for 'nav', 'loaded', and 'updatedText' events
 * emits 'update-view' when content has been replaced
 *
 * minimize html replacements by looking for attributes
 * data-render-layout
 * data-render-page
 * data-render-html
 *
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
**/

module.exports = function(generator) {

  var opts = generator.opts;
  var u = generator.util;
  var lang = generator.handlebars.pageLang;
  var log = opts.log;

  // if there is no data-render-layout attribute, updateLayout does nothing
  var $layout = $('[data-render-layout]');

  // cache last page - TODO - find lastPage using location on startup
  var lastPage = null;

  var view = {
    start: start, // call start() after views are created
    stop: stop    // call stop() before views are deleted
  };

  return view;

  function start() {
    generator.on('nav', updatePage);         // SPA click
    generator.on('loaded', reloadPage);      // full reload after structural edit
    generator.on('updatedText', updateHtml); // editor update
  }

  function stop() {
    generator.off('nav', updatePage);
    generator.off('loaded', reloadPage);
    generator.off('updatedText', updateHtml);
  }

  function reloadPage() {
    if (!lastPage) return;
    if (!$layout.length) { updatePage(lastPage); }
    else { updateLayout(lastPage); }
  }

  function updatePage(page) {
    if (layoutChanged(page)) return updateLayout(page);
    var $page = $('[data-render-page]');
    if (!$page.length) return log('jqueryview cannot update page ' + path);
    updateDOM($page, generator.renderPage(page), title(page));
    lastPage = page;
  }

  function updateLayout(page) {
    if (!page || !$layout.length) return;
    var layout = generator.layoutTemplate(page);
    updateDOM($layout, generator.renderLayout(page), title(page));
    lastPage = page;
  }

  function title(page) {
    return page.title || page.name || u.unslugify(page._href);
  }

  // return true if new layout is different from current page layout
  function layoutChanged(page) {
    if (!$layout.length) return false;
    if (!lastPage || lastPage.fixlayout || lang(lastPage) !== lang(page)) return true;
    var currentlayout = $layout.attr('data-render-layout') || 'main-layout';
    var newlayout = generator.layoutTemplate(page);
    return (newlayout !== currentlayout);
  }

  // this won't work if the href of a fragment is edited
  function updateHtml(href) {
    var fragment = generator.fragment$[href];
    if (!fragment) return log('jqueryview cannot find fragment: ' + href);
    var $html = $('[data-render-html="' + href + '"]');
    if (!$html.length) return log('jqueryview cannot update html for fragment: ' + href);
    updateDOM($html, generator.renderHtml(fragment));
  }

  function updateDOM($view, html, title) {
    generator.emit('before-update-view', $view);
    $view.replaceWith(html);
    if (title) { document.title = title; }
    generator.emit('after-update-view', $view);
  }

}
