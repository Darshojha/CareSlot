const serverless = require('serverless-http');

let handlerPromise;

async function getHandler() {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      const { connectDB } = await import('../backend/config/db.js');
      await connectDB(process.env.MONGO_URI);
      const { default: app } = await import('../backend/app.js');
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
    handlerPromise = null;
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
