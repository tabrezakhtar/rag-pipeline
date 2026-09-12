const { MongoClient } = require("mongodb");

require('dotenv').config();
const uri = process.env.MONGO_URL;

const client = new MongoClient(uri);

async function renameDatabase() {
    await client.connect();

    const source = client.db("VectorTest");
    const temp = client.db("VectorTest_temp");

    const collections = await source.listCollections().toArray();

    for (const { name } of collections) {
        const sourceCollection = source.collection(name);
        const tempCollection = temp.collection(name);

        const documents = await sourceCollection.find({}).toArray();

        if (documents.length > 0) {
            await tempCollection.insertMany(documents);
        }

        const indexes = await sourceCollection.listIndexes().toArray();

        for (const index of indexes) {
            if (index.name === "_id_") continue;

            await tempCollection.createIndex(index.key, {
                name: index.name,
                ...index,
            });
        }

        console.log(`Copied: ${name}`);
    }

    console.log("Copied VectorTest → VectorTest_temp");

    // Remove original
    await source.dropDatabase();
    console.log("Dropped VectorTest");

    // Copy temp → final lowercase database
    const finalDb = client.db("vectortest");
    const tempCollections = await temp.listCollections().toArray();

    for (const { name } of tempCollections) {
        const tempCollection = temp.collection(name);
        const finalCollection = finalDb.collection(name);

        const documents = await tempCollection.find({}).toArray();

        if (documents.length > 0) {
            await finalCollection.insertMany(documents);
        }

        const indexes = await tempCollection.listIndexes().toArray();

        for (const index of indexes) {
            if (index.name === "_id_") continue;

            await finalCollection.createIndex(index.key, {
                name: index.name,
                ...index,
            });
        }

        console.log(`Copied: ${name}`);
    }

    await temp.dropDatabase();

    console.log("Done: VectorTest → vectortest");

    await client.close();
}

renameDatabase().catch(async error => {
    console.error(error);
    await client.close();
});