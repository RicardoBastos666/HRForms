const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function connectToDb() {
  try {
    await client.connect();
    const db = client.db('VI_RHeval');
    const users = db.collection('users');
    console.log('Connected to database');
    return users;
  } catch (err) {
    console.error('Error connecting to DB:', err);
  }
}

module.exports = { connectToDb };