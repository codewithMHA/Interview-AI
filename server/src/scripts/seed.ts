import { connectDB } from '../config/db.js';
import { autoSeedDatabase } from '../utils/autoSeed.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    const connected = await connectDB();
    if (!connected) {
      console.warn('[Seed] MongoDB not connected. Skipping database seeding.');
      process.exit(0);
    }

    console.log('[Seed] Running comprehensive database auto-seeding...');
    const result = await autoSeedDatabase();
    console.log(
      `✅ [Seed] Done! Active items: ${result.questions} Questions, ${result.problems} Coding Problems, ${result.roadmaps} Roadmaps.`
    );

    process.exit(0);
  } catch (error: any) {
    console.error('❌ [Seed] Error during seeding:', error.message);
    process.exit(1);
  }
};

seedDatabase();

