const serverless = require('serverless-http');

let handlerPromise;

async function getHandler() {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      const appModule = await import('../backend/app.js');
      const app = appModule.default || appModule;
      return serverless(app);
    })();
  }
  return handlerPromise;
}

module.exports = async (req, res) => {
  try {
    const handler = await getHandler();
    return handler(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    handlerPromise = null;
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
