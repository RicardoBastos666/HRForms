const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function connectToDb() {
  try {
    await client.connect();
    const db = client.db('test');
    const users = db.collection('users');
    console.log('Connected to database');
    return { db, users };
  } catch (err) {
    console.error('Error connecting to DB:', err);
  }
}
module.exports = { connectToDb };