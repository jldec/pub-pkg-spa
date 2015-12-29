// pub-pkg-spa pub-config.js

module.exports =
{ 'pub-pkg':'pub-pkg-spa',

  sources: [
  ],

  browserScripts: [
  ],

  staticPaths: [
    { path:'./spa-menu.css', route:'/css', inject:true }
  ],

  generatorPlugins: [
    './pager.js'
  ]
};
