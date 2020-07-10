const {createProxyMiddleware} = require('http-proxy-middleware');

console.log("proxy setup")

module.exports = function (app) {
  app.use(createProxyMiddleware('/api', {
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );
  app.use(createProxyMiddleware('/api-ws', {
      target: 'http://localhost:8080',
      changeOrigin: true,
      ws: true,
    })
  );
};
