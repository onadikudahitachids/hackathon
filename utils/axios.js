// Use axios' .create() method to create an instance with overridden defaults/config, and export
const https = require('https');

const axios = require('axios').create({
  timeout: 120000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

module.exports = axios;