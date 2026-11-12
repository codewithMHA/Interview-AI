const { createApp } = require('../server/dist/app.js');
const { connectDB } = require('../server/dist/config/db.js');
const { autoSeedDatabase } = require('../server/dist/utils/autoSeed.js');

let appInstance = null;
let seedPromise = null;

module.exports = async (req, res) => {
  const connected = await connectDB();
  if (connected && !seedPromise) {
    seedPromise = autoSeedDatabase().catch((err) => {
      console.warn('[Vercel API] AutoSeed notice:', err.message);
    });
  }
  if (seedPromise) {
    await seedPromise;
  }

  if (!appInstance) {
    appInstance = createApp();
  }
  return appInstance(req, res);
};

