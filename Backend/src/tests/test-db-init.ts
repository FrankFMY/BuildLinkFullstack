import { setupTestDB } from './setup';
import mongoose from 'mongoose';

let mongo: any;

beforeAll(async () => {
    mongo = await setupTestDB();
});

beforeEach(async () => {
    if (!mongoose.connection.db) return;
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongo && mongo.stop) await mongo.stop();
});
