
requirejs.config({
    baseUrl: 'js/app',
    definePrim: 'prim',
    paths: {
      promise: '../lib/requirejs-promise',
      domReady: '../lib/requirejs-domready'
    }
});

requirejs(['main']);
