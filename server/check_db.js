import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections found:');
    for (let c of collections) {
      const count = await mongoose.connection.db.collection(c.name).countDocuments();
      console.log(`- ${c.name}: ${count} documents`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkDB();
