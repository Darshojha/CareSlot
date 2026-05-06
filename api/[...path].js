const serverless = require('serverless-http');

let appPromise;
let bootPromise;

async function loadApp() {
  if (!appPromise) {
    appPromise = import('../backend/app.js').then((mod) => mod.default || mod);
  }
  return appPromise;
}

async function boot() {
  if (!bootPromise) {
    bootPromise = (async () => {
      const { connectDB } = await import('../backend/config/db.js');
      await connectDB(process.env.MONGO_URI);
    })();
  }
  return bootPromise;
}

module.exports = async (req, res) => {
  await boot();
  const app = await loadApp();
  return serverless(app)(req, res);
};
