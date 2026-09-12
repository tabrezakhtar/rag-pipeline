require('dotenv').config();
const { MongoClient } = require('mongodb');

const { MONGO_URL, MONGO_DB_NAME } = process.env;

async function main() {
  const client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const db = client.db(MONGO_DB_NAME);
    const records = await db.collection('embeddings').find({}).toArray();
    console.log(records);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
