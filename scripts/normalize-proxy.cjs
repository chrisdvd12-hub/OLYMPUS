// Development server only. Reverse proxies can append X-Forwarded-Proto values.
// Expo expects one scheme when constructing the Expo Go launchAsset URL.
const { Server } = require('node:http');
const originalEmit = Server.prototype.emit;
Server.prototype.emit = function (event, ...args) {
  if (event === 'request') {
    const request = args[0];
    const forwarded = request?.headers?.['x-forwarded-proto'];
    if (typeof forwarded === 'string' && forwarded.includes(',')) {
      const scheme = forwarded.split(',')[0].trim().toLowerCase();
      if (scheme === 'http' || scheme === 'https') {
        request.headers['x-forwarded-proto'] = scheme;
      }
    }
  }
  return originalEmit.call(this, event, ...args);
};
