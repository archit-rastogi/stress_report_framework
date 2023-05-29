const PROXY_CONFIG = [
  {
      context: ["/back"],
      target: 'http://10.9.8.199:9999',
      secure: false,
      changeOrigin: true,
  },
  {
      context: ["/files"],
      target: 'http://localhost:9998',
      secure: false,
      changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;

process.addListener('uncaughtException', (e) => {
    console.warn(e);
});
