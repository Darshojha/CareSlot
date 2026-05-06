const serverless = require('serverless-http');

let appPromise;

async function loadApp() {
  if (!appPromise) {
    appPromise = import('../backend/app.js').then((mod) => mod.default || mod);
  }
  return appPromise;
}

module.exports = async (req, res) => {
  const app = await loadApp();
  return serverless(app)(req, res);
};
